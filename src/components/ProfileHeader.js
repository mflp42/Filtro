import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../styles/colors';

export default function ProfileHeader({ name, bio, profilePicture, onEditPress }) {
  const getAvatarDisplay = () => {
    if (profilePicture) {
      return (
        <Image 
          source={{ uri: profilePicture }}
          style={styles.profileImage}
          contentFit="cover"
        />
      );
    }
    
    // Default emoji avatar
    return (
      <View style={styles.defaultAvatar}>
        <Text style={styles.defaultAvatarEmoji}>📷</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {getAvatarDisplay()}
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={onEditPress}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.bio}>{bio}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarEmoji: {
    fontSize: 50,
  },
  editButton: {
    position: 'absolute',
    right: 0,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});