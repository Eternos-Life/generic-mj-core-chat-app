// src/stores/chatStore.ts
// @ts-nocheck
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createPersistenceMiddleware, type WithPersistence } from './middleware/persistence';

export interface Message {
  type: "user" | "assistant" | "status" | "error" | "debug" | "special";
  content: string;
  timestamp?: Date;
}

interface ChatState {
  // Messages
  messages: Message[];
  currentMessage: string;
  
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  sessionId: string;
  
  // Audio state
  isRecording: boolean;
  hasRecording: boolean;
  
  // UI state
  isDeveloperMode: boolean;
  configLoaded: boolean;
  
  // Hydration state for SSR
  hasHydrated: boolean;
  
  // Actions
  addMessage: (message: Message) => void;
  updateMessage: (index: number, content: string) => void;
  updateLastMessage: (content: string) => void;
  setCurrentMessage: (message: string) => void;
  setConnectionState: (connected: boolean, connecting?: boolean) => void;
  setRecordingState: (recording: boolean) => void;
  setSessionId: (id: string) => void;
  setDeveloperMode: (enabled: boolean) => void;
  setConfigLoaded: (loaded: boolean) => void;
  clearMessages: () => void;
  setHasHydrated: () => void;
  // New: Replace entire messages array (for compatibility with existing code)
  setMessages: (messages: Message[]) => void;
  // New: Individual connection state setters for more granular control
  setIsConnected: (connected: boolean) => void;
  setIsConnecting: (connecting: boolean) => void;
  // New: Individual recording state setters
  setIsRecording: (recording: boolean) => void;
  setHasRecording: (hasRecording: boolean) => void;
}

// Enhanced ChatState with persistence capabilities
type EnhancedChatState = WithPersistence<ChatState>;

// Create the base store creator (your existing logic)
const createChatStore = (set: any, get: any) => ({
  // Initial state
  messages: [],
  currentMessage: "",
  isConnected: false,
  isConnecting: false,
  sessionId: "",
  isRecording: false,
  hasRecording: false,
  isDeveloperMode: true,
  configLoaded: false,
  hasHydrated: false,
  
  // Actions (keeping all your existing functionality)
  addMessage: (message: Message) => 
    set((state: any) => ({ 
      messages: [...state.messages, message] 
    }), false, 'addMessage'),
    
  updateMessage: (index: number, content: string) =>
    set((state: any) => ({
      messages: state.messages.map((msg: any, i: number) => 
        i === index ? { ...msg, content } : msg
      )
    }), false, 'updateMessage'),

  updateLastMessage: (content: string) =>
    set((state: any) => {
      if (state.messages.length === 0) return state;
      const newMessages = [...state.messages];
      newMessages[newMessages.length - 1] = {
        ...newMessages[newMessages.length - 1],
        content
      };
      return { messages: newMessages };
    }, false, 'updateLastMessage'),
    
  setCurrentMessage: (message: string) => 
    set({ currentMessage: message }, false, 'setCurrentMessage'),
    
  setConnectionState: (connected: boolean, connecting = false) =>
    set({ 
      isConnected: connected, 
      isConnecting: connecting 
    }, false, 'setConnectionState'),
    
  setRecordingState: (recording: boolean) =>
    set({ isRecording: recording }, false, 'setRecordingState'),
    
  setSessionId: (id: string) =>
    set({ sessionId: id }, false, 'setSessionId'),
    
  setDeveloperMode: (enabled: boolean) =>
    set({ isDeveloperMode: enabled }, false, 'setDeveloperMode'),
    
  setConfigLoaded: (loaded: boolean) =>
    set({ configLoaded: loaded }, false, 'setConfigLoaded'),
    
  clearMessages: () =>
    set({ messages: [] }, false, 'clearMessages'),
    
  setHasHydrated: () =>
    set({ hasHydrated: true }, false, 'setHasHydrated'),

  setMessages: (messages: Message[]) =>
    set({ messages }, false, 'setMessages'),

  // Individual setters
  setIsConnected: (connected: boolean) =>
    set({ isConnected: connected }, false, 'setIsConnected'),

  setIsConnecting: (connecting: boolean) =>
    set({ isConnecting: connecting }, false, 'setIsConnecting'),

  // Individual recording setters
  setIsRecording: (recording: boolean) =>
    set({ isRecording: recording }, false, 'setIsRecording'),

  setHasRecording: (hasRecording: boolean) =>
    set({ hasRecording: hasRecording }, false, 'setHasRecording'),
});

// Create store with persistence middleware
export const useChatStore = create<EnhancedChatState>()(
  devtools(
    createPersistenceMiddleware(createChatStore),
    { name: 'chat-store' }
  )
);

// Hook to safely use the store with SSR
export const useHydratedChatStore = () => {
  const store = useChatStore();
  
  // Return safe defaults until hydrated
  if (!store.hasHydrated) {
    return {
      ...store,
      isDeveloperMode: true, // Safe default
      messages: [], // Safe default
      isConnected: false, // Safe default
      isConnecting: false, // Safe default
      sessionId: "", // Safe default
      isRecording: false, // Safe default
      hasRecording: false, // Safe default
      configLoaded: false, // Safe default
      currentMessage: "", // Safe default
      // Persistence defaults
      syncStatus: 'idle' as const,
      syncError: null,
      lastSyncAt: null,
      pendingOperations: 0,
      currentConversationId: null,
      failedOperations: [],
      savedMessageIds: new Set(),
      persistenceConfig: {
        enabled: true,
        debounceMs: 2000,
        maxRetries: 3,
        batchSize: 10,
        enableOptimisticUpdates: true
      }
    };
  }
  
  return store;
};

// Utility hooks for specific persistence features
export const usePersistenceStatus = () => {
  const store = useChatStore();
  return {
    syncStatus: store.syncStatus,
    syncError: store.syncError,
    lastSyncAt: store.lastSyncAt,
    pendingOperations: store.pendingOperations,
    failedOperations: store.failedOperations.length
  };
};

export const usePersistenceActions = () => {
  const store = useChatStore();
  return {
    saveCurrentConversation: store.saveCurrentConversation,
    retryFailedOperations: store.retryFailedOperations,
    togglePersistence: store.togglePersistence,
    updatePersistenceConfig: store.updatePersistenceConfig
  };
};