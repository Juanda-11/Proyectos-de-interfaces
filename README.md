# FoodLink V2

Mobile-only React Native / Expo prototype for the Diseño de Interfaces project.

## What is included

- Expo SDK 57 compatible setup
- Home dashboard
- Donor / Receiver role selector
- AI food analysis simulation
- Donation publication flow
- Donation lifecycle cards
- Explore feed with distance filters
- Visual map prototype
- Activity and notifications
- Impact dashboard
- Profile screen
- Bottom navigation
- Mobile-first layout with a centered phone preview on web
- Animations and gradients

## Run

```bash
npm install
npx expo-doctor
npx expo start -c
```

For an iPhone connected to the same network, scan the Expo CLI QR with Expo Go. If LAN connectivity is problematic, use:

```bash
npx expo start --tunnel
```

Do not use `npm audit fix --force` for the SDK upgrade.

## Important

The AI, map, QR and data are intentionally simulated for this university prototype. They can be connected to real services in a later stage without changing the main UX structure.
