# Changelog

All notable changes to the Calorie Tracker app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-01-25

### Added
- **Meal Presets Feature**: Save and load meal combinations for quick logging
  - Save current meal as named preset (e.g., "My Breakfast")
  - Load presets to add multiple foods at once
  - View nutrition info for each preset
  - Delete unwanted presets
  - Persists across app restarts

### Changed
- Improved meal logging workflow with preset templates
- Better organization for repeated meal combinations

## [1.0.0] - 2025-01-25

### Added
- **Core Features**:
  - Daily calorie and sugar tracking
  - Meal logging with food database (80+ foods)
  - Manual food entry with full nutritional info
  - Photo attachment for meals
  - Meal history with 7-day overview
  - Daily nutritional breakdown (calories, sugar, protein, carbs, fat)
  - Goal setting (calories, sugar, macros)
  - Progress tracking with visual indicators
  - Sugar alerts and warnings

- **Accessibility**:
  - Dark mode (Light/Dark/System themes)
  - Font size scaling (Small/Medium/Large/Extra Large)
  - Full theme support across all screens

- **User Interface**:
  - Dashboard with daily summary
  - History view with date picker
  - Add meal screen with food database search
  - Goals settings with quick adjustment buttons
  - Settings page for accessibility options
  - Meal cards with food details
  - Fullscreen photo viewing

- **Data Management**:
  - Delete meals with confirmation
  - AsyncStorage for data persistence
  - Offline functionality

- **Date Picker**:
  - Log meals for past dates
  - Calendar picker for mobile
  - Custom web date picker modal

### Features
- 80+ food database with categories
- Common portions for easy selection
- Quick adjustment buttons for goals
- Visual progress indicators
- Clean, modern interface
