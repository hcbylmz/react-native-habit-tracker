import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SPACING, RADIUS } from '../constants/theme';
import { useThemeColors } from '../hooks/use-theme-colors';
import { Check } from 'lucide-react-native';
import { Habit } from '../types';
import { useHabitStore } from '../stores/useHabitStore';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { useRouter } from 'expo-router';

interface HabitCardProps {
  habit: Habit;
  date: string;
}

export default function HabitCard({ habit, date }: HabitCardProps) {
  const COLORS = useThemeColors();
  const router = useRouter();
  const toggleHabitCompletion = useHabitStore((state) => state.toggleHabitCompletion);
  const isCompleted = useHabitStore((state) => state.getHabitCompletion(habit.id, date));
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleHabitCompletion(habit.id, date);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/habit-detail', params: { habitId: habit.id } });
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: SPACING.m,
    },
    content: {
      backgroundColor: COLORS.surface,
      padding: SPACING.m,
      borderRadius: RADIUS.m,
      borderLeftWidth: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    info: {
      flex: 1,
      marginRight: SPACING.m,
    },
    title: {
      color: COLORS.text,
      fontSize: 18,
      fontWeight: '600',
    },
    completedText: {
      textDecorationLine: 'line-through',
      color: COLORS.textSecondary,
    },
    description: {
      color: COLORS.textSecondary,
      fontSize: 14,
      marginTop: SPACING.xs,
    },
    checkbox: {
      width: 28,
      height: 28,
      borderRadius: RADIUS.full,
      borderWidth: 2,
      borderColor: COLORS.textSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        style={[styles.content, { borderLeftColor: habit.color }]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
      >
        <View style={styles.info}>
          <Text style={[styles.title, isCompleted && styles.completedText]}>{habit.title}</Text>
          {habit.description && (
            <Text style={styles.description}>{habit.description}</Text>
          )}
        </View>
        
        <View style={[
          styles.checkbox, 
          isCompleted && { backgroundColor: habit.color, borderColor: habit.color }
        ]}>
          {isCompleted && <Check size={16} color={COLORS.text} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
