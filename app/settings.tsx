import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Bell, Download, Info, Moon, Plus, Sun, Trash2, Upload, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { RADIUS, SPACING } from '../constants/theme';
import { useThemeColors } from '../hooks/use-theme-colors';
import { useHabitStore } from '../stores/useHabitStore';
import { useThemeStore } from '../stores/useThemeStore';
import { useI18nStore, useTranslation } from '../utils/i18n';

export default function SettingsScreen() {
  const COLORS = useThemeColors();
  const { t } = useTranslation();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const language = useI18nStore((state) => state.language);
  const setLanguage = useI18nStore((state) => state.setLanguage);
  const habits = useHabitStore((state) => state.habits);
  const logs = useHabitStore((state) => state.logs);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  const addExampleData = useHabitStore((state) => state.addExampleData);
  const removeExampleData = useHabitStore((state) => state.removeExampleData);
  const exampleHabitIds = useHabitStore((state) => state.exampleHabitIds);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleThemeToggle = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };

  const handleExportData = async () => {
    try {
      const data = {
        habits,
        logs,
        exportedAt: new Date().toISOString(),
      };
      const jsonString = JSON.stringify(data, null, 2);
      await Clipboard.setStringAsync(jsonString);
      Alert.alert(t('success'), t('dataCopied'));
    } catch (error) {
      Alert.alert(t('error'), t('failedExport'));
    }
  };

  const handleImportData = async () => {
    Alert.alert(
      t('importData'),
      t('importData'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('import'),
          onPress: async () => {
            try {
              const clipboardText = await Clipboard.getStringAsync();
              const data = JSON.parse(clipboardText);
              
              if (data.habits && data.logs) {
                await AsyncStorage.setItem('habit-storage', JSON.stringify({
                  state: {
                    habits: data.habits,
                    logs: data.logs,
                  },
                  version: 0,
                }));
                Alert.alert(t('success'), t('dataImported'));
              } else {
                Alert.alert(t('error'), t('invalidData'));
              }
            } catch (error) {
              Alert.alert(t('error'), t('failedImport'));
            }
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      t('clearAllData'),
      t('clearDataConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clear'),
          style: 'destructive',
          onPress: async () => {
            habits.forEach(habit => deleteHabit(habit.id));
            await AsyncStorage.removeItem('habit-storage');
            Alert.alert(t('success'), t('allDataCleared'));
          },
        },
      ]
    );
  };

  const handleAddExampleData = () => {
    addExampleData();
    Alert.alert(t('success'), t('exampleDataAdded'));
  };

  const handleRemoveExampleData = () => {
    Alert.alert(
      t('removeExampleData'),
      t('clearDataConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clear'),
          style: 'destructive',
          onPress: () => {
            removeExampleData();
            Alert.alert(t('success'), t('exampleDataRemoved'));
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    contentContainer: {
      padding: SPACING.m,
    },
    header: {
      marginBottom: SPACING.l,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: COLORS.text,
    },
    section: {
      marginBottom: SPACING.xl,
    },
    sectionTitle: {
      fontSize: 14,
      color: COLORS.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: SPACING.m,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPACING.m,
      backgroundColor: COLORS.surface,
      borderRadius: RADIUS.m,
      marginBottom: SPACING.s,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.m,
    },
    settingLabel: {
      fontSize: 16,
      color: COLORS.text,
    },
    settingValue: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    dangerText: {
      color: COLORS.error,
    },
    languageContainer: {
      flexDirection: 'row',
      gap: SPACING.m,
    },
    languageOption: {
      flex: 1,
      padding: SPACING.m,
      borderRadius: RADIUS.m,
      backgroundColor: COLORS.surface,
      alignItems: 'center',
    },
    languageText: {
      fontSize: 16,
      color: COLORS.textSecondary,
      fontWeight: '600',
    },
    selectedLanguageText: {
      color: '#ffffff',
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('appearance')}</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            {theme === 'dark' ? (
              <Moon size={20} color={COLORS.text} />
            ) : (
              <Sun size={20} color={COLORS.text} />
            )}
            <Text style={styles.settingLabel}>{t('darkMode')}</Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={handleThemeToggle}
            trackColor={{ false: COLORS.surface, true: COLORS.primary }}
            thumbColor={COLORS.text}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('language')}</Text>
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[
              styles.languageOption,
              language === 'en' && {
                backgroundColor: theme === 'dark' ? COLORS.primary : '#818cf8',
              },
            ]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.languageText, language === 'en' && styles.selectedLanguageText]}>
              {t('english')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageOption,
              language === 'tr' && {
                backgroundColor: theme === 'dark' ? COLORS.primary : '#818cf8',
              },
            ]}
            onPress={() => setLanguage('tr')}
          >
            <Text style={[styles.languageText, language === 'tr' && styles.selectedLanguageText]}>
              {t('turkish')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('notifications')}</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Bell size={20} color={COLORS.text} />
            <Text style={styles.settingLabel}>{t('enableNotifications')}</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: COLORS.surface, true: COLORS.primary }}
            thumbColor={COLORS.text}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('data')}</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
          <View style={styles.settingLeft}>
            <Download size={20} color={COLORS.text} />
            <Text style={styles.settingLabel}>{t('exportData')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleImportData}>
          <View style={styles.settingLeft}>
            <Upload size={20} color={COLORS.text} />
            <Text style={styles.settingLabel}>{t('importData')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
          <View style={styles.settingLeft}>
            <Trash2 size={20} color={COLORS.error} />
            <Text style={[styles.settingLabel, styles.dangerText]}>{t('clearAllData')}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {__DEV__ && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('development')}</Text>
          {exampleHabitIds.length === 0 ? (
            <TouchableOpacity style={styles.settingItem} onPress={handleAddExampleData}>
              <View style={styles.settingLeft}>
                <Plus size={20} color={COLORS.primary} />
                <Text style={[styles.settingLabel, { color: COLORS.primary }]}>
                  {t('addExampleData')}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.settingItem} onPress={handleRemoveExampleData}>
              <View style={styles.settingLeft}>
                <X size={20} color={COLORS.error} />
                <Text style={[styles.settingLabel, styles.dangerText]}>
                  {t('removeExampleData')}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('about')}</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Info size={20} color={COLORS.text} />
            <Text style={styles.settingLabel}>{t('appVersion')}</Text>
          </View>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

