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
        // 2B AHEAD COLOR SYSTEM - Wine Red & Light Theme
        // ========================================

        neutral: {
          // 2b AHEAD Wine Red (Primary Brand Color)
          'accent-primary': '#7A2948',    // Main 2b AHEAD wine red
          'accent-hover': '#933558',      // Lighter for hover states
          'accent-dark': '#5F1E37',       // Darker for pressed states
          'accent-light': '#A54568',      // Even lighter variant

          // Light Theme - White & Soft Grays
          'lightest': '#FFFFFF',          // Pure white - main backgrounds
          'off-white': '#FAFAFA',         // Subtle off-white
          'light': '#F5F5F5',             // Light gray - cards, sections
          'medium': '#E5E5E5',            // Medium gray - borders, dividers
          'border': '#D4D4D4',            // Border gray

          // Text Colors (Dark on Light)
          'text-primary': '#1A1A1A',      // Primary dark text
          'text-secondary': '#525252',    // Secondary gray text
          'text-muted': '#737373',        // Muted text
          'text-light': '#A3A3A3',        // Very light text

          // Legacy dark values (minimal use)
          'darkest': '#0A0A0A',           // Only for specific dark elements
          'dark': '#1A1A1A',              // Dark text/elements
        },

        // ========================================
        // LEGACY COLOR SYSTEM - Keeping for compatibility
        // ========================================

        // Main Brand Colors (2b AHEAD light theme)
        figma: {
          // Core Accent (Wine Red)
          'primary-wine': '#711d32',      // 2b AHEAD wine red
          'secondary-wine': '#933558',    // Lighter wine variant

          // Accent Colors
          'yellow': '#F59E0B',            // Amber accent
          'green': '#10B981',             // Success green
          'red': '#EF4444',               // Error/alert red
          'purple': '#8B5CF6',            // Purple accent

          // Backgrounds (Light Theme)
          'bg-primary': '#FFFFFF',        // Main white background
          'bg-light': '#FAFAFA',          // Subtle off-white
          'bg-medium': '#F5F5F5',         // Light gray cards
          'bg-dark': '#E5E5E5',           // Darker gray sections
          'bg-darkest': '#D4D4D4',        // Borders/dividers

          // Text Colors (for light backgrounds)
          'text-primary': '#1A1A1A',      // Main dark text
          'text-secondary': '#525252',    // Secondary gray text
          'text-muted': '#737373',        // Muted text

          // Message Bubbles (Light Theme)
          'user-message-start': '#7A2948',    // User: wine red gradient start
          'user-message-end': '#933558',      // User: wine red gradient end
          'assistant-message-start': '#F5F5F5', // Assistant: light gray
          'assistant-message-end': '#FAFAFA',   // Assistant: off-white
        },

        // Chat-specific colors (for easy access) - Light theme
        'chat-user-start': '#7A2948',
        'chat-user-end': '#933558',
        'chat-assistant-start': '#F5F5F5',
        'chat-assistant-end': '#FAFAFA',
        'chat-background': '#FFFFFF',
        'chat-sidebar': '#FAFAFA',
        'chat-header': '#FFFFFF',
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
        // Figma-inspired animations
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
            boxShadow: '0 0 20px rgba(77, 90, 232, 0.4)'
          },
          '50%': {
            boxShadow: '0 0 30px rgba(77, 90, 232, 0.6)'
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
        // Wine-red themed shadows (2b AHEAD)
        'wine-sm': '0 2px 8px rgba(122, 41, 72, 0.2)',
        'wine-md': '0 4px 12px rgba(122, 41, 72, 0.25)',
        'wine-lg': '0 6px 20px rgba(122, 41, 72, 0.3)',
        // Accent shadows
        'green-sm': '0 2px 8px rgba(16, 185, 129, 0.2)',
        'green-md': '0 4px 12px rgba(16, 185, 129, 0.25)',
        'yellow': '0 4px 12px rgba(245, 158, 11, 0.25)',
        // Light theme shadows
        'chat-bubble': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'chat-bubble-hover': '0 4px 12px rgba(122, 41, 72, 0.15)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
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
        // Light theme gradients (2b AHEAD)
        'gradient-light': 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
        'gradient-user': 'linear-gradient(135deg, #7A2948 0%, #933558 100%)',      // Wine red user bubbles
        'gradient-assistant': 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)', // Light gray assistant

        // UI gradients
        'gradient-header': 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
        'gradient-footer': 'linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%)',
        'gradient-button-wine': 'linear-gradient(135deg, #7A2948 0%, #933558 100%)',
        'gradient-button-green': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
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
