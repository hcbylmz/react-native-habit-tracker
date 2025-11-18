import { useThemeStore } from '../stores/useThemeStore';
import { getColors } from '../constants/theme';

export const useThemeColors = () => {
  const theme = useThemeStore((state) => state.theme);
  return getColors(theme);
};

