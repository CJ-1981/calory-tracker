import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, isSameDay } from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDisplayDate = (date: Date): string => {
  return format(date, 'MMM d, yyyy');
};

export const formatDisplayTime = (timestamp: number): string => {
  return format(new Date(timestamp), 'h:mm a');
};

export const getWeekDates = (date: Date = new Date()): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
};

export const getLast7Days = (date: Date = new Date()): Date[] => {
  return Array.from({ length: 7 }, (_, i) => subDays(date, 6 - i));
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const getDayName = (date: Date): string => {
  return format(date, 'EEE');
};

export const getFullDayName = (date: Date): string => {
  return format(date, 'EEEE');
};
