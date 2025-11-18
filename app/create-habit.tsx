import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SPACING, RADIUS } from '../constants/theme';
import { useThemeColors } from '../hooks/use-theme-colors';
import { useHabitStore } from '../stores/useHabitStore';
import { useTranslation } from '../utils/i18n';
import { X } from 'lucide-react-native';
import { Category, Frequency, GoalType } from '../types';

const COLORS_OPTIONS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899',
];

const EMOJI_OPTIONS = ['📚', '💧', '🏃', '🧘', '💪', '🍎', '📝', '🎯', '☕', '🌙', '☀️', '⚡'];

const CATEGORIES: Category[] = ['health', 'study', 'personal', 'fitness', 'work', 'other'];

const DAYS_KEYS = ['daySun', 'dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri', 'daySat'] as const;

export default function CreateHabitScreen() {
  const COLORS = useThemeColors();
  const { t } = useTranslation();
  const router = useRouter();
  const addHabit = useHabitStore((state) => state.addHabit);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS_OPTIONS[7]);
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0]);
  const [category, setCategory] = useState<Category>('health');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [goalType, setGoalType] = useState<GoalType>('boolean');
  const [dailyGoal, setDailyGoal] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  const toggleDay = (day: number) => {
    if (targetDays.includes(day)) {
      setTargetDays(targetDays.filter(d => d !== day));
    } else {
      setTargetDays([...targetDays, day].sort());
    }
  };

  const handleCreate = () => {
    if (!title.trim()) return;

    addHabit({
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim(),
      color: selectedColor,
      icon: selectedEmoji,
      category,
      frequency,
      targetDays: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : targetDays,
      goalType,
      dailyGoal: goalType === 'numeric' && dailyGoal ? parseFloat(dailyGoal) : undefined,
      reminderTime: reminderTime || undefined,
      createdAt: new Date().toISOString(),
      archived: false,
    });

    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPACING.m,
      paddingTop: Platform.OS === 'ios' ? SPACING.m : SPACING.xl,
    },
    headerTitle: {
      color: COLORS.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    closeButton: {
      padding: SPACING.s,
    },
    content: {
      flex: 1,
      padding: SPACING.m,
    },
    formGroup: {
      marginBottom: SPACING.xl,
    },
    label: {
      color: COLORS.textSecondary,
      fontSize: 14,
      marginBottom: SPACING.s,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    input: {
      backgroundColor: COLORS.surface,
      color: COLORS.text,
      padding: SPACING.m,
      borderRadius: RADIUS.m,
      fontSize: 16,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.m,
    },
    colorOption: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.full,
    },
    selectedColor: {
      borderWidth: 3,
      borderColor: COLORS.text,
    },
    emojiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.m,
    },
    emojiOption: {
      width: 50,
      height: 50,
      borderRadius: RADIUS.m,
      backgroundColor: COLORS.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedEmoji: {
      borderWidth: 2,
      borderColor: COLORS.primary,
    },
    emojiText: {
      fontSize: 24,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.s,
    },
    categoryOption: {
      paddingHorizontal: SPACING.m,
      paddingVertical: SPACING.s,
      borderRadius: RADIUS.m,
      backgroundColor: COLORS.surface,
    },
    selectedCategory: {
      backgroundColor: COLORS.primary,
    },
    categoryText: {
      color: COLORS.textSecondary,
      fontSize: 14,
    },
    selectedCategoryText: {
      color: COLORS.text,
      fontWeight: '600',
    },
    frequencyContainer: {
      flexDirection: 'row',
      gap: SPACING.m,
    },
    frequencyOption: {
      flex: 1,
      padding: SPACING.m,
      borderRadius: RADIUS.m,
      backgroundColor: COLORS.surface,
      alignItems: 'center',
    },
    selectedFrequency: {
      backgroundColor: COLORS.primary,
    },
    frequencyText: {
      color: COLORS.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    selectedFrequencyText: {
      color: COLORS.text,
    },
    daysContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.s,
      marginTop: SPACING.m,
    },
    dayButton: {
      width: 44,
      height: 44,
      borderRadius: RADIUS.m,
      backgroundColor: COLORS.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedDay: {
      backgroundColor: COLORS.primary,
    },
    dayText: {
      color: COLORS.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    selectedDayText: {
      color: COLORS.text,
    },
    mtSmall: {
      marginTop: SPACING.m,
    },
    footer: {
      padding: SPACING.m,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
    },
    createButton: {
      backgroundColor: COLORS.primary,
      padding: SPACING.m,
      borderRadius: RADIUS.l,
      alignItems: 'center',
    },
    disabledButton: {
      opacity: 0.5,
    },
    createButtonText: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('newHabit')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('name')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('namePlaceholder')}
            placeholderTextColor={COLORS.textSecondary}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('description')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('descriptionPlaceholder')}
            placeholderTextColor={COLORS.textSecondary}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('emoji')}</Text>
          <View style={styles.emojiGrid}>
            {EMOJI_OPTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiOption,
                  selectedEmoji === emoji && styles.selectedEmoji,
                ]}
                onPress={() => setSelectedEmoji(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('category')}</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryOption,
                  category === cat && styles.selectedCategory,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryText, category === cat && styles.selectedCategoryText]}>
                  {t(`category${cat.charAt(0).toUpperCase() + cat.slice(1)}` as any)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('color')}</Text>
          <View style={styles.colorGrid}>
            {COLORS_OPTIONS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('frequency')}</Text>
          <View style={styles.frequencyContainer}>
            {(['daily', 'weekly'] as Frequency[]).map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyOption,
                  frequency === freq && styles.selectedFrequency,
                ]}
                onPress={() => setFrequency(freq)}
              >
                <Text style={[styles.frequencyText, frequency === freq && styles.selectedFrequencyText]}>
                  {t(freq)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {frequency === 'weekly' && (
            <View style={styles.daysContainer}>
              {DAYS_KEYS.map((dayKey, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    targetDays.includes(index) && styles.selectedDay,
                  ]}
                  onPress={() => toggleDay(index)}
                >
                  <Text style={[styles.dayText, targetDays.includes(index) && styles.selectedDayText]}>
                    {t(dayKey as any)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('goalType')}</Text>
          <View style={styles.frequencyContainer}>
            {(['boolean', 'numeric'] as GoalType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.frequencyOption,
                  goalType === type && styles.selectedFrequency,
                ]}
                onPress={() => setGoalType(type)}
              >
                <Text style={[styles.frequencyText, goalType === type && styles.selectedFrequencyText]}>
                  {type === 'boolean' ? t('check') : t('numeric')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {goalType === 'numeric' && (
            <TextInput
              style={[styles.input, styles.mtSmall]}
              placeholder={t('dailyGoalPlaceholder')}
              placeholderTextColor={COLORS.textSecondary}
              value={dailyGoal}
              onChangeText={setDailyGoal}
              keyboardType="numeric"
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('reminderTime')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('reminderPlaceholder')}
            placeholderTextColor={COLORS.textSecondary}
            value={reminderTime}
            onChangeText={setReminderTime}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.createButton, !title.trim() && styles.disabledButton]} 
          onPress={handleCreate}
          disabled={!title.trim()}
        >
          <Text style={styles.createButtonText}>{t('createHabit')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
