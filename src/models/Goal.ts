export interface Goal {
  id: string;
  calorieTarget: number;
  sugarTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  startDate: string;
  isActive: boolean;
  warningsEnabled: boolean;
}

export type WarningSeverity = 'info' | 'warning' | 'danger';

export interface SugarWarning {
  id: string;
  date: string;
  type: 'approaching' | 'exceeded' | 'daily_limit' | 'meal_spike';
  currentSugar: number;
  limit: number;
  mealId?: string;
  message: string;
  severity: WarningSeverity;
  dismissed: boolean;
}

export interface ProgressStatus {
  percentage: number;
  status: 'on_track' | 'approaching' | 'warning' | 'exceeded';
}
