import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@camera_app_profile';

const DEFAULT_PROFILE = {
  name: 'Your Name',
  bio: 'Tell us about yourself...',
  profilePicture: null,
  media: [], // Array of { uri, type, duration? }
};

export const loadProfile = async () => {
  try {
    const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
    
    if (profileJson) {
      const profile = JSON.parse(profileJson);
      // Ensure media array exists (for backwards compatibility)
      if (!profile.media) {
        profile.media = [];
      }
      return profile;
    }
    
    return DEFAULT_PROFILE;
  } catch (error) {
    console.error('Error loading profile:', error);
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = async (profile) => {
  try {
    const profileJson = JSON.stringify(profile);
    await AsyncStorage.setItem(PROFILE_KEY, profileJson);
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
};

// Add media to profile (appends to existing)
export const addMediaToProfile = async (mediaItems) => {
  try {
    const profile = await loadProfile();
    
    // Append new media to existing array
    profile.media = [...profile.media, ...mediaItems];
    
    const success = await saveProfile(profile);
    return success;
  } catch (error) {
    console.error('Error adding media to profile:', error);
    return false;
  }
};

// Remove media from profile by URIs
export const removeMediaFromProfile = async (urisToRemove) => {
  try {
    const profile = await loadProfile();
    
    // Filter out media with matching URIs
    profile.media = profile.media.filter(
      item => !urisToRemove.includes(item.uri)
    );
    
    const success = await saveProfile(profile);
    return success;
  } catch (error) {
    console.error('Error removing media from profile:', error);
    return false;
  }
};