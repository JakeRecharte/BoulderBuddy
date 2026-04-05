# BoulderBuddy

A mobile app for bouldering enthusiasts to log climbs, track progress, and connect with other climbers.

## Features

- **Log Routes** — Record climbs with gym name, route name, grade (V-scale), notes, and photos
- **Feed** *(coming soon)* — See posts and activity from other climbers
- **Nearby Gyms** *(coming soon)* — Discover climbing gyms near you
- **Profile** *(coming soon)* — View your climbing history and stats

## Tech Stack

- [Expo](https://expo.dev) / React Native
- TypeScript
- expo-router (file-based navigation)
- AsyncStorage (local data persistence)
- expo-image-picker (camera & photo library)

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

   Then open in an [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/), [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/), or [Expo Go](https://expo.dev/go).

## Project Structure

```
app/
  (tabs)/         # Main tab screens
    index.tsx         # Home
    routeEntryPage.tsx  # Log a climb
    feedPage.tsx        # Social feed
    nearbyGymPage.tsx   # Find gyms
    ProfilePage.tsx     # User profile
components/       # Reusable UI components
constants/        # Theme colors and fonts
hooks/            # Custom React hooks
```
