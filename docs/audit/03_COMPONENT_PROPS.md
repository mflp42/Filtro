# Component Props Documentation

**Generated:** December 17, 2024

---

## SCREENS

### src\screens\CameraScreen.js

**Path:** `src/screens/CameraScreen.js`

**Component:** `CameraScreen`

**Props:** `navigation`

**State Variables (5):** `capturedMedia`, `facing`, `flash`, `mode`, `recordingDuration`

**Custom Hooks:** `useCamera`, `usePermissions`

---

### src\screens\EditProfileScreen.js

**Path:** `src/screens/EditProfileScreen.js`

**Component:** `EditProfileScreen`

**Props:** `navigation`, `route`

**State Variables (4):** `name`, `bio`, `profilePicture`, `saving`

---

### src\screens\GalleryScreen.js

**Path:** `src/screens/GalleryScreen.js`

**Component:** `GalleryScreen`

**Props:** `navigation`

**State Variables (3):** `activeTab`, `selectionMode`, `selectedItems`

**Custom Hooks:** `useFocusEffect`, `useGallery`

**Navigates To:** `MediaViewer`

---

### src\screens\MediaViewerScreen.js

**Path:** `src/screens/MediaViewerScreen.js`

**Component:** `MediaViewerScreen`

**Props:** `route`, `navigation`

**State Variables (1):** `videoStatus`

**Custom Hooks:** `useNativeControls`

---

### src\screens\ProfileScreen.js

**Path:** `src/screens/ProfileScreen.js`

**Component:** `ProfileScreen`

**Props:** `navigation`

**State Variables (4):** `profile`, `displayedMedia`, `editMode`, `selectedItems`

**Custom Hooks:** `useFocusEffect`

**Navigates To:** `Camera`, `EditProfile`, `Gallery`, `MediaViewer`

---

## COMPONENTS

### src\components\CaptureButton.js

**Path:** `src/components/CaptureButton.js`

**Component:** `CaptureButton`

**Props:** `onPress`, `loading`, `isRecording`, `mode`

---

### src\components\CapturedThumbnail.js

**Path:** `src/components/CapturedThumbnail.js`

**Component:** `CapturedThumbnail`

**Props:** `uri`, `isVideo`, `onDelete`

---

### src\components\ProfileHeader.js

**Path:** `src/components/ProfileHeader.js`

**Component:** `ProfileHeader`

**Props:** `name`, `bio`, `profilePicture`, `onEditPress`

---


**Total Components:** 8
