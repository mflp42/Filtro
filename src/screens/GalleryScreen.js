import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';
import useGallery from '../hooks/useGallery';
import * as profileService from '../services/profileService';

export default function GalleryScreen({ navigation }) {
  const { media, loading, refreshMedia, loadMoreMedia, hasNextPage } = useGallery();
  
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'photos', 'videos'
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Refresh gallery when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      refreshMedia();
    }, [])
  );

  // Filter media based on active tab
  const getFilteredMedia = () => {
    if (activeTab === 'photos') {
      return media.filter(item => item.type === 'photo');
    } else if (activeTab === 'videos') {
      return media.filter(item => item.type === 'video');
    }
    return media; // 'all'
  };

  const filteredMedia = getFilteredMedia();

  const handleMediaPress = (item) => {
    if (selectionMode) {
      toggleSelection(item.uri);
    } else {
      // Navigate to media viewer
      navigation.navigate('MediaViewer', {
        uri: item.uri,
        type: item.type,
      });
    }
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

  const enterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedItems(new Set());
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedItems(new Set());
  };

  const handleAddToProfile = async () => {
    if (selectedItems.size === 0) {
      Alert.alert('No items selected', 'Please select at least one item to add to your profile.');
      return;
    }

    // Convert selected URIs to media objects
    const selectedMedia = media.filter(item => selectedItems.has(item.uri));
    
    try {
      const success = await profileService.addMediaToProfile(selectedMedia);
      
      if (success) {
        Alert.alert(
          'Success', 
          `Added ${selectedItems.size} item${selectedItems.size === 1 ? '' : 's'} to your profile!`
        );
        exitSelectionMode();
      } else {
        Alert.alert('Error', 'Failed to add items to profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add items to profile');
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

        {/* Selection checkbox */}
        {selectionMode && (
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && media.length === 0) {
    return (
      <View style={[globalStyles.container, globalStyles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Header with tabs and select button */}
      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'photos' && styles.tabActive]}
            onPress={() => setActiveTab('photos')}
          >
            <Text style={[styles.tabText, activeTab === 'photos' && styles.tabTextActive]}>
              Photos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'videos' && styles.tabActive]}
            onPress={() => setActiveTab('videos')}
          >
            <Text style={[styles.tabText, activeTab === 'videos' && styles.tabTextActive]}>
              Videos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Select/Cancel button */}
        {!selectionMode ? (
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={enterSelectionMode}
          >
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={exitSelectionMode}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Media grid */}
      <FlatList
        data={filteredMedia}
        renderItem={renderMediaItem}
        keyExtractor={(item, index) => `${item.uri}-${index}`}
        numColumns={3}
        contentContainerStyle={styles.grid}
        onEndReached={loadMoreMedia}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => {
          if (loading && media.length > 0) {
            return (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            );
          }
          return null;
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No media found</Text>
          </View>
        )}
      />

      {/* Add to Profile button (shown in selection mode) */}
      {selectionMode && selectedItems.size > 0 && (
        <View style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddToProfile}
          >
            <Text style={styles.addButtonText}>
              Add to Profile ({selectedItems.size})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabs: {
    flexDirection: 'row',
    gap: 15,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  selectButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    padding: 2,
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
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});