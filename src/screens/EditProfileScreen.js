import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';
import * as profileService from '../services/profileService';

export default function EditProfileScreen({ navigation, route }) {
  const currentProfile = route.params?.profile || {
    name: 'Your Name',
    bio: 'Tell us about yourself...',
    profilePicture: null,
    media: [],
  };
  
  const [name, setName] = useState(currentProfile.name);
  const [bio, setBio] = useState(currentProfile.bio);
  const [profilePicture, setProfilePicture] = useState(currentProfile.profilePicture);
  const [saving, setSaving] = useState(false);

  const validateAndSave = async () => {
    // Validate name
    if (name.trim().length === 0) {
      Alert.alert('Invalid Name', 'Name cannot be empty');
      return;
    }
    if (name.length > 25) {
      Alert.alert('Invalid Name', 'Name must be 25 characters or less');
      return;
    }

    // Validate bio
    if (bio.length > 150) {
      Alert.alert('Invalid Bio', 'Bio must be 150 characters or less');
      return;
    }

    // Save profile - IMPORTANT: Preserve media array
    setSaving(true);
    const success = await profileService.saveProfile({
      ...currentProfile,  // Spread existing profile to keep media array
      name: name.trim(),
      bio: bio.trim(),
      profilePicture,
    });

    setSaving(false);

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const pickImage = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => takePhoto(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickFromGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery permission is required to choose photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Profile Picture</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Name ({name.length}/25)</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          maxLength={25}
          placeholder="Enter your name"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Bio ({bio.length}/150)</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          maxLength={150}
          placeholder="Enter your bio"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity 
        style={[globalStyles.button, styles.saveButton]}
        onPress={validateAndSave}
        disabled={saving}
      >
        <Text style={globalStyles.buttonText}>
          {saving ? 'Saving...' : 'Save Profile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  saveButton: {
    marginTop: 20,
  },
});