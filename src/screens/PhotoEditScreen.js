import React, { useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Text, 
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../styles/colors';
import * as imageService from '../services/imageService';
import * as storageService from '../services/storageService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PhotoEditScreen({ route, navigation }) {
  const { uri: originalUri } = route.params;
  
  // State
  const [currentUri, setCurrentUri] = useState(originalUri);
  const [editHistory, setEditHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showCropMenu, setShowCropMenu] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  // Track current transformations (for visual preview)
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(1); // 1 = normal, -1 = flipped
  const [flipV, setFlipV] = useState(1); // 1 = normal, -1 = flipped
  const [cropApplied, setCropApplied] = useState(false);

  useEffect(() => {
    console.log('📸 PhotoEditScreen opened with image:', originalUri);
  }, []);

  /**
   * Handle image load to get dimensions
   */
  const handleImageLoad = (event) => {
    const { width, height } = event.source;
    console.log('📐 Image dimensions:', width, 'x', height);
    setImageDimensions({ width, height });
  };

  /**
   * Apply rotation (90 degrees clockwise)
   */
  const handleRotate = async () => {
    console.log('🔄 Rotate button pressed');
    
    try {
      const newRotation = (rotation + 90) % 360;
      setRotation(newRotation);
      
      // Add to edit history
      setEditHistory(prev => [...prev, { rotate: 90 }]);
      
      console.log('✅ Rotation queued:', newRotation);
    } catch (error) {
      console.error('❌ Error queueing rotation:', error);
      Alert.alert('Error', 'Failed to rotate image');
    }
  };

  /**
   * Apply horizontal flip
   */
  const handleFlipHorizontal = async () => {
    console.log('🔄 Flip horizontal pressed');
    
    try {
      // Toggle flip state for visual preview
      setFlipH(prev => prev * -1);
      
      // Add to edit history
      const flipType = 'horizontal';
      setEditHistory(prev => [...prev, { flip: flipType }]);
      
      console.log('✅ Horizontal flip queued (flipH:', flipH * -1, ')');
    } catch (error) {
      console.error('❌ Error queueing horizontal flip:', error);
      Alert.alert('Error', 'Failed to flip image');
    }
  };

  /**
   * Apply vertical flip
   */
  const handleFlipVertical = async () => {
    console.log('🔄 Flip vertical pressed');
    
    try {
      // Toggle flip state for visual preview
      setFlipV(prev => prev * -1);
      
      // Add to edit history
      const flipType = 'vertical';
      setEditHistory(prev => [...prev, { flip: flipType }]);
      
      console.log('✅ Vertical flip queued (flipV:', flipV * -1, ')');
    } catch (error) {
      console.error('❌ Error queueing vertical flip:', error);
      Alert.alert('Error', 'Failed to flip image');
    }
  };

  /**
   * Show crop aspect ratio menu
   */
  const handleCropPress = () => {
    if (imageDimensions.width === 0 || imageDimensions.height === 0) {
      Alert.alert('Please Wait', 'Image is still loading...');
      return;
    }
    setShowCropMenu(true);
  };

  /**
   * Apply crop with selected aspect ratio
   */
  const handleCropSelect = async (aspectRatio) => {
    console.log('✂️  Crop selected:', aspectRatio);
    setShowCropMenu(false);
    
    if (aspectRatio === 'original') {
      console.log('ℹ️  Original aspect ratio selected - no crop needed');
      return;
    }
    
    try {
      const cropData = imageService.calculateCropDimensions(
        imageDimensions.width,
        imageDimensions.height,
        aspectRatio
      );
      
      // Apply crop immediately for visual preview
      console.log('✂️  Applying crop for preview...');
      const croppedUri = await imageService.cropImage(currentUri, cropData);
      
      // Update current display
      setCurrentUri(croppedUri);
      
      // Add to edit history
      setEditHistory(prev => [...prev, { crop: cropData }]);
      setCropApplied(true);
      
      // Update dimensions for next crop (if any)
      setImageDimensions({
        width: cropData.width,
        height: cropData.height,
      });
      
      console.log('✅ Crop applied and queued:', aspectRatio);
    } catch (error) {
      console.error('❌ Error applying crop:', error);
      Alert.alert('Error', 'Failed to crop image');
    }
  };

  /**
   * Cancel all edits and go back
   */
  const handleCancel = () => {
    if (editHistory.length > 0 || cropApplied) {
      Alert.alert(
        'Discard Changes?',
        'All edits will be lost.',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              console.log('🚫 Edits discarded');
              navigation.goBack();
            }
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  /**
   * Save edited image
   */
  const handleSave = async () => {
    if (editHistory.length === 0 && !cropApplied) {
      Alert.alert('No Changes', 'Make some edits before saving!');
      return;
    }

    console.log('💾 Saving edited image...');
    console.log('📝 Edit history:', editHistory);
    console.log('✂️  Crop applied:', cropApplied);
    setIsSaving(true);

    try {
      let editedUri;
      
      if (cropApplied) {
        // Crop was already applied to currentUri
        // Apply remaining edits (rotate, flip) to currentUri
        const remainingEdits = editHistory.filter(edit => !edit.crop);
        
        if (remainingEdits.length > 0) {
          console.log('🎨 Applying remaining edits to cropped image:', remainingEdits.length);
          editedUri = await imageService.applyEdits(currentUri, remainingEdits);
        } else {
          console.log('ℹ️  No additional edits, using cropped image');
          editedUri = currentUri;
        }
      } else {
        // No crop was applied, apply all edits to original
        console.log('🎨 Applying all edits to original image');
        editedUri = await imageService.applyEdits(originalUri, editHistory);
      }
      
      console.log('✅ Edits applied to temp file:', editedUri);
      
      // Save to permanent storage
      const savedUri = await imageService.saveEditedImage(editedUri);
      console.log('✅ Saved to app storage:', savedUri);
      
      // Save to gallery
      await storageService.saveToGallery(savedUri);
      console.log('✅ Saved to gallery');
      
      Alert.alert(
        'Success!',
        'Edited photo saved to gallery.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error saving edited image:', error);
      Alert.alert('Error', 'Failed to save edited image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Image Display */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: currentUri }}
          style={[
            styles.image,
            { 
              transform: [
                { rotate: `${rotation}deg` },
                { scaleX: flipH },
                { scaleY: flipV },
              ]
            }
          ]}
          contentFit="contain"
          onLoad={handleImageLoad}
        />
        
        {/* Edit count badge */}
        {(editHistory.length > 0 || cropApplied) && (
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>
              {editHistory.length + (cropApplied ? 1 : 0)} {(editHistory.length + (cropApplied ? 1 : 0)) === 1 ? 'edit' : 'edits'}
            </Text>
          </View>
        )}
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        {/* Top row: Edit tools */}
        <View style={styles.toolRow}>
          <TouchableOpacity 
            style={styles.tool}
            onPress={handleRotate}
            disabled={isSaving}
          >
            <Text style={styles.toolIcon}>🔄</Text>
            <Text style={styles.toolLabel}>Rotate</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tool}
            onPress={handleFlipHorizontal}
            disabled={isSaving}
          >
            <Text style={styles.toolIcon}>↔️</Text>
            <Text style={styles.toolLabel}>Flip H</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tool}
            onPress={handleFlipVertical}
            disabled={isSaving}
          >
            <Text style={styles.toolIcon}>↕️</Text>
            <Text style={styles.toolLabel}>Flip V</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tool}
            onPress={handleCropPress}
            disabled={isSaving}
          >
            <Text style={styles.toolIcon}>✂️</Text>
            <Text style={styles.toolLabel}>Crop</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom row: Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Crop Aspect Ratio Menu */}
      <Modal
        visible={showCropMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCropMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cropMenu}>
            <Text style={styles.cropMenuTitle}>Select Aspect Ratio</Text>
            
            <TouchableOpacity 
              style={styles.cropOption}
              onPress={() => handleCropSelect('original')}
            >
              <Text style={styles.cropOptionText}>Original</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cropOption}
              onPress={() => handleCropSelect('square')}
            >
              <Text style={styles.cropOptionText}>Square (1:1)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cropOption}
              onPress={() => handleCropSelect('16:9')}
            >
              <Text style={styles.cropOptionText}>Widescreen (16:9)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cropOption}
              onPress={() => handleCropSelect('4:3')}
            >
              <Text style={styles.cropOptionText}>Standard (4:3)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.cropOption, styles.cropCancel]}
              onPress={() => setShowCropMenu(false)}
            >
              <Text style={[styles.cropOptionText, styles.cropCancelText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  editBadge: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  toolbar: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingBottom: 20,
    paddingTop: 10,
  },
  toolRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tool: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  toolIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  toolLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  cropMenu: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  cropMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    color: colors.text,
  },
  cropOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  cropOptionText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  cropCancel: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  cropCancelText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});