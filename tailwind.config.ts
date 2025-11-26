import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core theme colors using CSS variables (shadcn/ui compat)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },

        // ========================================
        // NEUTRAL COLOR SYSTEM - Professional Blue & Light Theme
        // ========================================
        //
        // CUSTOMIZE: Replace these colors with your brand palette
        // Each color is documented with which UI components use it
        // ========================================

        neutral: {
          // -------------------
          // PRIMARY ACCENT (Professional Blue)
          // Used by: Connect/Disconnect buttons, microphone button (active),
          //          avatar borders, active states, links, focus rings
          // -------------------
          'accent-primary': '#2563EB',    // Main brand blue - buttons, accents
          'accent-hover': '#3B82F6',      // Lighter blue - hover states
          'accent-dark': '#1D4ED8',       // Darker blue - pressed/active states
          'accent-light': '#60A5FA',      // Even lighter - subtle accents

          // -------------------
          // BACKGROUNDS (White & Light Grays)
          // Used by: Page backgrounds, cards, chat area, sidebar panels
          // -------------------
          'lightest': '#FFFFFF',          // Pure white - main page background, header
          'off-white': '#FAFAFA',         // Subtle off-white - sidebar background
          'light': '#F5F5F5',             // Light gray - cards, chat message backgrounds (AI)
          'medium': '#E5E5E5',            // Medium gray - section dividers, disabled states
          'border': '#D4D4D4',            // Border gray - card borders, input borders

          // -------------------
          // TEXT COLORS (Dark on Light backgrounds)
          // Used by: All text content, headings, body copy, labels
          // -------------------
          'text-primary': '#1A1A1A',      // Main text - headings, body, labels
          'text-secondary': '#525252',    // Secondary text - descriptions, timestamps
          'text-muted': '#737373',        // Muted text - placeholders, disabled
          'text-light': '#A3A3A3',        // Very light text - subtle hints

          // -------------------
          // LEGACY (Minimal use, keep for compatibility)
          // -------------------
          'darkest': '#0A0A0A',           // Only for very specific dark elements
          'dark': '#1A1A1A',              // Used for specific dark text/elements
        },

        // ========================================
        // COMPONENT-SPECIFIC COLORS (Easy Access)
        // ========================================
        // These map directly to specific UI components
        // Change these to customize individual parts of the interface
        // ========================================

        figma: {
          // -------------------
          // PRIMARY BRAND COLOR
          // Used by: Main branding elements, primary buttons, important accents
          // -------------------
          'primary-wine': '#2563EB',      // Main brand color (renamed from wine for clarity)
          'secondary-wine': '#3B82F6',    // Lighter brand variant

          // -------------------
          // ACCENT COLORS (Functional)
          // Used by: Status indicators, alerts, success states
          // -------------------
          'yellow': '#F59E0B',            // Warning/attention - amber accent
          'green': '#10B981',             // Success/active - recording indicator, success messages
          'red': '#EF4444',               // Error/alert - error messages, destructive actions
          'purple': '#8B5CF6',            // Special accent - highlights, badges

          // -------------------
          // BACKGROUNDS (Light Theme)
          // Used by: Different UI regions and surfaces
          // -------------------
          'bg-primary': '#FFFFFF',        // Main content area background
          'bg-light': '#FAFAFA',          // Sidebar, secondary panels
          'bg-medium': '#F5F5F5',         // Cards, AI message bubbles
          'bg-dark': '#E5E5E5',           // Dividers, section backgrounds
          'bg-darkest': '#D4D4D4',        // Borders, input borders

          // -------------------
          // TEXT COLORS (for light backgrounds)
          // Used by: All text rendering
          // -------------------
          'text-primary': '#1A1A1A',      // Main body text, headings
          'text-secondary': '#525252',    // Secondary info, subtitles
          'text-muted': '#737373',        // Disabled text, placeholders

          // -------------------
          // MESSAGE BUBBLES (Chat Interface)
          // Used by: User and AI message backgrounds
          // -------------------
          'user-message-start': '#2563EB',    // User message gradient start (blue)
          'user-message-end': '#3B82F6',      // User message gradient end (lighter blue)
          'assistant-message-start': '#F5F5F5', // AI message start (light gray)
          'assistant-message-end': '#FAFAFA',   // AI message end (off-white)
        },

        // -------------------
        // CHAT-SPECIFIC SHORTCUTS
        // Direct mapping for quick access in chat components
        // -------------------
        'chat-user-start': '#2563EB',       // User bubble gradient start
        'chat-user-end': '#3B82F6',         // User bubble gradient end
        'chat-assistant-start': '#F5F5F5',  // AI bubble gradient start
        'chat-assistant-end': '#FAFAFA',    // AI bubble gradient end
        'chat-background': '#FFFFFF',       // Main chat area background
        'chat-sidebar': '#FAFAFA',          // AI Studio sidebar background
        'chat-header': '#FFFFFF',           // Header bar background
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'chat-bubble-slide-in': {
          from: {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'shimmer': {
          from: {
            transform: 'translateX(-100%)'
          },
          to: {
            transform: 'translateX(100%)'
          }
        },
        'glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'  // Updated to blue
          },
          '50%': {
            boxShadow: '0 0 30px rgba(37, 99, 235, 0.6)'  // Updated to blue
          }
        },
        'pulse-scale': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1'
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '0.8'
          }
        },
        'fade-in': {
          from: {
            opacity: '0'
          },
          to: {
            opacity: '1'
          }
        },
        'slide-in-right': {
          from: {
            transform: 'translateX(100%)',
            opacity: '0'
          },
          to: {
            transform: 'translateX(0)',
            opacity: '1'
          }
        },
        'slide-in-left': {
          from: {
            transform: 'translateX(-100%)',
            opacity: '0'
          },
          to: {
            transform: 'translateX(0)',
            opacity: '1'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'chat-bubble-slide-in': 'chat-bubble-slide-in 0.4s ease-out',
        'shimmer': 'shimmer 1.5s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-scale': 'pulse-scale 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.6s ease-out',
        'slide-in-left': 'slide-in-left 0.6s ease-out',
      },
      boxShadow: {
        // -------------------
        // BRAND SHADOWS (Blue themed)
        // Used by: Buttons, cards with brand accent
        // -------------------
        'wine-sm': '0 2px 8px rgba(37, 99, 235, 0.2)',     // Connect button, small accents
        'wine-md': '0 4px 12px rgba(37, 99, 235, 0.25)',   // Elevated cards
        'wine-lg': '0 6px 20px rgba(37, 99, 235, 0.3)',    // Modal overlays, prominent elements

        // -------------------
        // FUNCTIONAL SHADOWS
        // Used by: Success states, warnings, etc.
        // -------------------
        'green-sm': '0 2px 8px rgba(16, 185, 129, 0.2)',   // Recording indicator, success states
        'green-md': '0 4px 12px rgba(16, 185, 129, 0.25)', // Success messages
        'yellow': '0 4px 12px rgba(245, 158, 11, 0.25)',   // Warning messages, attention states

        // -------------------
        // NEUTRAL SHADOWS
        // Used by: Chat bubbles, cards, general UI elevation
        // -------------------
        'chat-bubble': '0 2px 8px rgba(0, 0, 0, 0.08)',        // Message bubbles (both user & AI)
        'chat-bubble-hover': '0 4px 12px rgba(37, 99, 235, 0.15)', // Message hover state
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',                 // AI Studio tool cards
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',          // Card hover elevation
      },
      fontFamily: {
        'serif': ['Source Serif 4', 'Georgia', 'serif'],
        'sans': ['Urbane Rounded', 'Marlin Soft', 'DM Sans', 'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Chat-specific font sizes
        'chat-message': ['15px', '1.6'],
        'chat-timestamp': ['12px', '1.4'],
      },
      backgroundImage: {
        // -------------------
        // GRADIENTS - Light Theme (Professional Blue)
        // Used by: Message bubbles, buttons, backgrounds
        // -------------------
        'gradient-light': 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',           // Page background fade
        'gradient-user': 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',            // User message bubbles (blue)
        'gradient-assistant': 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)',       // AI message bubbles (light gray)

        // -------------------
        // UI ELEMENT GRADIENTS
        // Used by: Header, footer, sidebar, buttons
        // -------------------
        'gradient-header': 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',          // Header bar
        'gradient-footer': 'linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%)',          // Footer area
        'gradient-sidebar': 'linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%)',         // AI Studio sidebar
        'gradient-button-wine': 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',     // Primary buttons (Connect, etc.)
        'gradient-button-green': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',    // Success buttons, recording active
      },
      spacing: {
        'chat': '1.5rem',
        'sidebar': '400px',
      },
      screens: {
        'tablet': '768px',
        'desktop': '1367px',  // iPad Pro landscape (1366px) + 1px
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
