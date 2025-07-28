import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
        },
        // WhatsApp-specific colors
        "chat-bubble-own": "hsl(var(--chat-bubble-own))",
        "chat-bubble-other": "hsl(var(--chat-bubble-other))",
        "chat-input": "hsl(var(--chat-input))",
        "online-indicator": "hsl(var(--online-indicator))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "slide-in": {
          from: {
            opacity: "0",
            transform: "translateX(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "slide-in-right": {
          from: {
            opacity: "0",
            transform: "translateX(100%)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "slide-in-left": {
          from: {
            opacity: "0",
            transform: "translateX(-100%)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "slide-in-bottom": {
          from: {
            opacity: "0",
            transform: "translateY(100%)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "modal-slide-in": {
          from: {
            opacity: "0",
            transform: "translateY(20px) scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
          },
          to: {
            opacity: "1",
          },
        },
        "scale-in": {
          from: {
            opacity: "0",
            transform: "scale(0.9)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "bounce-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.3)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.05)",
          },
          "70%": {
            transform: "scale(0.9)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "spring-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.6)",
          },
          "20%": {
            opacity: "1",
            transform: "scale(1.1)",
          },
          "40%": {
            transform: "scale(0.9)",
          },
          "60%": {
            transform: "scale(1.03)",
          },
          "80%": {
            transform: "scale(0.97)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
        "slide-in-right": "slide-in-right 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        "slide-in-left": "slide-in-left 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        "slide-in-bottom": "slide-in-bottom 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
        "modal-slide-in": "modal-slide-in 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
        "fade-in": "fade-in 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
        "scale-in": "scale-in 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "spring-in": "spring-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      transitionTimingFunction: {
        "ios": "cubic-bezier(0.23, 1, 0.32, 1)",
        "ios-spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "ios-bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
