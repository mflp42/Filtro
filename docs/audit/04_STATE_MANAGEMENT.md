# State Management Analysis

**Generated:** December 17, 2024

---

## AsyncStorage Keys

| Key | Used In | Purpose |
|-----|---------|---------|
| `@camera_app_profile` | profileService.js | Store user profile (name, bio, picture, media) |

## Profile Data Schema

```javascript
{
  name: string,           // 1-25 characters
  bio: string,            // 0-150 characters
  profilePicture: string | null,  // file:// URI
  media: Array<{
    uri: string,          // file:// URI
    type: 'photo' | 'video',
    duration: number      // seconds (videos only)
  }>
}
```

## Navigation Param Passing

| Route | Params | Source |
|-------|--------|--------|
| EditProfile | `{ profile }` | ProfileScreen |
| MediaViewer | `{ uri, type }` | ProfileScreen, GalleryScreen |

## State Flow Patterns

### Profile Update Flow
1. ProfileScreen loads profile via `profileService.loadProfile()`
2. User taps edit → navigates to EditProfileScreen with profile
3. EditProfileScreen modifies → saves via `profileService.saveProfile()`
4. Navigate back → ProfileScreen reloads via `useFocusEffect`

### Media Selection Flow
1. GalleryScreen displays media from device
2. User selects media → stored in local `selectedItems` Set
3. User taps "Add to Profile" → calls `profileService.addMediaToProfile()`
4. Media appended to profile.media array
5. ProfileScreen displays media in grid with pagination
