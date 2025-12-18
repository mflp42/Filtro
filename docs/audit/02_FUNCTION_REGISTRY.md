# Function Registry - Complete Signature Documentation

**Generated:** December 17, 2024  
**Updated:** December 17, 2024 (Post-video recording fix)  
**Purpose:** Document all exported functions to verify call signatures and enable change impact analysis

---

## SERVICES

### src\services\cameraService.js

**Path:** `src/services/cameraService.js`

**Exported Functions (1):**

#### `async takePicture(camera)`

- **Type:** arrow
- **Parameters:** camera
- **Async:** Yes

---

### src\services\profileService.js

**Path:** `src/services/profileService.js`

**Exported Functions (4):**

#### `async loadProfile()`

- **Type:** arrow
- **Parameters:** no parameters
- **Async:** Yes

#### `async saveProfile(profile)`

- **Type:** arrow
- **Parameters:** profile
- **Async:** Yes

#### `async addMediaToProfile(mediaItems)`

- **Type:** arrow
- **Parameters:** mediaItems
- **Async:** Yes

#### `async removeMediaFromProfile(urisToRemove)`

- **Type:** arrow
- **Parameters:** urisToRemove
- **Async:** Yes

---

### src\services\storageService.js

**Path:** `src/services/storageService.js`

**Exported Functions (3):**

#### `async savePhoto(photoUri)`

- **Type:** function
- **Parameters:** photoUri
- **Async:** Yes

#### `async saveVideo(videoUri)`

- **Type:** function
- **Parameters:** videoUri
- **Async:** Yes

#### `async saveToGallery(uri)`

- **Type:** function
- **Parameters:** uri
- **Async:** Yes

---

## HOOKS

### src\hooks\useCamera.js

**Path:** `src/hooks/useCamera.js`

**Exported Functions (1):**

#### `useCamera()`

- **Type:** default
- **Parameters:** no parameters
- **Async:** No

---

### src\hooks\useGallery.js

**Path:** `src/hooks/useGallery.js`

**Exported Functions (1):**

#### `useGallery()`

- **Type:** default
- **Parameters:** no parameters
- **Async:** No

---

### src\hooks\usePermissions.js

**Path:** `src/hooks/usePermissions.js`

**Exported Functions (1):**

#### `usePermissions()`

- **Type:** default
- **Parameters:** no parameters
- **Async:** No

---

## SCREENS

### src\screens\CameraScreen.js

**Path:** `src/screens/CameraScreen.js`

**Exported Functions (1):**

#### `CameraScreen({ navigation })`

- **Type:** default
- **Parameters:** { navigation }
- **Async:** No

---

### src\screens\EditProfileScreen.js

**Path:** `src/screens/EditProfileScreen.js`

**Exported Functions (1):**

#### `EditProfileScreen({ navigation, route })`

- **Type:** default
- **Parameters:** { navigation, route }
- **Async:** No

---

### src\screens\GalleryScreen.js

**Path:** `src/screens/GalleryScreen.js`

**Exported Functions (1):**

#### `GalleryScreen({ navigation })`

- **Type:** default
- **Parameters:** { navigation }
- **Async:** No

---

### src\screens\MediaViewerScreen.js

**Path:** `src/screens/MediaViewerScreen.js`

**Exported Functions (1):**

#### `MediaViewerScreen({ route, navigation })`

- **Type:** default
- **Parameters:** { route, navigation }
- **Async:** No

---

### src\screens\ProfileScreen.js

**Path:** `src/screens/ProfileScreen.js`

**Exported Functions (1):**

#### `ProfileScreen({ navigation })`

- **Type:** default
- **Parameters:** { navigation }
- **Async:** No

---

## COMPONENTS

### src\components\CaptureButton.js

**Path:** `src/components/CaptureButton.js`

**Exported Functions (1):**

#### `CaptureButton({ onPress, loading, isRecording, mode })`

- **Type:** default
- **Parameters:** { onPress, loading, isRecording, mode }
- **Async:** No

---

### src\components\CapturedThumbnail.js

**Path:** `src/components/CapturedThumbnail.js`

**Exported Functions (1):**

#### `CapturedThumbnail({ uri, isVideo, onDelete })`

- **Type:** default
- **Parameters:** { uri, isVideo, onDelete }
- **Async:** No

---

### src\components\ProfileHeader.js

**Path:** `src/components/ProfileHeader.js`

**Exported Functions (1):**

#### `ProfileHeader({ name, bio, profilePicture, onEditPress })`

- **Type:** default
- **Parameters:** { name, bio, profilePicture, onEditPress }
- **Async:** No

---

## UTILS

### src\utils\constants.js

**Path:** `src/utils/constants.js`

**Exports:** Styles or constants only

---

### src\utils\fileHelpers.js

**Path:** `src/utils/fileHelpers.js`

**Exported Functions (2):**

#### `generatePhotoFilename()`

- **Type:** arrow
- **Parameters:** no parameters
- **Async:** No

#### `async getPhotosDirectory()`

- **Type:** arrow
- **Parameters:** no parameters
- **Async:** Yes

---

## Summary


**Total Functions Documented:** 21


### Recent Fixes

**Video Recording Issue (Fixed Dec 17, 2024):**
- Added `recordingRef` to useCamera.js to store recording promise
- Fixed `stopRecording()` to properly await stored promise
- Added proper cleanup of `recordingRef` on success/error


### Function Call Checklist

When calling these functions:

1. ✅ Verify parameter count matches
2. ✅ Verify parameter types match expected
3. ✅ Use await for async functions
4. ✅ Handle errors with try-catch for async
5. ✅ Check return value handling
6. ✅ For video recording: ensure recordingRef pattern is followed
