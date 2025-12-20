/**
 * Crop Math Utilities
 * Handles all crop bounds calculations, constraints, and aspect ratio logic
 */

/**
 * Aspect ratio configurations
 */
export const ASPECT_RATIOS = {
  free: { name: 'Free', ratio: null, icon: '⬚' },
  square: { name: '1:1', ratio: 1, icon: '⬜' },
  portrait_4_3: { name: '4:3', ratio: 4 / 3, icon: '📱' },
  landscape_3_4: { name: '3:4', ratio: 3 / 4, icon: '📱' },
  widescreen: { name: '16:9', ratio: 16 / 9, icon: '🖼️' },
  stories: { name: '9:16', ratio: 9 / 16, icon: '📲' },
};

/**
 * Minimum crop dimensions (prevents too-small crops)
 */
export const MIN_CROP_SIZE = 50;

/**
 * Constrain bounds to stay within image boundaries
 * @param {object} bounds - { x, y, width, height }
 * @param {number} imageWidth - Image width
 * @param {number} imageHeight - Image height
 * @returns {object} - Constrained bounds
 */
export function constrainBounds(bounds, imageWidth, imageHeight) {
  // Safety check for invalid inputs
  if (!bounds || typeof bounds.x !== 'number' || isNaN(bounds.x)) {
    console.warn('⚠️ Invalid bounds in constrainBounds:', bounds);
    return {
      x: 0,
      y: 0,
      width: Math.min(MIN_CROP_SIZE, imageWidth),
      height: Math.min(MIN_CROP_SIZE, imageHeight),
    };
  }
  
  let { x, y, width, height } = bounds;
  
  // Ensure minimum size
  width = Math.max(MIN_CROP_SIZE, width);
  height = Math.max(MIN_CROP_SIZE, height);
  
  // Constrain to image boundaries
  width = Math.min(width, imageWidth);
  height = Math.min(height, imageHeight);
  
  // Constrain position
  x = Math.max(0, Math.min(x, imageWidth - width));
  y = Math.max(0, Math.min(y, imageHeight - height));
  
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Maintain aspect ratio when resizing
 * @param {object} bounds - Current bounds
 * @param {object} delta - { dx, dy } movement delta
 * @param {string} handlePosition - Which handle is being dragged
 * @param {number|null} aspectRatio - Target aspect ratio (null for free)
 * @param {number} imageWidth - Image width
 * @param {number} imageHeight - Image height
 * @returns {object} - New bounds with aspect ratio maintained
 */
export function maintainAspectRatio(bounds, delta, handlePosition, aspectRatio, imageWidth, imageHeight) {
  if (!aspectRatio) {
    // Free form - no aspect ratio constraint
    return applyHandleDelta(bounds, delta, handlePosition);
  }
  
  let newBounds = { ...bounds };
  const { dx, dy } = delta;
  
  // Calculate new dimensions based on handle position
  switch (handlePosition) {
    case 'topLeft':
      newBounds.x += dx;
      newBounds.y += dy;
      newBounds.width -= dx;
      newBounds.height -= dy;
      break;
      
    case 'topRight':
      newBounds.y += dy;
      newBounds.width += dx;
      newBounds.height -= dy;
      break;
      
    case 'bottomLeft':
      newBounds.x += dx;
      newBounds.width -= dx;
      newBounds.height += dy;
      break;
      
    case 'bottomRight':
      newBounds.width += dx;
      newBounds.height += dy;
      break;
      
    case 'top':
      newBounds.y += dy;
      newBounds.height -= dy;
      break;
      
    case 'bottom':
      newBounds.height += dy;
      break;
      
    case 'left':
      newBounds.x += dx;
      newBounds.width -= dx;
      break;
      
    case 'right':
      newBounds.width += dx;
      break;
  }
  
  // Apply aspect ratio constraint
  if (handlePosition.includes('top') || handlePosition.includes('bottom')) {
    // Vertical resize - adjust width to match
    newBounds.width = newBounds.height * aspectRatio;
    
    // If resizing from left side, adjust x position
    if (handlePosition.includes('Left')) {
      newBounds.x = bounds.x + bounds.width - newBounds.width;
    }
  } else {
    // Horizontal or corner resize - adjust height to match
    newBounds.height = newBounds.width / aspectRatio;
    
    // If resizing from top, adjust y position
    if (handlePosition.includes('top')) {
      newBounds.y = bounds.y + bounds.height - newBounds.height;
    }
  }
  
  // Ensure bounds stay within image and validate
  const constrainedBounds = constrainBounds(newBounds, imageWidth, imageHeight);
  
  // Final safety check
  if (isNaN(constrainedBounds.x) || isNaN(constrainedBounds.y)) {
    return bounds; // Return original if calculation failed
  }
  
  return constrainedBounds;
}

/**
 * Apply handle drag delta without aspect ratio constraint
 * @param {object} bounds - Current bounds
 * @param {object} delta - { dx, dy }
 * @param {string} handlePosition - Handle being dragged
 * @returns {object} - New bounds
 */
function applyHandleDelta(bounds, delta, handlePosition) {
  let newBounds = { ...bounds };
  const { dx, dy } = delta;
  
  switch (handlePosition) {
    case 'topLeft':
      newBounds.x += dx;
      newBounds.y += dy;
      newBounds.width -= dx;
      newBounds.height -= dy;
      break;
      
    case 'topRight':
      newBounds.y += dy;
      newBounds.width += dx;
      newBounds.height -= dy;
      break;
      
    case 'bottomLeft':
      newBounds.x += dx;
      newBounds.width -= dx;
      newBounds.height += dy;
      break;
      
    case 'bottomRight':
      newBounds.width += dx;
      newBounds.height += dy;
      break;
      
    case 'top':
      newBounds.y += dy;
      newBounds.height -= dy;
      break;
      
    case 'bottom':
      newBounds.height += dy;
      break;
      
    case 'left':
      newBounds.x += dx;
      newBounds.width -= dx;
      break;
      
    case 'right':
      newBounds.width += dx;
      break;
  }
  
  return newBounds;
}

/**
 * Apply aspect ratio to existing bounds (when user switches ratio)
 * @param {object} bounds - Current bounds
 * @param {number|null} aspectRatio - Target aspect ratio
 * @param {number} imageWidth - Image width
 * @param {number} imageHeight - Image height
 * @returns {object} - Adjusted bounds
 */
export function applyAspectRatioToBounds(bounds, aspectRatio, imageWidth, imageHeight) {
  if (!aspectRatio) {
    return bounds;
  }
  
  let newBounds = { ...bounds };
  const currentRatio = bounds.width / bounds.height;
  
  if (currentRatio > aspectRatio) {
    // Too wide - adjust width
    newBounds.width = bounds.height * aspectRatio;
    // Center horizontally
    newBounds.x = bounds.x + (bounds.width - newBounds.width) / 2;
  } else {
    // Too tall - adjust height
    newBounds.height = bounds.width / aspectRatio;
    // Center vertically
    newBounds.y = bounds.y + (bounds.height - newBounds.height) / 2;
  }
  
  return constrainBounds(newBounds, imageWidth, imageHeight);
}

/**
 * Initialize crop bounds to full image or centered with aspect ratio
 * @param {number} imageWidth - Image width
 * @param {number} imageHeight - Image height
 * @param {number|null} aspectRatio - Optional aspect ratio
 * @returns {object} - Initial bounds
 */
export function initializeCropBounds(imageWidth, imageHeight, aspectRatio = null) {
  if (!aspectRatio) {
    // Free form - use full image
    return {
      x: 0,
      y: 0,
      width: imageWidth,
      height: imageHeight,
    };
  }
  
  const imageRatio = imageWidth / imageHeight;
  let width, height;
  
  if (imageRatio > aspectRatio) {
    // Image is wider - constrain by height
    height = imageHeight;
    width = height * aspectRatio;
  } else {
    // Image is taller - constrain by width
    width = imageWidth;
    height = width / aspectRatio;
  }
  
  // Center the crop
  return {
    x: (imageWidth - width) / 2,
    y: (imageHeight - height) / 2,
    width,
    height,
  };
}

/**
 * Convert screen coordinates to image coordinates
 * Takes into account image scaling and positioning
 * @param {object} bounds - Bounds in screen coordinates
 * @param {number} imageWidth - Actual image width
 * @param {number} imageHeight - Actual image height
 * @param {number} displayWidth - Image display width on screen
 * @param {number} displayHeight - Image display height on screen
 * @returns {object} - Bounds in image coordinates
 */
export function screenToImageCoordinates(bounds, imageWidth, imageHeight, displayWidth, displayHeight) {
  const scaleX = imageWidth / displayWidth;
  const scaleY = imageHeight / displayHeight;
  
  return {
    originX: Math.round(bounds.x * scaleX),
    originY: Math.round(bounds.y * scaleY),
    width: Math.round(bounds.width * scaleX),
    height: Math.round(bounds.height * scaleY),
  };
}

/**
 * Calculate crop action for imageService
 * @param {object} bounds - Screen space bounds
 * @param {number} imageWidth - Actual image width
 * @param {number} imageHeight - Actual image height  
 * @param {number} displayWidth - Display width
 * @param {number} displayHeight - Display height
 * @returns {object} - Crop action for expo-image-manipulator
 */
export function calculateCropAction(bounds, imageWidth, imageHeight, displayWidth, displayHeight) {
  return screenToImageCoordinates(bounds, imageWidth, imageHeight, displayWidth, displayHeight);
}

/**
 * Snap bounds to edges if close enough
 * @param {object} bounds - Current bounds
 * @param {number} imageWidth - Image width
 * @param {number} imageHeight - Image height
 * @param {number} snapThreshold - Distance threshold for snapping (default 10px)
 * @returns {object} - Snapped bounds
 */
export function snapToEdges(bounds, imageWidth, imageHeight, snapThreshold = 10) {
  let newBounds = { ...bounds };
  
  // Snap left edge
  if (bounds.x < snapThreshold) {
    newBounds.x = 0;
  }
  
  // Snap top edge
  if (bounds.y < snapThreshold) {
    newBounds.y = 0;
  }
  
  // Snap right edge
  if (imageWidth - (bounds.x + bounds.width) < snapThreshold) {
    newBounds.x = imageWidth - bounds.width;
  }
  
  // Snap bottom edge
  if (imageHeight - (bounds.y + bounds.height) < snapThreshold) {
    newBounds.y = imageHeight - bounds.height;
  }
  
  return newBounds;
}

/**
 * Validate bounds are within acceptable range
 * @param {object} bounds - Bounds to validate
 * @param {number} imageWidth - Image width
 * @param {number} imageHeight - Image height
 * @returns {boolean} - True if valid
 */
export function validateBounds(bounds, imageWidth, imageHeight) {
  return (
    bounds.width >= MIN_CROP_SIZE &&
    bounds.height >= MIN_CROP_SIZE &&
    bounds.x >= 0 &&
    bounds.y >= 0 &&
    bounds.x + bounds.width <= imageWidth &&
    bounds.y + bounds.height <= imageHeight
  );
}