import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useThemeColors } from '../hooks/use-theme-colors';
import { useThemeStore } from '../stores/useThemeStore';
import { useI18nStore } from '../utils/i18n';
import { requestPermissions } from '../utils/notifications';

export default function RootLayout() {
  const COLORS = useThemeColors();
  const theme = useThemeStore((state) => state.theme);
  const t = useI18nStore((state) => state.t);

  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={COLORS.background} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: t('settings') }} />
        <Stack.Screen 
          name="create-habit" 
          options={{ 
            presentation: 'modal',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="edit-habit" 
          options={{ 
            presentation: 'modal',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="habit-detail" 
          options={{ 
            presentation: 'modal',
            title: t('habitDetails')
          }} 
        />
      </Stack>
    </>
  );
}
