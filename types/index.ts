export type Frequency = 'daily' | 'weekly' | 'custom';
export type GoalType = 'boolean' | 'numeric';
export type Category = 'health' | 'study' | 'personal' | 'fitness' | 'work' | 'other';

export type Habit = {
    id: string;
    title: string;
    description?: string;
    color: string;
    icon: string;
    category: Category;
    frequency: Frequency;
    targetDays: number[]; // 0 = Sunday, 1 = Monday, etc.
    goalType: GoalType;
    dailyGoal?: number; // For numeric goals
    reminderTime?: string; // HH:mm format
    createdAt: string;
    archived: boolean;
};

export type HabitLog = {
    id: string;
    habitId: string;
    date: string; // YYYY-MM-DD
    completed: boolean;
    timestamp: number;
};

export type RootStackParamList = {
    '(tabs)': undefined;
    'create-habit': undefined;
    'edit-habit': { habitId: string };
    'habit-detail': { habitId: string };
};
