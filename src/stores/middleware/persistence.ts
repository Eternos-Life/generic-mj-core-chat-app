// src/stores/middleware/persistence.ts
// @ts-nocheck
import { PersistenceConfig, SyncStatus, FailedOperation } from '../types/persistence';
import { apiClient } from '../../lib/api/client';
import { messageToApiFormat, validateMessage } from '../../lib/api/transformers';
import type { Message } from '../chatStore';
import type { APIError, SyncStatus } from '../../lib/api/types';

// Configuration for persistence behavior
export interface PersistenceConfig {
  enabled: boolean;
  debounceMs: number;
  maxRetries: number;
  batchSize: number;
  enableOptimisticUpdates: boolean;
}

// Persistence state that will be added to your chat store
export interface PersistenceState {
  // Persistence config
  persistenceConfig: PersistenceConfig;
  
  // Current sync status
  syncStatus: SyncStatus;
  syncError: string | null;
  lastSyncAt: Date | null;
  pendingOperations: number;
  
  // Session and conversation IDs for persistence
  currentConversationId: string | null;
  
  // Queue for failed operations
  failedOperations: FailedOperation[];
}

// Failed operation for retry queue
export interface FailedOperation {
  id: string;
  type: 'create_message' | 'create_conversation' | 'create_session';
  data: any;
  attempts: number;
  lastAttemptAt: Date;
  error: APIError;
}

// Persistence actions that will be added to your chat store
export interface PersistenceActions {
  // Configuration
  updatePersistenceConfig: (config: Partial<PersistenceConfig>) => void;
  togglePersistence: () => void;
  
  // Manual operations
  saveCurrentConversation: () => Promise<void>;
  loadConversationHistory: (conversationId: string) => Promise<void>;
  retryFailedOperations: () => Promise<void>;
  clearSavedMessageTracking: () => void;
  
  // Internal operations (used by middleware)
  _setSyncStatus: (status: SyncStatus, error?: string) => void;
  _setPendingOperations: (count: number) => void;
  _setCurrentConversationId: (id: string | null) => void;
  _addFailedOperation: (operation: FailedOperation) => void;
  _removeFailedOperation: (id: string) => void;
}

// Combined interface for stores that use persistence
export type WithPersistence<T> = T & PersistenceState & PersistenceActions;

// Default configuration
const DEFAULT_CONFIG: PersistenceConfig = {
  enabled: true,
  debounceMs: 2000, // Wait 2 seconds after last message before saving
  maxRetries: 3,
  batchSize: 10,
  enableOptimisticUpdates: true
};

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Generate unique ID for operations
function generateOperationId(): string {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Persistence middleware factory
export function createPersistenceMiddleware<T extends object>(
  storeCreator: StateCreator<WithPersistence<T>, [], [], T>
): StateCreator<WithPersistence<T>, [], [], WithPersistence<T>> {
  return (set, get, api) => {
    // Debounced save function
    const debouncedSave = debounce(async () => {
      const state = get();
      if (!state.persistenceConfig.enabled) return;
      
      await savePendingMessages(state, set);
    }, DEFAULT_CONFIG.debounceMs);

    // Save pending messages to database
    const savePendingMessages = async (
      state: WithPersistence<T>,
      set: (partial: Partial<WithPersistence<T>>) => void
    ) => {
      // Skip if already syncing or no session
      if (state.syncStatus === 'syncing' || !(state as any).sessionId) {
        return;
      }

      try {
        set({ syncStatus: 'syncing', syncError: null });

        // Ensure we have a conversation
        let conversationId = state.currentConversationId;
        if (!conversationId) {
          conversationId = await createConversation(state);
          if (!conversationId) {
            throw new Error('Failed to create conversation');
          }
          set({ currentConversationId: conversationId });
        }

        // Get all messages and filter out already saved ones
        const allMessages = (state as any).messages as Message[] || [];
        
        // Create unique IDs for messages (content + timestamp combination)
        const messagesToSave = allMessages
          .filter(validateMessage)
          .map(msg => ({
            ...msg,
            uniqueId: `${msg.content}_${msg.timestamp?.getTime() || Date.now()}`
          }))
          .filter(msg => !state.savedMessageIds.has(msg.uniqueId));
        
        if (messagesToSave.length === 0) {
          set({ syncStatus: 'success', lastSyncAt: new Date() });
          return;
        }

        console.log(`💾 Saving ${messagesToSave.length} new messages to database`);

        // Save only new messages
        const savePromises = messagesToSave.map(async (message) => {
          const messageData = messageToApiFormat(
            message,
            conversationId!,
            state.sessionId,
            undefined // userId - we'll add this later when we have user management
          );

          return apiClient.createMessage(messageData);
        });

        await Promise.all(savePromises);

        // Mark messages as saved
        const newSavedIds = new Set([
          ...state.savedMessageIds,
          ...messagesToSave.map(msg => msg.uniqueId)
        ]);

        set({ 
          syncStatus: 'success', 
          lastSyncAt: new Date(),
          pendingOperations: 0,
          savedMessageIds: newSavedIds
        });

        console.log(`✅ ${messagesToSave.length} new messages synced to database`);

      } catch (error) {
        console.error('❌ Failed to sync messages:', error);
        const apiError = error as APIError;
        
        set({ 
          syncStatus: 'error', 
          syncError: apiError.message || 'Sync failed',
          pendingOperations: 0
        });

        // Add to failed operations queue for retry
        const failedOp: FailedOperation = {
          id: generateOperationId(),
          type: 'create_message',
          data: { messages: (state as any).messages },
          attempts: 1,
          lastAttemptAt: new Date(),
          error: apiError
        };

        set({ 
          failedOperations: [...state.failedOperations, failedOp] 
        });
      }
    };

    // Create conversation helper
    const createConversation = async (state: WithPersistence<T>): Promise<string | null> => {
      try {
        const result = await apiClient.createConversation({
          sessionId: state.sessionId,
          title: 'Voice Conversation',
          metadata: { 
            createdBy: 'voice-chat',
            timestamp: new Date().toISOString()
          }
        });

        return result.conversation.id;
      } catch (error) {
        console.error('❌ Failed to create conversation:', error);
        return null;
      }
    };

    // Create the enhanced store
    const baseStore = storeCreator(set, get, api);

    // Override addMessage to trigger persistence
    const originalAddMessage = (baseStore as any).addMessage;
    const enhancedAddMessage = (message: Message) => {
      // Call original addMessage first
      if (originalAddMessage) {
        originalAddMessage(message);
      }

      // Trigger debounced save
      const state = get();
      if (state.persistenceConfig.enabled && validateMessage(message)) {
        set({ pendingOperations: state.pendingOperations + 1 });
        debouncedSave();
      }
    };

    // Override clearMessages to also clear saved message tracking
    const originalClearMessages = (baseStore as any).clearMessages;
    const enhancedClearMessages = () => {
      if (originalClearMessages) {
        originalClearMessages();
      }
      // Clear saved message tracking when clearing messages
      set({ savedMessageIds: new Set<string>() });
    };

    return {
      ...baseStore,
      
      // Persistence state
      persistenceConfig: DEFAULT_CONFIG,
      syncStatus: 'idle' as SyncStatus,
      syncError: null,
      lastSyncAt: null,
      pendingOperations: 0,
      currentConversationId: null,
      failedOperations: [],
      savedMessageIds: new Set<string>(),

      // Enhanced addMessage
      addMessage: enhancedAddMessage,

      // Enhanced clearMessages
      clearMessages: enhancedClearMessages,

      // Persistence actions
      updatePersistenceConfig: (config) => {
        set({ 
          persistenceConfig: { ...get().persistenceConfig, ...config } 
        });
      },

      togglePersistence: () => {
        const currentConfig = get().persistenceConfig;
        set({ 
          persistenceConfig: { 
            ...currentConfig, 
            enabled: !currentConfig.enabled 
          } 
        });
      },

      saveCurrentConversation: async () => {
        const state = get();
        await savePendingMessages(state, set);
      },

      loadConversationHistory: async (conversationId: string) => {
        try {
          set({ syncStatus: 'syncing' });
          
          // This will be implemented when we add conversation loading
          console.log(`📜 Loading conversation history: ${conversationId}`);
          
          set({ 
            syncStatus: 'success',
            currentConversationId: conversationId 
          });
        } catch (error) {
          console.error('❌ Failed to load conversation:', error);
          set({ 
            syncStatus: 'error', 
            syncError: 'Failed to load conversation history' 
          });
        }
      },

      retryFailedOperations: async () => {
        const state = get();
        const retryableOps = state.failedOperations.filter(
          op => op.attempts < state.persistenceConfig.maxRetries
        );

        if (retryableOps.length === 0) return;

        console.log(`🔄 Retrying ${retryableOps.length} failed operations`);

        for (const op of retryableOps) {
          try {
            // Remove from failed operations
            set({ 
              failedOperations: state.failedOperations.filter(f => f.id !== op.id) 
            });

            // Retry the operation
            if (op.type === 'create_message') {
              await savePendingMessages(get(), set);
            }

          } catch (error) {
            // Add back to failed operations with incremented attempts
            const updatedOp: FailedOperation = {
              ...op,
              attempts: op.attempts + 1,
              lastAttemptAt: new Date(),
              error: error as APIError
            };

            set({ 
              failedOperations: [...get().failedOperations, updatedOp] 
            });
          }
        }
      },

      clearSavedMessageTracking: () => {
        set({ savedMessageIds: new Set<string>() });
      },

      // Internal actions
      _setSyncStatus: (status, error) => {
        set({ syncStatus: status, syncError: error || null });
      },

      _setPendingOperations: (count) => {
        set({ pendingOperations: count });
      },

      _setCurrentConversationId: (id) => {
        set({ currentConversationId: id });
      },

      _addFailedOperation: (operation) => {
        set({ 
          failedOperations: [...get().failedOperations, operation] 
        });
      },

      _removeFailedOperation: (id) => {
        set({ 
          failedOperations: get().failedOperations.filter(op => op.id !== id) 
        });
      }
    };
  };
}