// src/prompts/index.ts
// Exports for Generic AI Digital Twin

// Export the main instructions (this is what chat-interface.tsx imports)
export {
  DEFAULT_INSTRUCTIONS,
  AVATAR_IDENTITY,
  AVATAR_SEARCH_RULES,
  AVATAR_CONVERSATION_STYLE,
  AVATAR_CONTEXT_INFO
} from './generic-persona-instructions';

// Type definitions for advanced usage (if needed later)
export interface PromptConfig {
  includeSearchRules?: boolean;
  includeStyleGuidelines?: boolean;
  scenario?: 'default' | 'custom';
  customInstructions?: string;
}

// Simple prompt builder if you ever need dynamic prompts
export class PromptBuilder {
  private config: PromptConfig;

  constructor(config: PromptConfig = {}) {
    this.config = {
      includeSearchRules: true,
      includeStyleGuidelines: true,
      scenario: 'default',
      ...config
    };
  }

  build(): string {
    const { DEFAULT_INSTRUCTIONS } = require('./generic-persona-instructions');
    return DEFAULT_INSTRUCTIONS;
  }

  static buildDefault(): string {
    return new PromptBuilder().build();
  }
}

export const buildDefaultPrompt = () => PromptBuilder.buildDefault();
