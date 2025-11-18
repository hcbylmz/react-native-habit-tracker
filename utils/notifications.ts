import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Habit } from '../types';
import { getDay, parse } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  
  return finalStatus === 'granted';
}

export async function scheduleHabitNotification(habit: Habit) {
  if (!habit.reminderTime) return;

  try {
    await requestPermissions();
    
    const [hours, minutes] = habit.reminderTime.split(':').map(Number);
    
    if (habit.frequency === 'daily') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time for ${habit.title}!`,
          body: habit.description || 'Don\'t forget to complete your habit',
          sound: true,
          data: { habitId: habit.id },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
    } else if (habit.frequency === 'weekly' && habit.targetDays.length > 0) {
      for (const dayIndex of habit.targetDays) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Time for ${habit.title}!`,
            body: habit.description || 'Don\'t forget to complete your habit',
            sound: true,
            data: { habitId: habit.id, day: dayIndex },
          },
          trigger: {
            weekday: dayIndex === 0 ? 7 : dayIndex,
            hour: hours,
            minute: minutes,
            repeats: true,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

export async function cancelHabitNotifications(habitId: string) {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = notifications.filter(n => n.content.data?.habitId === habitId);
  
  for (const notification of toCancel) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
}

export async function updateHabitNotification(habit: Habit) {
  await cancelHabitNotifications(habit.id);
  await scheduleHabitNotification(habit);
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

