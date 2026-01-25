# Calorie Tracker 🍎

A comprehensive calorie and nutrition tracking app built with React Native and Expo. Track your daily food intake, monitor sugar consumption, set goals, and maintain a healthy lifestyle.

## Features ✨

### 📊 Dashboard
- **Daily Summary**: View today's total calories, sugar, protein, carbs, and fat
- **Progress Tracking**: Visual progress bars towards your daily calorie and sugar goals
- **Goal Alerts**: Get warnings when approaching or exceeding your daily limits
- **Sugar Monitoring**: Special focus on sugar intake with color-coded progress indicators

### 🍽️ Meal Logging
- **Food Database**: Quick access to 80+ common foods with nutritional information
- **Manual Entry**: Add custom foods with complete nutritional details
- **Photo Support**: Attach photos to your meals for visual tracking
- **Multiple Meal Types**: Log breakfast, lunch, dinner, and snacks
- **Past Date Logging**: Add meals for any past date with calendar picker
- **Portion Selection**: Choose from common portions or enter custom quantities

### 📅 History & Analytics
- **7-Day Overview**: Visual summary of the last 7 days with calorie bars
- **Daily Breakdown**: Detailed nutritional breakdown for any selected day
- **Meal Cards**: View all meals with photos, nutritional info, and timestamps
- **Delete Meals**: Remove mistakenly logged meals with confirmation

### 🎯 Goal Setting
- **Calorie Targets**: Set daily calorie goals
- **Sugar Limits**: Define maximum daily sugar intake
- **Progress Tracking**: Monitor your progress towards goals
- **Visual Indicators**: Color-coded progress (green → yellow → red)

### ⚙️ Accessibility
- **Dark Mode**: Choose between Light, Dark, or System theme
- **Font Scaling**: Adjust text size (Small, Medium, Large, Extra Large)
- **High Contrast**: Improved readability with adjustable themes
- **Persistent Settings**: Your preferences are saved automatically

### 🎨 User Interface
- **Clean Design**: Modern, intuitive interface
- **Visual Feedback**: Color-coded progress indicators
- **Responsive**: Works on mobile, tablet, and web
- **Theme Support**: Full dark mode support across all screens

## Getting Started 🚀

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```bash
git clone https://github.com/CJ-1981/calory-tracker.git
cd calory-tracker
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npx expo start
```

4. Run on your preferred platform
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web browser
- Scan QR code for Expo Go app on mobile

## Tech Stack 🛠️

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Redux Toolkit
- **Storage**: AsyncStorage for data persistence
- **Styling**: React Native StyleSheet with theme support
- **Icons**: Expo Vector Icons (Ionicons)
- **Image Picker**: expo-image-picker
- **Date Picker**: @react-native-community/datetimepicker

## Project Structure 📁

```
calory-tracker/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Dashboard
│   │   ├── history.tsx    # History & analytics
│   │   ├── add-meal.tsx   # Add meal screen
│   │   └── goals.tsx      # Goal settings
│   └── _layout.tsx        # Root layout with theme provider
├── src/
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts (Theme)
│   ├── models/            # TypeScript interfaces
│   ├── store/             # Redux store & slices
│   ├── theme/             # Theme configuration
│   └── utils/             # Helper functions
└── assets/                # Images, fonts, etc.
```

## Key Features Explained 💡

### Dark Mode & Accessibility
- Toggle between Light, Dark, and System themes
- Adjust font size across 4 levels (Small to Extra Large)
- All screens support both themes seamlessly
- Settings persist across app restarts

### Food Database
- 80+ pre-loaded foods with accurate nutritional data
- Categories: Fruits, Vegetables, Proteins, Grains, Dairy, Snacks, Beverages, Desserts
- Common portions for easy selection (e.g., "1 cup", "1 slice", "100g")
- Search and filter by category

### Photo Support
- Take photos directly or choose from gallery
- Fullscreen viewing by tapping on meal photos
- Photos persist with meal data
- Remove photos easily with X button

### Date Picker
- Log meals for any date (not just today)
- Mobile: Native iOS/Android calendar picker
- Web: Custom modal with last 30 days
- Visual date formatting (e.g., "Sat, Jan 25, 2026")

### Delete Functionality
- Delete meals from Dashboard or History screens
- Confirmation dialog to prevent accidental deletions
- Works on web and mobile platforms

## Data Persistence 💾

- **AsyncStorage**: All data stored locally on device
- **Meals**: Complete meal history with photos
- **Goals**: Your calorie and sugar targets
- **Settings**: Theme and font size preferences
- **Offline**: Works without internet connection

## Deployment 🌐

### Vercel (Web)
The app is automatically deployed to Vercel on push to main branch:
- Live: https://calory-tracker-phi.vercel.app/

### Mobile (iOS/Android)
To build standalone apps:
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit issues or pull requests.

## License 📄

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments 🙏

Built with:
- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Expo Router](https://docs.expo.dev/router/)

---

**Note**: This app is designed for personal tracking and educational purposes. Always consult healthcare professionals for medical advice regarding nutrition and diet.
# Last deployed: Sun Jan 25 19:32:17 CET 2026
