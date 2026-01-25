import { Platform } from 'react-native';
import { Alert as RNAlert } from 'react-native';

export const Alert = {
  alert: (title: string, message?: string, buttons?: Array<{ text: string; onPress?: () => void; style?: string }>) => {
    if (Platform.OS === 'web') {
      // For web, use browser's confirm for destructive actions, alert for others
      if (buttons && buttons.length > 1) {
        // Check if this is a confirmation dialog (has destructive button)
        const hasDestructive = buttons.some(btn => btn.style === 'destructive');
        if (hasDestructive) {
          const confirmed = window.confirm(`${title}\n\n${message || ''}`);
          if (confirmed) {
            // Find and execute the destructive button's action
            const destructiveBtn = buttons.find(btn => btn.style === 'destructive');
            if (destructiveBtn?.onPress) {
              destructiveBtn.onPress();
            }
          }
        } else {
          // For non-destructive dialogs, just show alert and execute first action
          window.alert(`${title}\n\n${message || ''}`);
          if (buttons[0].onPress) {
            buttons[0].onPress();
          }
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
