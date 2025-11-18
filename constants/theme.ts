export type ThemeMode = 'light' | 'dark';

export const darkColors = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  background: '#0f172a',
  surface: '#1e293b',
  surfaceLight: '#334155',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  border: '#334155',
};

export const lightColors = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  background: '#ffffff',
  surface: '#f1f5f9',
  surfaceLight: '#e2e8f0',
  text: '#0f172a',
  textSecondary: '#64748b',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  border: '#e2e8f0',
};

export const getColors = (theme: ThemeMode = 'dark') => {
  return theme === 'dark' ? darkColors : lightColors;
};

export const COLORS = darkColors;

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  s: 8,
  m: 12,
  l: 16,
  full: 9999,
};

export const FONTS = {
  regular: 'System', // Use system font for now, can replace with custom font later
  medium: 'System',
  bold: 'System',
};
