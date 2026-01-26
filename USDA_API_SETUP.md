# USDA FoodData Central API Setup

This app now supports searching the USDA FoodData Central database (400,000+ foods) in addition to the local food database.

## How to Get Your Free API Key

1. Go to https://api.nal.usda.gov/
2. Click "Request an API Key"
3. Fill out the form (it's free and takes ~2 minutes)
4. You'll receive an API key via email

## How to Configure the API Key

### Option 1: Update the Code (For Development)

1. Open `src/utils/usdaApi.ts`
2. Find the line: `const USDA_API_KEY = 'DEMO_KEY';`
3. Replace `'DEMO_KEY'` with your actual API key:
   ```typescript
   const USDA_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
   ```

### Option 2: Environment Variable (Recommended for Production)

1. Install `dotenv`:
   ```bash
   npm install dotenv
   ```

2. Create a `.env` file in your project root:
   ```
   USDA_API_KEY=your_actual_api_key_here
   ```

3. Update `src/utils/usdaApi.ts` to read from environment:
   ```typescript
   const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';
   ```

4. For React Native/Expo, use `expo-constants` or `app.config.js`:
   ```javascript
   // app.config.js
   export default {
     extra: {
       usdaApiKey: process.env.USDA_API_KEY || 'DEMO_KEY',
     },
   };
   ```

## Features

When the API is configured:
- Search 400,000+ foods from the USDA database
- Includes branded foods, restaurant items, and generic foods
- Accurate nutritional information
- Automatic categorization
- Debounced search (500ms) to minimize API calls

When the API is NOT configured:
- App still works with the local food database
- You'll see a warning message in the search interface
- Search is limited to ~150 pre-defined foods

## API Rate Limits

- **Free tier**: 1,000 requests per day
- **No rate limiting**: The API doesn't have strict rate limits
- Our app uses debouncing to minimize unnecessary requests

## Privacy & Data

- No user data is sent to the USDA API
- Only search queries are sent
- Results are not cached permanently (could be added in future)
- The app works offline with the local database

## Troubleshooting

### API returns "401 Unauthorized"
- Check that your API key is correct
- Make sure there are no extra spaces in the key

### Search returns no results
- Try a more general search term (e.g., "apple" instead of "green apple organic")
- The USDA database might not have every food item

### App is slow when searching
- This is normal for API calls
- The app shows a loading indicator
- Local database results are instant

## Disable USDA API Integration

If you want to use only the local database:

1. Open `src/utils/usdaApi.ts`
2. Keep or set: `const USDA_API_KEY = 'DEMO_KEY';`

The app will automatically fall back to the local database.
