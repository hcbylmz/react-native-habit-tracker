import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SPACING, RADIUS } from '../constants/theme';
import { useThemeColors } from '../hooks/use-theme-colors';
import { useHabitStore } from '../stores/useHabitStore';
import { useTranslation } from '../utils/i18n';
import { X, Edit, Trash2, Flame } from 'lucide-react-native';
import SimpleBarChart from '../components/SimpleBarChart';
import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export default function HabitDetailScreen() {
  const COLORS = useThemeColors();
  const { t } = useTranslation();
  const router = useRouter();
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  const habits = useHabitStore((state) => state.habits);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  const getHabitStreak = useHabitStore((state) => state.getHabitStreak);
  const getHabitStats = useHabitStore((state) => state.getHabitStats);
  const getHabitLogs = useHabitStore((state) => state.getHabitLogs);

  const habit = habits.find(h => h.id === habitId);

  const streak = useMemo(() => habit ? getHabitStreak(habit.id) : 0, [habit, getHabitStreak]);
  const stats7Days = useMemo(() => habit ? getHabitStats(habit.id, 7) : { completionRate: 0, completedDays: 0, totalDays: 0 }, [habit, getHabitStats]);
  const stats30Days = useMemo(() => habit ? getHabitStats(habit.id, 30) : { completionRate: 0, completedDays: 0, totalDays: 0 }, [habit, getHabitStats]);

  const chartData7Days = useMemo(() => {
    if (!habit) return [];
    const today = new Date();
    const days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const logs = getHabitLogs(habit.id);
      const log = logs.find(l => l.date === dayStr);
      return log && log.completed ? 1 : 0;
    });
  }, [habit, getHabitLogs]);

  if (!habit) {
    router.back();
    return null;
  }

  const handleDelete = () => {
    Alert.alert(
      t('deleteHabit'),
      `${t('deleteConfirmMessage')} "${habit.title}"?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            deleteHabit(habit.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push({ pathname: '/edit-habit', params: { habitId: habit.id } });
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
    },
    contentContainer: {
      padding: SPACING.m,
    },
    habitHeader: {
      flexDirection: 'row',
      marginBottom: SPACING.xl,
    },
    habitIconContainer: {
      width: 60,
      height: 60,
      borderRadius: RADIUS.m,
      backgroundColor: COLORS.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.m,
    },
    habitIcon: {
      fontSize: 32,
    },
    habitInfo: {
      flex: 1,
    },
    habitTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: SPACING.xs,
    },
    habitDescription: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginBottom: SPACING.s,
    },
    categoryBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: SPACING.m,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.s,
      backgroundColor: COLORS.surface,
    },
    categoryText: {
      fontSize: 12,
      color: COLORS.textSecondary,
      textTransform: 'uppercase',
    },
    statsContainer: {
      flexDirection: 'row',
      gap: SPACING.m,
      marginBottom: SPACING.xl,
    },
    statCard: {
      flex: 1,
      backgroundColor: COLORS.surface,
      padding: SPACING.m,
      borderRadius: RADIUS.m,
    },
    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginBottom: SPACING.s,
    },
    statLabel: {
      fontSize: 12,
      color: COLORS.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text,
      marginTop: SPACING.xs,
    },
    statSubtext: {
      fontSize: 12,
      color: COLORS.textSecondary,
      marginTop: SPACING.xs,
    },
    chartContainer: {
      backgroundColor: COLORS.surface,
      padding: SPACING.m,
      borderRadius: RADIUS.m,
      marginBottom: SPACING.xl,
    },
    chartTitle: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginBottom: SPACING.m,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: SPACING.m,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.m,
      borderRadius: RADIUS.m,
      gap: SPACING.s,
    },
    editButton: {
      backgroundColor: COLORS.primary,
    },
    deleteButton: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.error,
    },
    actionButtonText: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: '600',
    },
    deleteButtonText: {
      color: COLORS.error,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('habitDetails')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.habitHeader}>
          <View style={styles.habitIconContainer}>
            <Text style={styles.habitIcon}>{habit.icon}</Text>
          </View>
          <View style={styles.habitInfo}>
            <Text style={styles.habitTitle}>{habit.title}</Text>
            {habit.description && (
              <Text style={styles.habitDescription}>{habit.description}</Text>
            )}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {t(`category${habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}` as any)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Flame size={20} color={COLORS.primary} />
              <Text style={styles.statLabel}>{t('currentStreak')}</Text>
            </View>
            <Text style={styles.statValue}>{streak} {t('days')}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('sevenDayCompletion')}</Text>
            <Text style={styles.statValue}>{stats7Days.completionRate}%</Text>
            <Text style={styles.statSubtext}>{stats7Days.completedDays}/{stats7Days.totalDays} {t('days')}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('thirtyDayCompletion')}</Text>
            <Text style={styles.statValue}>{stats30Days.completionRate}%</Text>
            <Text style={styles.statSubtext}>{stats30Days.completedDays}/{stats30Days.totalDays} {t('days')}</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{t('last7Days')}</Text>
          <SimpleBarChart data={chartData7Days} color={habit.color} />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
            <Edit size={20} color={COLORS.text} />
            <Text style={styles.actionButtonText}>{t('edit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
            <Trash2 size={20} color={COLORS.error} />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>{t('delete')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

