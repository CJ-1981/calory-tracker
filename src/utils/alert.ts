import { Platform } from 'react-native';
import { Alert as RNAlert } from 'react-native';

export const Alert = {
  alert: (title: string, message?: string, buttons?: Array<{ text: string; onPress?: () => void }>) => {
    if (Platform.OS === 'web') {
      // For web, use browser's alert and confirm
      if (buttons && buttons.length > 0) {
        // If there are buttons, show a simple alert and execute the first button's action
        window.alert(`${title}\n\n${message || ''}`);
        if (buttons[0].onPress) {
          buttons[0].onPress();
        }
      } else {
        window.alert(`${title}\n\n${message || ''}`);
      }
    } else {
      // For native platforms, use React Native's Alert
      RNAlert.alert(title, message, buttons);
    }
  },
};
