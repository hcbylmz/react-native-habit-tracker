import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SPACING, RADIUS } from '../constants/theme';
import { useThemeColors } from '../hooks/use-theme-colors';
import { useTranslation } from '../utils/i18n';
import { Plus, Settings } from 'lucide-react-native';
import { useHabitStore } from '../stores/useHabitStore';
import HabitCard from '../components/HabitCard';
import { format } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import { useMemo } from 'react';
import { Habit } from '../types';
import { useI18nStore } from '../utils/i18n';

export default function HomeScreen() {
  const COLORS = useThemeColors();
  const { t } = useTranslation();
  const language = useI18nStore((state) => state.language);
  const router = useRouter();
  const getHabitsForDate = useHabitStore((state) => state.getHabitsForDate);
  
  const today = useMemo(() => new Date(), []);
  const todayStr = format(today, 'yyyy-MM-dd');
  const locale = language === 'tr' ? tr : enUS;
  const todayFormatted = format(today, 'EEEE, MMMM d', { locale });
  
  const todayHabits = useMemo(() => getHabitsForDate(today), [today, getHabitsForDate]);
  const getHabitCompletion = useHabitStore((state) => state.getHabitCompletion);
  
  const getHabitProgress = (habit: Habit) => {
    const isCompleted = getHabitCompletion(habit.id, todayStr);
    return isCompleted ? 100 : 0;
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: SPACING.l,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: COLORS.text,
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.textSecondary,
      marginTop: SPACING.xs,
    },
    headerRight: {
      flexDirection: 'row',
      gap: SPACING.s,
      alignItems: 'center',
    },
    iconButton: {
      backgroundColor: COLORS.surface,
      padding: SPACING.s,
      borderRadius: RADIUS.full,
    },
    progressGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: SPACING.l,
      marginBottom: SPACING.m,
      gap: SPACING.m,
    },
    progressItem: {
      flex: 1,
      minWidth: '45%',
      padding: SPACING.m,
      backgroundColor: COLORS.surface,
      borderRadius: RADIUS.m,
    },
    progressItemFull: {
      width: '100%',
      flex: 0,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.s,
    },
    progressLabel: {
      fontSize: 12,
      color: COLORS.textSecondary,
      flex: 1,
      marginRight: SPACING.xs,
    },
    progressPercentage: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    progressBar: {
      height: 6,
      backgroundColor: COLORS.border,
      borderRadius: RADIUS.s,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: RADIUS.s,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    emptyText: {
      color: COLORS.textSecondary,
      fontSize: 16,
      marginBottom: SPACING.l,
    },
    createButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: SPACING.l,
      paddingVertical: SPACING.m,
      borderRadius: RADIUS.l,
    },
    createButtonText: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: '600',
    },
    listContent: {
      padding: SPACING.m,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{t('today')}</Text>
          <Text style={styles.subtitle}>{todayFormatted}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/settings')}
          >
            <Settings color={COLORS.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/create-habit')}
          >
            <Plus color={COLORS.text} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {todayHabits.length > 0 && (
        <View style={styles.progressGrid}>
          {todayHabits.map((habit, index) => {
            const progress = getHabitProgress(habit);
            const isFullWidth = todayHabits.length === 1 || 
              (index === todayHabits.length - 1 && todayHabits.length % 2 !== 0);
            
            return (
              <View 
                key={habit.id}
                style={[
                  styles.progressItem,
                  isFullWidth && styles.progressItemFull
                ]}
              >
                <View style={styles.progressHeader}>
                  <Text 
                    style={styles.progressLabel}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {habit.title}
                  </Text>
                  <Text style={[styles.progressPercentage, { color: habit.color }]}>
                    {progress}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${progress}%`, 
                        backgroundColor: habit.color 
                      }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {todayHabits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('noHabitsToday')}</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/create-habit')}
          >
            <Text style={styles.createButtonText}>{t('createFirstHabit')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={todayHabits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <HabitCard 
              habit={item} 
              date={todayStr} 
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

