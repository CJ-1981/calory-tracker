import Constants from 'expo-constants';

/**
 * Get the app version from app.json
 * This provides centralized version management - update version in app.json only
 */
export const getAppVersion = (): string => {
  return Constants.expoConfig?.version || '1.4.0';
};

/**
 * Get the app name from app.json
 */
export const getAppName = (): string => {
  return Constants.expoConfig?.name || 'Calorie Tracker';
};

/**
 * Get full app info
 */
export const getAppInfo = () => {
  return {
    name: getAppName(),
    version: getAppVersion(),
    slug: Constants.expoConfig?.slug || 'calory-tracker',
  };
};
