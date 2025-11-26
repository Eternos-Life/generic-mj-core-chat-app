// src/prompts/index.ts
// Simplified exports for Sven Janszky Futurist Digital Twin

// Export the main instructions (this is what chat-interface.tsx imports)
export {
  DEFAULT_INSTRUCTIONS,
  SVEN_JANSZKY_IDENTITY,
  SVEN_JANSZKY_SEARCH_RULES,
  SVEN_JANSZKY_CONVERSATION_STYLE,
  SVEN_JANSZKY_CONTEXT_INFO
} from './sven-janszky-instructions';

// Legacy exports for backward compatibility
export {
  SVEN_JANSZKY_IDENTITY as TIM_WOLFF_IDENTITY,
  SVEN_JANSZKY_SEARCH_RULES as TIM_WOLFF_SEARCH_RULES,
  SVEN_JANSZKY_CONVERSATION_STYLE as TIM_WOLFF_CONVERSATION_STYLE,
  SVEN_JANSZKY_CONTEXT_INFO as TIM_WOLFF_CONTEXT_INFO
} from './sven-janszky-instructions';

// Type definitions for advanced usage (if needed later)
export interface PromptConfig {
  includeSearchRules?: boolean;
  includeStyleGuidelines?: boolean;
  scenario?: 'default' | 'megatrends' | 'business-futures' | 'tech-disruption';
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
    const { DEFAULT_INSTRUCTIONS } = require('./sven-janszky-instructions');
    return DEFAULT_INSTRUCTIONS;
  }

  static buildDefault(): string {
    return new PromptBuilder().build();
  }
}

export const buildDefaultPrompt = () => PromptBuilder.buildDefault();
