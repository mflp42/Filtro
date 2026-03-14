# Filtro

A React Native mobile app for capturing photos, applying color filters, and saving to your device gallery — built with Expo.

## Features

- 📷 In-app camera capture with zoom support
- 🖼️ Device gallery browsing and image selection
- ✂️ Crop tool with handles and overlay UI
- 🎨 Photo editing with color matrix filters
- 🔍 Zoomable image viewer
- 👤 User profile screen
- 💾 Save processed images to media library

## Tech Stack

- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (SDK 54)
- [React Navigation](https://reactnavigation.org/) — native stack navigation
- [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/) — camera access
- [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) — gallery access
- [expo-image-manipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/) — image transformations
- [react-native-color-matrix-image-filters](https://github.com/iyegoroff/react-native-color-matrix-image-filters) — color filter effects
- [expo-media-library](https://docs.expo.dev/versions/latest/sdk/media-library/) — save to gallery
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) + [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) — animations and gestures
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) — local persistence

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Expo Go app on your device, or an Android/iOS simulator

### Installation

```bash
git clone https://github.com/mflp42/filtro.git
cd filtro
npm install
```

### Running

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run in browser (limited camera/gallery functionality)
npm run web
```

## Project Structure

```
filtro/
├── App.js                          # Entry point
├── index.js
├── app.json                        # Expo config
├── assets/                         # Static assets (icons, splash)
└── src/
    ├── components/
    │   ├── CaptureButton.js        # Shutter button UI
    │   ├── CapturedThumbnail.js    # Preview of last captured photo
    │   ├── CropHandle.js           # Draggable corner/edge crop handles
    │   ├── CropOverlay.js          # Crop selection overlay
    │   ├── CropToolbar.js          # Crop action controls
    │   ├── ProfileHeader.js        # Profile screen header
    │   └── ZoomableImage.js        # Pinch-to-zoom image component
    ├── hooks/
    │   ├── useCamera.js            # Camera state and controls
    │   ├── useGallery.js           # Gallery access logic
    │   └── usePermissions.js       # Camera/media permission handling
    ├── navigation/
    │   └── AppNavigator.js         # Stack navigation setup
    ├── screens/
    │   ├── CameraScreen.js         # Main camera capture screen
    │   ├── EditProfileScreen.js    # Edit user profile
    │   ├── GalleryScreen.js        # Browse device photos
    │   ├── ImageViewerScreen.js    # Full-screen zoomable image view
    │   ├── PhotoEditScreen.js      # Filters and image editing
    │   └── ProfileScreen.js        # User profile display
    ├── services/
    │   ├── cameraService.js        # Camera operations
    │   ├── imageService.js         # Image processing logic
    │   ├── profileService.js       # Profile data management
    │   └── storageService.js       # AsyncStorage read/write
    ├── styles/
    │   ├── colors.js               # Color palette
    │   └── globalStyles.js         # Shared style definitions
    └── utils/
        ├── constants.js            # App-wide constants
        ├── CropMath.js             # Crop geometry calculations
        └── FileHelpers.js          # File system utilities
```

## Permissions

This app requires the following device permissions:

- **Camera** — for capturing photos
- **Media Library** — for reading and saving images

## License

MIT
