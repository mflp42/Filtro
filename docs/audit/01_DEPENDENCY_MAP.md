# Dependency Map - Import/Export Analysis

**Generated:** December 17, 2024  
**Total Files:** 19  
**Purpose:** Map all dependencies to prevent bugs and enable predictive change management

---

## Summary by Category

| Category | Files | Total Exports | Internal Deps | External Deps |
|----------|-------|---------------|---------------|---------------|
| SERVICES | 3 | 8 | 0 | 3 |
| HOOKS | 3 | 3 | 1 | 6 |
| SCREENS | 5 | 5 | 19 | 19 |
| COMPONENTS | 3 | 3 | 2 | 8 |
| UTILS | 2 | 4 | 0 | 1 |
| STYLES | 2 | 2 | 1 | 1 |
| NAVIGATION | 1 | 1 | 5 | 3 |

---

## Key Insights

### Most Connected Files

**Highest Internal Dependencies:**
- src\screens\CameraScreen.js: 7 internal imports
- src\navigation\AppNavigator.js: 5 internal imports
- src\screens\ProfileScreen.js: 4 internal imports
- src\screens\GalleryScreen.js: 4 internal imports
- src\screens\EditProfileScreen.js: 3 internal imports

**Most Exports:**
- src\services\profileService.js: 4 exports
- src\services\storageService.js: 3 exports
- src\utils\constants.js: 2 exports
- src\utils\fileHelpers.js: 2 exports
- src\services\cameraService.js: 1 exports

### Dependency-Free Files

Files with zero internal dependencies: 9
- src\components\CapturedThumbnail.js
- src\hooks\useGallery.js
- src\hooks\usePermissions.js
- src\services\cameraService.js
- src\services\profileService.js
- src\services\storageService.js
- src\styles\colors.js
- src\utils\constants.js
- src\utils\fileHelpers.js

---

## SERVICES

### src\services\cameraService.js

**Path:** `src/services/cameraService.js`

**Exports:**
- `takePicture`

**Internal Dependencies:**
- *(none)*

**External Dependencies:** 0 packages

---

### src\services\profileService.js

**Path:** `src/services/profileService.js`

**Exports:**
- `loadProfile`
- `saveProfile`
- `addMediaToProfile`
- `removeMediaFromProfile`

**Internal Dependencies:**
- *(none)*

**External Dependencies:** 1 packages
<details><summary>View external imports</summary>

- `@react-native-async-storage/async-storage`

</details>

---

### src\services\storageService.js

**Path:** `src/services/storageService.js`

**Exports:**
- `savePhoto`
- `saveVideo`
- `saveToGallery`

**Internal Dependencies:**
- *(none)*

**External Dependencies:** 2 packages
<details><summary>View external imports</summary>

- `expo-file-system/legacy`
- `expo-media-library`

</details>

---

## HOOKS

### src\hooks\useCamera.js

**Path:** `src/hooks/useCamera.js`

**Exports:**
- `[default] useCamera`

**Internal Dependencies:**
- `../services/cameraService`

**External Dependencies:** 1 packages
<details><summary>View external imports</summary>

- `react`

</details>

---

### src\hooks\useGallery.js

**Path:** `src/hooks/useGallery.js`

**Exports:**
- `[default] useGallery`

**Internal Dependencies:**
- *(none)*

**External Dependencies:** 2 packages
<details><summary>View external imports</summary>

- `expo-media-library`
- `react`

</details>

---

### src\hooks\usePermissions.js

**Path:** `src/hooks/usePermissions.js`

**Exports:**
- `[default] usePermissions`

**Internal Dependencies:**
- *(none)*

**External Dependencies:** 3 packages
<details><summary>View external imports</summary>

- `expo-camera`
- `expo-media-library`
- `react`

</details>

---

## SCREENS

### src\screens\CameraScreen.js

**Path:** `src/screens/CameraScreen.js`

**Exports:**
- `[default] CameraScreen`

**Internal Dependencies:**
- `../styles/globalStyles`
- `../styles/colors`
- `../hooks/usePermissions`
- `../hooks/useCamera`
- `../components/CaptureButton`
- `../components/CapturedThumbnail`
- `../services/storageService`

**External Dependencies:** 4 packages
<details><summary>View external imports</summary>

- `expo-camera`
- `react`
- `react-native`

</details>

---

### src\screens\EditProfileScreen.js

**Path:** `src/screens/EditProfileScreen.js`

**Exports:**
- `[default] EditProfileScreen`

**Internal Dependencies:**
- `../styles/globalStyles`
- `../styles/colors`
- `../services/profileService`

**External Dependencies:** 3 packages
<details><summary>View external imports</summary>

- `expo-image-picker`
- `react`
- `react-native`

</details>

---

### src\screens\GalleryScreen.js

**Path:** `src/screens/GalleryScreen.js`

**Exports:**
- `[default] GalleryScreen`

**Internal Dependencies:**
- `../styles/globalStyles`
- `../styles/colors`
- `../hooks/useGallery`
- `../services/profileService`

**External Dependencies:** 4 packages
<details><summary>View external imports</summary>

- `@react-navigation/native`
- `expo-image`
- `react`
- `react-native`

</details>

---

### src\screens\MediaViewerScreen.js

**Path:** `src/screens/MediaViewerScreen.js`

**Exports:**
- `[default] MediaViewerScreen`

**Internal Dependencies:**
- `../styles/colors`

**External Dependencies:** 4 packages
<details><summary>View external imports</summary>

- `expo-av`
- `expo-image`
- `react`
- `react-native`

</details>

---

### src\screens\ProfileScreen.js

**Path:** `src/screens/ProfileScreen.js`

**Exports:**
- `[default] ProfileScreen`

**Internal Dependencies:**
- `../styles/globalStyles`
- `../styles/colors`
- `../components/ProfileHeader`
- `../services/profileService`

**External Dependencies:** 4 packages
<details><summary>View external imports</summary>

- `@react-navigation/native`
- `expo-image`
- `react`
- `react-native`

</details>

---

## COMPONENTS

### src\components\CaptureButton.js

**Path:** `src/components/CaptureButton.js`

**Exports:**
- `[default] CaptureButton`

**Internal Dependencies:**
- `../styles/colors`

**External Dependencies:** 2 packages
<details><summary>View external imports</summary>

- `react`
- `react-native`

</details>

---

### src\components\CapturedThumbnail.js

**Path:** `src/components/CapturedThumbnail.js`

**Exports:**
- `[default] CapturedThumbnail`

**Internal Dependencies:**
- *(none)*

**External Dependencies:** 3 packages
<details><summary>View external imports</summary>

- `expo-image`
- `react`
- `react-native`

</details>

---

### src\components\ProfileHeader.js

**Path:** `src/components/ProfileHeader.js`

**Exports:**
- `[default] ProfileHeader`

**Internal Dependencies:**
- `../styles/colors`

**External Dependencies:** 3 packages
<details><summary>View external imports</summary>

- `expo-image`
- `react`
- `react-native`

</details>

---

## UTILS

### src\utils\constants.js

**Path:** `src/utils/constants.js`

**Exports:**
- `PERMISSIONS`
- `PERMISSION_STATUS`

**Internal Dependencies:**
- *(none)*

**External Dependencies:** 0 packages

---

### src\utils\fileHelpers.js

**Path:** `src/utils/fileHelpers.js`

**Exports:**
- `generatePhotoFilename`
- `getPhotosDirectory`

**Internal Dependencies:**
- *(none)*

**External Dependencies:** 1 packages
<details><summary>View external imports</summary>

- `expo-file-system/legacy`

</details>

---

## STYLES

### src\styles\colors.js

**Path:** `src/styles/colors.js`

**Exports:**
- `colors`

**Internal Dependencies:**
- *(none)*

**External Dependencies:** 0 packages

---

### src\styles\globalStyles.js

**Path:** `src/styles/globalStyles.js`

**Exports:**
- `globalStyles`

**Internal Dependencies:**
- `./colors`

**External Dependencies:** 1 packages
<details><summary>View external imports</summary>

- `react-native`

</details>

---

## NAVIGATION

### src\navigation\AppNavigator.js

**Path:** `src/navigation/AppNavigator.js`

**Exports:**
- `[default] AppNavigator`

**Internal Dependencies:**
- `../screens/ProfileScreen`
- `../screens/EditProfileScreen`
- `../screens/CameraScreen`
- `../screens/GalleryScreen`
- `../screens/MediaViewerScreen`

**External Dependencies:** 3 packages
<details><summary>View external imports</summary>

- `@react-navigation/native`
- `@react-navigation/native-stack`
- `react`

</details>

---

## Circular Dependency Analysis

✅ **No circular dependencies detected!**

All internal imports follow a proper dependency hierarchy.
