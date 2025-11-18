import { View, Text, StyleSheet } from 'react-native';
import { SPACING, RADIUS } from '../constants/theme';
import { useThemeColors } from '../hooks/use-theme-colors';
import { format, subDays, eachDayOfInterval, getDay } from 'date-fns';
import { useHabitStore } from '../stores/useHabitStore';
import { useMemo } from 'react';
import { useThemeStore } from '../stores/useThemeStore';
import { useTranslation } from '../utils/i18n';

export default function HeatmapView() {
  const COLORS = useThemeColors();
  const { t } = useTranslation();
  const theme = useThemeStore((state) => state.theme);
  const habits = useHabitStore((state) => state.habits);
  const getHabitCompletion = useHabitStore((state) => state.getHabitCompletion);

  const heatmapData = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 27);
    const days = eachDayOfInterval({ start: startDate, end: today });
    
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayHabits = habits.filter(h => {
        if (h.archived) return false;
        const dayOfWeek = getDay(day);
        return h.targetDays.includes(dayOfWeek);
      });
      
      const completed = dayHabits.filter(h => getHabitCompletion(h.id, dayStr)).length;
      const total = dayHabits.length;
      const intensity = total > 0 ? completed / total : 0;
      
      return { date: dayStr, intensity, completed, total };
    });
  }, [habits, getHabitCompletion]);

  const styles = StyleSheet.create({
    container: {
      padding: SPACING.m,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginBottom: SPACING.m,
    },
    cell: {
      width: 12,
      height: 12,
      borderRadius: 2,
    },
    legend: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.s,
    },
    legendText: {
      fontSize: 10,
      color: COLORS.textSecondary,
    },
    legendColors: {
      flexDirection: 'row',
      gap: 4,
    },
    legendCell: {
      width: 10,
      height: 10,
      borderRadius: 2,
    },
  });

  const getColor = (intensity: number) => {
    if (intensity === 0) return COLORS.surface;
    if (theme === 'dark') {
      if (intensity < 0.25) return '#1e3a5f';
      if (intensity < 0.5) return '#2563eb';
      if (intensity < 0.75) return '#3b82f6';
      return '#60a5fa';
    } else {
      if (intensity < 0.25) return '#dbeafe';
      if (intensity < 0.5) return '#93c5fd';
      if (intensity < 0.75) return '#60a5fa';
      return '#3b82f6';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {heatmapData.map((item, index) => (
          <View
            key={index}
            style={[
              styles.cell,
              { backgroundColor: getColor(item.intensity) },
            ]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>{t('less')}</Text>
        <View style={styles.legendColors}>
          <View style={[styles.legendCell, { backgroundColor: COLORS.surface }]} />
          <View style={[styles.legendCell, { backgroundColor: theme === 'dark' ? '#1e3a5f' : '#dbeafe' }]} />
          <View style={[styles.legendCell, { backgroundColor: theme === 'dark' ? '#2563eb' : '#93c5fd' }]} />
          <View style={[styles.legendCell, { backgroundColor: theme === 'dark' ? '#3b82f6' : '#60a5fa' }]} />
          <View style={[styles.legendCell, { backgroundColor: theme === 'dark' ? '#60a5fa' : '#3b82f6' }]} />
        </View>
        <Text style={styles.legendText}>{t('more')}</Text>
      </View>
    </View>
  );
}

