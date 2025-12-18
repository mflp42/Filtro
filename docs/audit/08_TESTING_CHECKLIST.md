# Testing Checklist - Verification Protocol

**Generated:** December 17, 2024

---

## Pre-Testing Setup


- [ ] Physical Android device connected
- [ ] Dev server running: `npx expo start --dev-client --tunnel`
- [ ] App installed and launched successfully
- [ ] No console errors on startup


## Phase 1: Core Functionality Tests


### Profile Screen
- [ ] App launches without crash
- [ ] Profile displays with name, bio, avatar
- [ ] Edit button appears in top-right of ProfileHeader
- [ ] "Open Camera" button visible
- [ ] "View Gallery" button visible


### Edit Profile
- [ ] Tapping edit button navigates to EditProfileScreen
- [ ] Current profile values pre-populated
- [ ] Can edit name (validates 1-25 chars)
- [ ] Can edit bio (validates 0-150 chars)
- [ ] Character counter updates correctly
- [ ] Can change profile picture via camera
- [ ] Can change profile picture via gallery
- [ ] Save button works
- [ ] Back navigation works
- [ ] Profile updates persist after app restart


### Camera - Photo Mode
- [ ] Camera permission requested on first use
- [ ] Camera preview displays
- [ ] Flash toggle button works (off/on/auto)
- [ ] Camera flip button works (front/back)
- [ ] Can take photo
- [ ] Photo appears in thumbnail strip
- [ ] Can take multiple photos
- [ ] Can delete photo from thumbnail (X button)
- [ ] Photo counter updates correctly
- [ ] "Done" button saves all photos
- [ ] "Cancel" button shows confirmation
- [ ] Cancel confirmation works


### Camera - Video Mode
- [ ] Can switch to video mode
- [ ] Capture button turns red in video mode
- [ ] Flash button hidden in video mode
- [ ] Can start recording
- [ ] Recording indicator shows (REC + timer)
- [ ] Timer counts up correctly
- [ ] Can stop recording manually
- [ ] Auto-stops at 5 minute limit
- [ ] Video thumbnail appears with play icon
- [ ] Can record multiple videos
- [ ] Can mix photos and videos in same session
- [ ] Video duration badge shows on thumbnail


### Gallery
- [ ] Gallery loads photos and videos
- [ ] "All" tab shows both photos and videos
- [ ] "Photos" tab shows only photos
- [ ] "Videos" tab shows only videos
- [ ] Videos have play icon overlay
- [ ] Videos show duration badge
- [ ] Load More button appears if >100 items
- [ ] Load More works correctly
- [ ] Gallery refreshes on screen focus


### Gallery Selection
- [ ] "Select" button appears
- [ ] Tapping Select enters selection mode
- [ ] Checkboxes appear on items
- [ ] Can select multiple items
- [ ] Selection count updates in button
- [ ] "Add to Profile (X)" button appears
- [ ] Tapping Add to Profile works
- [ ] Success alert shows
- [ ] Exits selection mode after adding


### Profile Media Grid
- [ ] Media grid displays in Profile
- [ ] Shows 3-column grid layout
- [ ] Media count shows correctly
- [ ] Can scroll through media
- [ ] Loads more media on scroll (if >18)
- [ ] "Edit" button appears
- [ ] Tapping Edit enters edit mode
- [ ] Checkboxes appear on items
- [ ] Can select multiple items
- [ ] "Delete (X)" button appears
- [ ] Delete shows confirmation
- [ ] Delete removes items from profile
- [ ] "Cancel" button exits edit mode


### Media Viewer
- [ ] Tapping media opens MediaViewer
- [ ] Photos display in full screen
- [ ] Videos display with controls
- [ ] Can play/pause video
- [ ] Close button works
- [ ] Back navigation works


## Phase 2: Edge Cases


### Error Scenarios
- [ ] Deny camera permission → shows prompt to grant
- [ ] Deny media library permission → photos still save to app
- [ ] No photos in gallery → shows empty state
- [ ] No media in profile → shows empty state
- [ ] Invalid name length → validation works
- [ ] Invalid bio length → validation works


### Navigation Edge Cases
- [ ] Back button works from all screens
- [ ] Camera → Cancel → Back to Profile
- [ ] Gallery → Back → Profile state preserved
- [ ] EditProfile → Cancel → Profile unchanged
- [ ] EditProfile → Save → Profile updates


### State Persistence
- [ ] Close app → Reopen → Profile persists
- [ ] Close app → Reopen → Media in profile persists
- [ ] Background app → Foreground → State restored
- [ ] Take photo → Minimize → Return → Photo still in batch


## Phase 3: Performance


- [ ] Gallery loads in <3 seconds
- [ ] Profile media grid scrolls smoothly
- [ ] Camera preview has no lag
- [ ] Photo capture is instant (<1 second)
- [ ] Video recording starts immediately
- [ ] App memory usage is stable (no leaks)


## Phase 4: UI/UX


- [ ] All buttons have appropriate visual feedback
- [ ] Loading indicators show during async operations
- [ ] Error messages are user-friendly
- [ ] Success messages confirm actions
- [ ] Colors are consistent with theme
- [ ] Text is readable (no truncation)
- [ ] Touch targets are appropriately sized


## Regression Tests (After Any Code Change)


Run these tests after making changes to ensure nothing broke:


### Quick Smoke Test (5 minutes)
1. Launch app
2. Edit profile → Save
3. Take 2 photos → Done
4. Open gallery → Select 2 items → Add to Profile
5. Verify photos appear in Profile


### Full Regression (30 minutes)
- Run all Phase 1 tests
- Run all Phase 2 edge cases
- Verify no console errors


## Test Log Template


```
Date: _______________
Tester: _______________
Device: _______________
App Version: _______________

Tests Passed: ___ / ___
Tests Failed: ___
Critical Issues: ___
Minor Issues: ___

Notes:
_______________________________________________
_______________________________________________
```

## Sign-Off


✅ All tests passed  
✅ No critical issues  
✅ Ready for production (Android)  
⏳ iOS testing pending (when Mac available)
