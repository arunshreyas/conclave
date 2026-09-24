import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#ffffff',
    background: '#310004',
    backgroundElement: '#480009',
    backgroundSelected: '#5c010e',
    textSecondary: '#cdc6b7',
    primary: '#ffffff',
    secondary: '#f2bf4b',
    border: '#4b463b',
    surfaceLow: '#410007',
    surfaceHigh: '#5c010e',
  },
  dark: {
    text: '#ffffff',
    background: '#310004',
    backgroundElement: '#480009',
    backgroundSelected: '#5c010e',
    textSecondary: '#cdc6b7',
    primary: '#ffffff',
    secondary: '#f2bf4b',
    border: '#4b463b',
    surfaceLow: '#410007',
    surfaceHigh: '#5c010e',
  },
} as const;

export type ThemeColor = keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'Epilogue, sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'Lexend, monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
