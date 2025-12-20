import React, { useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Text, 
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../styles/colors';
import * as imageService from '../services/imageService';
import * as storageService from '../services/storageService';
import * as cropMath from '../utils/cropMath';
import CropOverlay from '../components/CropOverlay';
import CropToolbar from '../components/CropToolbar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Padding around image in crop mode (makes handles easier to grab)
const CROP_PADDING = 24;

export default function PhotoEditScreen({ route, navigation }) {
  const { uri: originalUri } = route.params;
  
  // Basic state
  const [currentUri, setCurrentUri] = useState(originalUri);
  const [editHistory, setEditHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });
  
  // Transform state (for visual preview)
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(1);
  const [flipV, setFlipV] = useState(1);
  const [cropApplied, setCropApplied] = useState(false);
  
  // Crop mode state
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropBounds, setCropBounds] = useState(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('free');
  
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
    
    // Calculate display dimensions (maintaining aspect ratio)
    // In crop mode, leave padding around the image for easier handle access
    const imageRatio = width / height;
    const maxWidth = SCREEN_WIDTH - (CROP_PADDING * 2); // Padding on left and right
    const maxHeight = SCREEN_HEIGHT * 0.6 - (CROP_PADDING * 2); // Padding on top and bottom
    
    let displayWidth = maxWidth;
    let displayHeight = displayWidth / imageRatio;
    
    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = displayHeight * imageRatio;
    }
    
    setDisplayDimensions({ width: displayWidth, height: displayHeight });
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
      setFlipH(prev => prev * -1);
      
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
      setFlipV(prev => prev * -1);
      
      const flipType = 'vertical';
      setEditHistory(prev => [...prev, { flip: flipType }]);
      
      console.log('✅ Vertical flip queued (flipV:', flipV * -1, ')');
    } catch (error) {
      console.error('❌ Error queueing vertical flip:', error);
      Alert.alert('Error', 'Failed to flip image');
    }
  };

  /**
   * Enter crop mode
   */
  const handleCropPress = () => {
    if (imageDimensions.width === 0 || imageDimensions.height === 0) {
      Alert.alert('Please Wait', 'Image is still loading...');
      return;
    }
    
    if (displayDimensions.width === 0 || displayDimensions.height === 0) {
      Alert.alert('Please Wait', 'Display is still calculating...');
      return;
    }
    
    console.log('🔲 Entering crop mode');
    console.log('📐 Display dimensions:', displayDimensions);
    
    // Initialize crop bounds to full image
    const initialBounds = cropMath.initializeCropBounds(
      displayDimensions.width,
      displayDimensions.height,
      null // Start with free form
    );
    
    console.log('📐 Initial crop bounds:', initialBounds);
    
    setCropBounds(initialBounds);
    setSelectedAspectRatio('free');
    setIsCropMode(true);
  };

  /**
   * Handle crop bounds change from CropOverlay
   */
  const handleCropBoundsChange = (newBounds) => {
    console.log('🔄 handleCropBoundsChange called with:', newBounds);
    
    if (!newBounds || typeof newBounds.x !== 'number' || isNaN(newBounds.x)) {
      console.error('❌ Invalid bounds in handleCropBoundsChange:', newBounds);
      console.error('❌ Stack trace:', new Error().stack);
      return; // Don't update with invalid bounds
    }
    
    console.log('✅ Setting crop bounds to:', newBounds);
    setCropBounds(newBounds);
  };

  /**
   * Handle aspect ratio change
   */
  const handleAspectRatioChange = (ratioKey) => {
    console.log('📐 Aspect ratio changed:', ratioKey);
    console.log('📐 Current cropBounds:', cropBounds);
    console.log('📐 Display dimensions:', displayDimensions);
    console.log('📐 Setting selectedAspectRatio to:', ratioKey);
    
    try {
      setSelectedAspectRatio(ratioKey);
      console.log('✅ Aspect ratio state updated');
    } catch (error) {
      console.error('❌ Error setting aspect ratio:', error);
    }
  };

  /**
   * Reset crop to full image
   */
  const handleCropReset = () => {
    console.log('🔄 Reset button pressed');
    console.log('🔄 Current displayDimensions:', displayDimensions);
    console.log('🔄 Current selectedAspectRatio:', selectedAspectRatio);
    console.log('🔄 Current cropBounds:', cropBounds);
    
    const fullBounds = cropMath.initializeCropBounds(
      displayDimensions.width,
      displayDimensions.height,
      cropMath.ASPECT_RATIOS[selectedAspectRatio]?.ratio
    );
    
    console.log('🔄 Calculated fullBounds:', fullBounds);
    setCropBounds(fullBounds);
    console.log('✅ Reset complete - new bounds set');
  };

  /**
   * Cancel crop mode
   */
  const handleCropCancel = () => {
    console.log('🚫 Canceling crop mode');
    setIsCropMode(false);
    setCropBounds(null);
    setSelectedAspectRatio('free');
  };

  /**
   * Apply crop
   */
  const handleCropApply = async () => {
    if (!cropBounds) {
      Alert.alert('Error', 'No crop area selected');
      return;
    }
    
    console.log('✂️ Applying crop with bounds:', cropBounds);
    setIsSaving(true);
    
    try {
      // Convert screen coordinates to image coordinates
      const cropAction = cropMath.calculateCropAction(
        cropBounds,
        imageDimensions.width,
        imageDimensions.height,
        displayDimensions.width,
        displayDimensions.height
      );
      
      console.log('✂️ Crop action:', cropAction);
      
      // Apply crop to image
      const croppedUri = await imageService.cropImage(currentUri, cropAction);
      
      // Update display
      setCurrentUri(croppedUri);
      setEditHistory(prev => [...prev, { crop: cropAction }]);
      setCropApplied(true);
      
      // Update dimensions for future operations
      setImageDimensions({
        width: cropAction.width,
        height: cropAction.height,
      });
      
      // Exit crop mode
      setIsCropMode(false);
      setCropBounds(null);
      
      console.log('✅ Crop applied successfully');
    } catch (error) {
      console.error('❌ Error applying crop:', error);
      Alert.alert('Error', 'Failed to crop image. Please try again.');
    } finally {
      setIsSaving(false);
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
   * Reset all edits back to original
   */
  const handleReset = () => {
    if (editHistory.length === 0 && !cropApplied && rotation === 0 && flipH === 1 && flipV === 1) {
      // Nothing to reset
      Alert.alert('No Edits', 'Image is already in its original state.');
      return;
    }

    Alert.alert(
      'Reset to Original?',
      'All edits will be discarded and the image will return to its original state.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive', 
          onPress: () => {
            console.log('🔄 Resetting all edits to original');
            setCurrentUri(originalUri);
            setRotation(0);
            setFlipH(1);
            setFlipV(1);
            setEditHistory([]);
            setCropApplied(false);
            
            // Image dimensions will reload when image loads
            console.log('✅ Reset complete');
          }
        },
      ]
    );
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
    console.log('✂️ Crop applied:', cropApplied);
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
          console.log('ℹ️ No additional edits, using cropped image');
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
    <GestureHandlerRootView style={styles.container}>
      {!isCropMode ? (
        // Normal edit mode
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
                style={[styles.button, styles.resetButton]}
                onPress={handleReset}
                disabled={isSaving}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
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
        </View>
      ) : (
        // Crop mode
        <View style={styles.container}>
          {/* Image with crop overlay */}
          <View style={styles.cropContainer}>
            <View 
              style={[styles.imageWrapper, { 
                width: displayDimensions.width,
                height: displayDimensions.height,
              }]}
            >
              <Image
                source={{ uri: currentUri }}
                style={[
                  styles.cropImage,
                  { 
                    width: displayDimensions.width,
                    height: displayDimensions.height,
                  }
                ]}
                contentFit="contain"
              />
              
              {cropBounds && (
                <CropOverlay
                  imageWidth={imageDimensions.width}
                  imageHeight={imageDimensions.height}
                  displayDimensions={displayDimensions}
                  initialBounds={cropBounds}
                  onBoundsChange={handleCropBoundsChange}
                  selectedAspectRatio={selectedAspectRatio}
                  enabled={!isSaving}
                />
              )}
            </View>
          </View>
          
          {/* Crop toolbar */}
          <CropToolbar
            selectedRatio={selectedAspectRatio}
            onRatioChange={handleAspectRatioChange}
            onReset={handleCropReset}
            onCancel={handleCropCancel}
            onApply={handleCropApply}
            disabled={isSaving}
          />
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  editBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    backgroundColor: colors.surface,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toolRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tool: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  toolIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  toolLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    color: colors.text,
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
  cropContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  imageWrapper: {
    position: 'relative',
  },
  cropImage: {
    width: '100%',
    height: '100%',
  },
});