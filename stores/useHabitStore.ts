import AsyncStorage from '@react-native-async-storage/async-storage';
import { eachDayOfInterval, endOfWeek, format, getDay, startOfWeek, subDays } from 'date-fns';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Habit, HabitLog } from '../types';
import { cancelHabitNotifications, scheduleHabitNotification, updateHabitNotification } from '../utils/notifications';

interface HabitState {
    habits: Habit[];
    logs: Record<string, HabitLog[]>; // habitId -> logs
    exampleHabitIds: string[]; // Track example habit IDs
    addHabit: (habit: Habit) => void;
    updateHabit: (id: string, updates: Partial<Habit>) => void;
    deleteHabit: (id: string) => void;
    toggleHabitCompletion: (habitId: string, date: string) => void;
    getHabitLogs: (habitId: string) => HabitLog[];
    getHabitCompletion: (habitId: string, date: string) => boolean;
    getHabitStreak: (habitId: string) => number;
    getTodayProgress: () => number;
    getHabitsForDate: (date: Date) => Habit[];
    getWeeklyStats: () => { successRate: number; totalStreak: number };
    getHabitStats: (habitId: string, days: number) => { completionRate: number; completedDays: number; totalDays: number };
    addExampleData: () => void;
    removeExampleData: () => void;
    hasExampleData: () => boolean;
}

export const useHabitStore = create<HabitState>()(
    persist(
        (set, get) => ({
            habits: [],
            logs: {},
            exampleHabitIds: [],
            addHabit: (habit) => {
                set((state) => ({ habits: [...state.habits, habit] }));
                if (habit.reminderTime) {
                    scheduleHabitNotification(habit);
                }
            },
            updateHabit: (id, updates) => {
                set((state) => ({
                    habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
                }));
                const habit = get().habits.find((h) => h.id === id);
                if (habit) {
                    const updatedHabit = { ...habit, ...updates };
                    if (updatedHabit.reminderTime) {
                        updateHabitNotification(updatedHabit);
                    } else {
                        cancelHabitNotifications(id);
                    }
                }
            },
            deleteHabit: (id) => {
                cancelHabitNotifications(id);
                set((state) => {
                    const newLogs = { ...state.logs };
                    delete newLogs[id];
                    return {
                        habits: state.habits.filter((h) => h.id !== id),
                        logs: newLogs,
                    };
                });
            },
            toggleHabitCompletion: (habitId, date) =>
                set((state) => {
                    const currentLogs = state.logs[habitId] || [];
                    const existingLogIndex = currentLogs.findIndex((l) => l.date === date);

                    let newLogs;
                    if (existingLogIndex >= 0) {
                        // Toggle existing
                        newLogs = [...currentLogs];
                        newLogs[existingLogIndex] = {
                            ...newLogs[existingLogIndex],
                            completed: !newLogs[existingLogIndex].completed,
                        };
                    } else {
                        // Create new
                        newLogs = [
                            ...currentLogs,
                            {
                                id: Math.random().toString(36).substr(2, 9),
                                habitId,
                                date,
                                completed: true,
                                timestamp: Date.now(),
                            },
                        ];
                    }

                    return {
                        logs: {
                            ...state.logs,
                            [habitId]: newLogs,
                        },
                    };
                }),
            getHabitLogs: (habitId) => get().logs[habitId] || [],
            getHabitCompletion: (habitId, date) => {
                const logs = get().logs[habitId] || [];
                const log = logs.find((l) => l.date === date);
                return log ? log.completed : false;
            },
            getHabitStreak: (habitId) => {
                const logs = get().logs[habitId] || [];
                const sortedLogs = logs
                    .filter(l => l.completed)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                if (sortedLogs.length === 0) return 0;

                let streak = 0;
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const lastLogDate = new Date(sortedLogs[0].date);
                lastLogDate.setHours(0, 0, 0, 0);

                const diffTime = Math.abs(today.getTime() - lastLogDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 1) return 0;

                streak = 1;
                for (let i = 0; i < sortedLogs.length - 1; i++) {
                    const current = new Date(sortedLogs[i].date);
                    const next = new Date(sortedLogs[i + 1].date);

                    const dayDiff = Math.round((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

                    if (dayDiff === 1) {
                        streak++;
                    } else {
                        break;
                    }
                }
                return streak;
            },
            getTodayProgress: () => {
                const today = new Date();
                const todayStr = format(today, 'yyyy-MM-dd');
                const todayHabits = get().getHabitsForDate(today);
                
                if (todayHabits.length === 0) return 0;
                
                const completed = todayHabits.filter(h => get().getHabitCompletion(h.id, todayStr)).length;
                return Math.round((completed / todayHabits.length) * 100);
            },
            getHabitsForDate: (date) => {
                const dayOfWeek = getDay(date);
                const habits = get().habits.filter(h => !h.archived);
                
                return habits.filter(habit => {
                    if (habit.frequency === 'daily') {
                        return habit.targetDays.includes(dayOfWeek);
                    } else if (habit.frequency === 'weekly') {
                        return habit.targetDays.includes(dayOfWeek);
                    }
                    return true;
                });
            },
            getWeeklyStats: () => {
                const today = new Date();
                const weekStart = startOfWeek(today, { weekStartsOn: 0 });
                const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
                const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
                
                let totalHabits = 0;
                let completedHabits = 0;
                
                weekDays.forEach(day => {
                    const dayHabits = get().getHabitsForDate(day);
                    const dayStr = format(day, 'yyyy-MM-dd');
                    totalHabits += dayHabits.length;
                    dayHabits.forEach(habit => {
                        if (get().getHabitCompletion(habit.id, dayStr)) {
                            completedHabits++;
                        }
                    });
                });
                
                const successRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
                
                const allHabits = get().habits.filter(h => !h.archived);
                const totalStreak = allHabits.reduce((sum, habit) => sum + get().getHabitStreak(habit.id), 0);
                
                return { successRate, totalStreak };
            },
            getHabitStats: (habitId, days) => {
                const today = new Date();
                const startDate = subDays(today, days - 1);
                const dateRange = eachDayOfInterval({ start: startDate, end: today });
                
                const habit = get().habits.find(h => h.id === habitId);
                if (!habit) return { completionRate: 0, completedDays: 0, totalDays: 0 };
                
                let completedDays = 0;
                let totalDays = 0;
                
                dateRange.forEach(day => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const dayOfWeek = getDay(day);
                    
                    const isScheduled = habit.frequency === 'daily' 
                        ? habit.targetDays.includes(dayOfWeek)
                        : habit.targetDays.includes(dayOfWeek);
                    
                    if (isScheduled) {
                        totalDays++;
                        if (get().getHabitCompletion(habitId, dayStr)) {
                            completedDays++;
                        }
                    }
                });
                
                const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
                
                return { completionRate, completedDays, totalDays };
            },
            addExampleData: () => {
                const state = get();
                if (state.exampleHabitIds.length > 0) return;

                const now = new Date();
                const exampleHabits: Habit[] = [
                    {
                        id: 'example-1',
                        title: 'Morning Exercise',
                        description: '30 minutes of exercise',
                        color: '#3b82f6',
                        icon: '🏃',
                        category: 'fitness',
                        frequency: 'daily',
                        targetDays: [1, 2, 3, 4, 5],
                        goalType: 'boolean',
                        reminderTime: '07:00',
                        createdAt: format(subDays(now, 10), 'yyyy-MM-dd'),
                        archived: false,
                    },
                    {
                        id: 'example-2',
                        title: 'Read Books',
                        description: 'Read for 30 minutes',
                        color: '#8b5cf6',
                        icon: '📚',
                        category: 'study',
                        frequency: 'daily',
                        targetDays: [0, 1, 2, 3, 4, 5, 6],
                        goalType: 'boolean',
                        reminderTime: '20:00',
                        createdAt: format(subDays(now, 15), 'yyyy-MM-dd'),
                        archived: false,
                    },
                    {
                        id: 'example-3',
                        title: 'Drink Water',
                        description: 'Drink 8 glasses of water',
                        color: '#06b6d4',
                        icon: '💧',
                        category: 'health',
                        frequency: 'daily',
                        targetDays: [0, 1, 2, 3, 4, 5, 6],
                        goalType: 'numeric',
                        dailyGoal: 8,
                        createdAt: format(subDays(now, 5), 'yyyy-MM-dd'),
                        archived: false,
                    },
                ];

                const exampleLogs: Record<string, HabitLog[]> = {};
                const habitIds: string[] = [];

                exampleHabits.forEach((habit) => {
                    habitIds.push(habit.id);
                    const logs: HabitLog[] = [];
                    
                    for (let i = 0; i < 14; i++) {
                        const date = subDays(now, i);
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const dayOfWeek = getDay(date);
                        
                        if (habit.targetDays.includes(dayOfWeek)) {
                            const shouldComplete = Math.random() > 0.3;
                            if (shouldComplete) {
                                logs.push({
                                    id: `log-${habit.id}-${i}`,
                                    habitId: habit.id,
                                    date: dateStr,
                                    completed: true,
                                    timestamp: date.getTime(),
                                });
                            }
                        }
                    }
                    
                    exampleLogs[habit.id] = logs;
                });

                set((currentState) => ({
                    habits: [...currentState.habits, ...exampleHabits],
                    logs: { ...currentState.logs, ...exampleLogs },
                    exampleHabitIds: habitIds,
                }));

                exampleHabits.forEach((habit) => {
                    if (habit.reminderTime) {
                        scheduleHabitNotification(habit);
                    }
                });
            },
            removeExampleData: () => {
                const state = get();
                const exampleIds = state.exampleHabitIds;
                
                if (exampleIds.length === 0) return;

                exampleIds.forEach((id) => {
                    cancelHabitNotifications(id);
                });

                set((currentState) => {
                    const newLogs = { ...currentState.logs };
                    exampleIds.forEach((id) => {
                        delete newLogs[id];
                    });

                    return {
                        habits: currentState.habits.filter((h) => !exampleIds.includes(h.id)),
                        logs: newLogs,
                        exampleHabitIds: [],
                    };
                });
            },
            hasExampleData: () => {
                return get().exampleHabitIds.length > 0;
            },
        }),
        {
            name: 'habit-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
