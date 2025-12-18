import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Image Service
 * Handles all photo editing operations using expo-image-manipulator
 */

/**
 * Rotate image by specified degrees
 * @param {string} uri - Image URI
 * @param {number} degrees - Rotation degrees (90, 180, 270)
 * @returns {Promise<string>} - New image URI
 */
export const rotateImage = async (uri, degrees) => {
  console.log('🔄 Rotating image:', degrees, 'degrees');
  
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ rotate: degrees }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    console.log('✅ Image rotated:', result.uri);
    return result.uri;
  } catch (error) {
    console.error('❌ Error rotating image:', error);
    throw error;
  }
};

/**
 * Flip image horizontally or vertically
 * @param {string} uri - Image URI
 * @param {string} direction - 'horizontal' or 'vertical'
 * @returns {Promise<string>} - New image URI
 */
export const flipImage = async (uri, direction) => {
  console.log('🔄 Flipping image:', direction);
  
  try {
    const flipType = direction === 'horizontal' || direction === 'Horizontal'
      ? ImageManipulator.FlipType.Horizontal 
      : ImageManipulator.FlipType.Vertical;
    
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ flip: flipType }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    console.log('✅ Image flipped:', result.uri);
    return result.uri;
  } catch (error) {
    console.error('❌ Error flipping image:', error);
    throw error;
  }
};

/**
 * Crop image to specified dimensions
 * @param {string} uri - Image URI
 * @param {object} cropData - { originX, originY, width, height }
 * @returns {Promise<string>} - New image URI
 */
export const cropImage = async (uri, cropData) => {
  console.log('✂️  Cropping image:', cropData);
  
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ crop: cropData }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    console.log('✅ Image cropped:', result.uri);
    return result.uri;
  } catch (error) {
    console.error('❌ Error cropping image:', error);
    throw error;
  }
};

/**
 * Apply multiple edits to an image
 * @param {string} uri - Image URI
 * @param {Array} actions - Array of manipulation actions
 * @returns {Promise<string>} - New image URI
 */
export const applyEdits = async (uri, actions) => {
  console.log('🎨 Applying edits to image. Actions:', actions.length);
  
  try {
    // Convert actions to proper format for ImageManipulator
    const convertedActions = actions.map(action => {
      // Handle flip actions - convert string to FlipType enum
      if (action.flip) {
        const flipType = action.flip === 'horizontal' || action.flip === 'Horizontal'
          ? ImageManipulator.FlipType.Horizontal
          : ImageManipulator.FlipType.Vertical;
        return { flip: flipType };
      }
      // Other actions (rotate, crop) pass through as-is
      return action;
    });
    
    console.log('🔄 Converted actions:', convertedActions);
    
    const result = await ImageManipulator.manipulateAsync(
      uri,
      convertedActions,
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    console.log('✅ Edits applied:', result.uri);
    return result.uri;
  } catch (error) {
    console.error('❌ Error applying edits:', error);
    throw error;
  }
};

/**
 * Save edited image to permanent storage
 * @param {string} uri - Image URI
 * @returns {Promise<string>} - Saved image URI
 */
export const saveEditedImage = async (uri) => {
  console.log('💾 Saving edited image...');
  
  try {
    const timestamp = Date.now();
    const filename = `edited_photo_${timestamp}.jpg`;
    const directory = `${FileSystem.documentDirectory}photos/`;
    const newPath = `${directory}${filename}`;
    
    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(directory);
    if (!dirInfo.exists) {
      console.log('📁 Creating photos directory...');
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }
    
    // Copy edited image to permanent storage
    await FileSystem.copyAsync({
      from: uri,
      to: newPath,
    });
    
    console.log('✅ Edited image saved:', newPath);
    return newPath;
  } catch (error) {
    console.error('❌ Error saving edited image:', error);
    throw error;
  }
};

/**
 * Get image dimensions
 * @param {string} uri - Image URI
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = async (uri) => {
  try {
    // Use Image.getSize from react-native or calculate from manipulator
    // For now, we'll handle this in the component using Image.onLoad
    // This is a placeholder for future enhancement
    return { width: 0, height: 0 };
  } catch (error) {
    console.error('❌ Error getting image dimensions:', error);
    throw error;
  }
};

/**
 * Calculate crop dimensions for aspect ratio
 * @param {number} imageWidth - Original image width
 * @param {number} imageHeight - Original image height
 * @param {string} aspectRatio - 'original' | 'square' | '16:9' | '4:3'
 * @returns {object} - Crop dimensions { originX, originY, width, height }
 */
export const calculateCropDimensions = (imageWidth, imageHeight, aspectRatio) => {
  console.log('📐 Calculating crop for aspect ratio:', aspectRatio);
  
  let targetWidth, targetHeight;
  
  switch (aspectRatio) {
    case 'square':
      // 1:1
      const minDimension = Math.min(imageWidth, imageHeight);
      targetWidth = minDimension;
      targetHeight = minDimension;
      break;
      
    case '16:9':
      if (imageWidth / imageHeight > 16 / 9) {
        // Image is wider, constrain by height
        targetHeight = imageHeight;
        targetWidth = (imageHeight * 16) / 9;
      } else {
        // Image is taller, constrain by width
        targetWidth = imageWidth;
        targetHeight = (imageWidth * 9) / 16;
      }
      break;
      
    case '4:3':
      if (imageWidth / imageHeight > 4 / 3) {
        targetHeight = imageHeight;
        targetWidth = (imageHeight * 4) / 3;
      } else {
        targetWidth = imageWidth;
        targetHeight = (imageWidth * 3) / 4;
      }
      break;
      
    case 'original':
    default:
      // No crop, return full image
      return {
        originX: 0,
        originY: 0,
        width: imageWidth,
        height: imageHeight,
      };
  }
  
  // Center the crop
  const originX = (imageWidth - targetWidth) / 2;
  const originY = (imageHeight - targetHeight) / 2;
  
  const cropData = {
    originX: Math.max(0, Math.round(originX)),
    originY: Math.max(0, Math.round(originY)),
    width: Math.round(targetWidth),
    height: Math.round(targetHeight),
  };
  
  console.log('📐 Crop dimensions:', cropData);
  return cropData;
};

export default {
  rotateImage,
  flipImage,
  cropImage,
  applyEdits,
  saveEditedImage,
  getImageDimensions,
  calculateCropDimensions,
};