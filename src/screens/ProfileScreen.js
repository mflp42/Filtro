import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';
import ProfileHeader from '../components/ProfileHeader';
import * as profileService from '../services/profileService';

const ITEMS_PER_PAGE = 18;

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [displayedMedia, setDisplayedMedia] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Load profile when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    const loadedProfile = await profileService.loadProfile();
    setProfile(loadedProfile);
    
    // Load first batch of media
    if (loadedProfile.media && loadedProfile.media.length > 0) {
      setDisplayedMedia(loadedProfile.media.slice(0, ITEMS_PER_PAGE));
    } else {
      setDisplayedMedia([]);
    }
  };

  const loadMoreMedia = () => {
    if (!profile || !profile.media) return;
    
    const currentLength = displayedMedia.length;
    const totalLength = profile.media.length;
    
    if (currentLength < totalLength) {
      const nextBatch = profile.media.slice(
        currentLength,
        currentLength + ITEMS_PER_PAGE
      );
      setDisplayedMedia(prev => [...prev, ...nextBatch]);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { profile });
  };

  const handleOpenCamera = () => {
    navigation.navigate('Camera');
  };

  const handleViewGallery = () => {
    navigation.navigate('Gallery');
  };

  const enterEditMode = () => {
    setEditMode(true);
    setSelectedItems(new Set());
  };

  const exitEditMode = () => {
    setEditMode(false);
    setSelectedItems(new Set());
  };

  const toggleSelection = (uri) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(uri)) {
        newSet.delete(uri);
      } else {
        newSet.add(uri);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) {
      Alert.alert('No items selected', 'Please select at least one item to delete.');
      return;
    }

    Alert.alert(
      'Delete Media',
      `Are you sure you want to delete ${selectedItems.size} item${selectedItems.size === 1 ? '' : 's'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const urisToRemove = Array.from(selectedItems);
            const success = await profileService.removeMediaFromProfile(urisToRemove);
            
            if (success) {
              Alert.alert('Success', 'Selected items deleted');
              exitEditMode();
              loadProfile(); // Reload profile to update display
            } else {
              Alert.alert('Error', 'Failed to delete items');
            }
          },
        },
      ]
    );
  };

  const handleMediaPress = (item) => {
    if (editMode) {
      toggleSelection(item.uri);
    } else {
      // Navigate to media viewer
      navigation.navigate('MediaViewer', {
        uri: item.uri,
        type: item.type,
      });
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMediaItem = ({ item }) => {
    const isSelected = selectedItems.has(item.uri);
    
    return (
      <TouchableOpacity 
        style={styles.mediaItem}
        onPress={() => handleMediaPress(item)}
      >
        <Image 
          source={{ uri: item.uri }} 
          style={styles.thumbnail}
          contentFit="cover"
        />
        
        {/* Video overlay */}
        {item.type === 'video' && (
          <>
            <View style={styles.playIconOverlay}>
              <Text style={styles.playIcon}>▶️</Text>
            </View>
            {item.duration && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>
                  {formatDuration(item.duration)}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Selection checkbox (edit mode) */}
        {editMode && (
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!profile) {
    return (
      <View style={[globalStyles.container, globalStyles.centerContent]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <ProfileHeader 
          name={profile.name}
          bio={profile.bio}
          profilePicture={profile.profilePicture}
          onEditPress={handleEditProfile}
        />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[globalStyles.button, styles.button]}
            onPress={handleOpenCamera}
          >
            <Text style={globalStyles.buttonText}>Open Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[globalStyles.button, styles.button]}
            onPress={handleViewGallery}
          >
            <Text style={globalStyles.buttonText}>View Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Media Section */}
        {displayedMedia.length > 0 && (
          <View style={styles.mediaSection}>
            <View style={styles.mediaSectionHeader}>
              <Text style={styles.mediaSectionTitle}>
                My Media ({profile.media.length})
              </Text>
              
              {!editMode ? (
                <TouchableOpacity onPress={enterEditMode}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.editModeButtons}>
                  <TouchableOpacity onPress={exitEditMode}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                  </TouchableOpacity>
                  {selectedItems.size > 0 && (
                    <TouchableOpacity 
                      onPress={handleDeleteSelected}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>
                        Delete ({selectedItems.size})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            <FlatList
              data={displayedMedia}
              renderItem={renderMediaItem}
              keyExtractor={(item, index) => `${item.uri}-${index}`}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.mediaGrid}
              onEndReached={loadMoreMedia}
              onEndReachedThreshold={0.5}
            />

            {/* Load More indicator */}
            {displayedMedia.length < profile.media.length && (
              <TouchableOpacity 
                style={styles.loadMoreButton}
                onPress={loadMoreMedia}
              >
                <Text style={styles.loadMoreText}>
                  Load More ({profile.media.length - displayedMedia.length} remaining)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Empty state when no media */}
        {displayedMedia.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No media in your profile yet
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Go to Gallery and select items to add to your profile
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  button: {
    flex: 1,
  },
  mediaSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  mediaSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  mediaSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  editButton: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  editModeButtons: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  cancelButton: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  mediaGrid: {
    marginHorizontal: -2,
  },
  mediaItem: {
    flex: 1/3,
    aspectRatio: 1,
    padding: 2,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playIconOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
  },
  playIcon: {
    fontSize: 16,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  checkbox: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadMoreButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadMoreText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});