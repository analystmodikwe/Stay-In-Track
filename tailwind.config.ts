/** @type {import('tailwindcss').Config} */
import { tokens } from './src/theme/tokens'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: tokens.color.primary,
        accent: tokens.color.accent,
        background: tokens.color.background,
        surface: tokens.color.surface,
        'text-main': tokens.color.text,
        'text-secondary': tokens.color.textSecondary,
        border: tokens.color.border,
        error: tokens.color.error,
        success: tokens.color.success,
        warning: tokens.color.warning,
        badge: tokens.color.badge,
        toast: tokens.color.toast,
      },
      fontFamily: {
        sans: [tokens.font.family, 'sans-serif'],
      },
      fontSize: {
        title: [tokens.font.title.size, { fontWeight: tokens.font.title.weight }],
        heading: [tokens.font.heading.size, { fontWeight: tokens.font.heading.weight }],
        body: [tokens.font.body.size, { fontWeight: tokens.font.body.weight }],
        small: [tokens.font.small.size, { fontWeight: tokens.font.small.weight }],
        stat: [tokens.font.stat.size, { fontWeight: tokens.font.stat.weight }],
      },
      spacing: {
        '1': tokens.space[1],
        '2': tokens.space[2],
        '3': tokens.space[3],
        '4': tokens.space[4],
        'screen': tokens.space.screen,
      },
      borderRadius: {
        card: tokens.radius.card,
        input: tokens.radius.input,
        button: tokens.radius.button,
        badge: tokens.radius.badge,
      },
      boxShadow: {
        card: tokens.shadow.card,
      },
      minHeight: {
        button: tokens.size.button,
        touch: tokens.size.touchMin,
      },
      minWidth: {
        touch: tokens.size.touchMin,
      },
      screens: {
        tablet: tokens.breakpoint.tablet,
        desktop: tokens.breakpoint.desktop,
      },
      width: {
        'side-menu': tokens.layout.sideMenuWidth,
        'modal': tokens.layout.modalWidth,
      },
      maxWidth: {
        content: tokens.layout.maxContent,
      },
    },
  },
  plugins: [],
}

