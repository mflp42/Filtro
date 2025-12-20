import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';
import CropHandle from './CropHandle';
import { colors } from '../styles/colors';
import * as cropMath from '../utils/cropMath';

/**
 * CropOverlay Component
 * Interactive crop overlay with draggable bounds and resize handles
 * 
 * @param {number} imageWidth - Actual image width
 * @param {number} imageHeight - Actual image height
 * @param {object} displayDimensions - { width, height } of image on screen
 * @param {object} initialBounds - Starting bounds
 * @param {function} onBoundsChange - Callback when bounds change
 * @param {string} selectedAspectRatio - Current aspect ratio key
 * @param {boolean} enabled - Whether interaction is enabled
 */
export default function CropOverlay({
  imageWidth,
  imageHeight,
  displayDimensions,
  initialBounds,
  onBoundsChange,
  selectedAspectRatio = 'free',
  enabled = true,
}) {
  console.log('🎨 CropOverlay render:', {
    displayDimensions,
    initialBounds,
    selectedAspectRatio,
    onBoundsChange: typeof onBoundsChange,
  });
  
  const [bounds, setBounds] = useState(initialBounds);
  const [isDragging, setIsDragging] = useState(false);
  
  // Shared value for saved bounds during gestures
  const savedBounds = useSharedValue(initialBounds);
  
  // Shared value for current bounds - worklets can read this reactively
  const currentBounds = useSharedValue(initialBounds);
  
  // Ref to track starting bounds during handle resize (avoid compounding deltas)
  const handleResizeStartBounds = useRef(null);
  
  console.log('🎨 Shared values created');
  
  // Get aspect ratio value
  const aspectRatio = cropMath.ASPECT_RATIOS[selectedAspectRatio]?.ratio || null;
  
  console.log('🎨 Aspect ratio:', aspectRatio);
  
  // Safety check - don't render if dimensions are invalid
  const isValid = displayDimensions && 
                  displayDimensions.width > 0 && 
                  displayDimensions.height > 0 &&
                  initialBounds &&
                  typeof initialBounds.x === 'number' &&
                  !isNaN(initialBounds.x);
  
  console.log('🎨 Is valid:', isValid);
  
  // Update bounds when initialBounds changes (e.g., reset button)
  useEffect(() => {
    console.log('🔄 initialBounds effect triggered:', { 
      isValid, 
      initialBounds,
      currentBounds: bounds 
    });
    
    if (!isValid || !initialBounds) {
      console.log('⚠️ Skipping initialBounds effect - invalid');
      return;
    }
    
    console.log('✅ Applying initialBounds:', initialBounds);
    setBounds(initialBounds);
    savedBounds.value = initialBounds;
    currentBounds.value = initialBounds;
    console.log('✅ initialBounds applied successfully');
  }, [initialBounds, isValid]);
  
  // Keep currentBounds sharedValue synced with bounds state
  useEffect(() => {
    currentBounds.value = bounds;
  }, [bounds]);
  
  // Update bounds when aspect ratio changes - reset to full image first
  useEffect(() => {
    console.log('🔄 Aspect ratio effect triggered:', { selectedAspectRatio, isValid });
    
    if (!isValid) {
      console.log('⚠️ Skipping aspect ratio effect - invalid props');
      return;
    }
    
    console.log('📐 Calculating new bounds for ratio:', aspectRatio);
    
    // Initialize new bounds from full image with selected aspect ratio
    const newBounds = cropMath.initializeCropBounds(
      displayDimensions.width,
      displayDimensions.height,
      aspectRatio
    );
    
    console.log('📐 New bounds calculated:', newBounds);
    
    setBounds(newBounds);
    savedBounds.value = newBounds;
    currentBounds.value = newBounds; // Ensure currentBounds stays synced
    
    console.log('📐 State updated, calling callback');
    
    // Only call callback if it exists and bounds are valid
    if (onBoundsChange && typeof newBounds.x === 'number') {
      console.log('📐 Calling onBoundsChange with:', newBounds);
      try {
        onBoundsChange(newBounds);
        console.log('✅ onBoundsChange completed');
      } catch (error) {
        console.error('❌ Error in onBoundsChange:', error);
      }
    } else {
      console.log('⚠️ Skipping onBoundsChange:', {
        hasCallback: !!onBoundsChange,
        validBounds: typeof newBounds.x === 'number',
      });
    }
  }, [selectedAspectRatio, isValid]);
  
  /**
   * Stable handler for setting dragging state
   */
  const setDraggingState = useCallback((dragging) => {
    setIsDragging(dragging);
  }, []);
  
  /**
   * Stable handler for updating local bounds during pan
   */
  const updateLocalBounds = useCallback((newBounds) => {
    setBounds(newBounds);
  }, []);
  
  /**
   * Update bounds state and notify parent
   */
  const updateBounds = useCallback((newBounds) => {
    console.log('📝 updateBounds called with:', newBounds);
    
    // Double-check bounds are valid before updating
    if (!newBounds || typeof newBounds.x !== 'number' || isNaN(newBounds.x)) {
      console.warn('⚠️ Invalid bounds, skipping update:', newBounds);
      return;
    }
    
    setBounds(newBounds);
    savedBounds.value = newBounds;
    
    // Only call callback if it exists
    if (onBoundsChange) {
      try {
        onBoundsChange(newBounds);
      } catch (error) {
        console.error('❌ Error calling onBoundsChange in updateBounds:', error);
      }
    }
  }, [onBoundsChange]);
  
  /**
   * Refs for gesture stability - prevents gesture recreation on callback changes
   * MUST be defined BEFORE panGesture
   */
  const updateBoundsRef = useRef(updateBounds);
  const setDraggingStateRef = useRef(setDraggingState);
  const updateLocalBoundsRef = useRef(updateLocalBounds);
  
  /**
   * Keep refs synced with current callback implementations
   */
  useEffect(() => {
    updateBoundsRef.current = updateBounds;
  }, [updateBounds]);
  
  useEffect(() => {
    setDraggingStateRef.current = setDraggingState;
  }, [setDraggingState]);
  
  useEffect(() => {
    updateLocalBoundsRef.current = updateLocalBounds;
  }, [updateLocalBounds]);
  
  /**
   * Handle pan gesture to move entire crop area
   * Uses refs for callbacks, sharedValue for bounds (worklet-compatible)
   */
  const panGesture = useMemo(() => Gesture.Pan()
    .enabled(enabled)
    .onStart(() => {
      // CRITICAL: Capture bounds from sharedValue (worklet-compatible)
      const startBounds = currentBounds.value;
      savedBounds.value = startBounds;
      
      runOnJS(setDraggingStateRef.current)(true);
      console.log('👆 Pan started with bounds:', startBounds);
    })
    .onUpdate((event) => {
      // Calculate new position
      let newX = savedBounds.value.x + event.translationX;
      let newY = savedBounds.value.y + event.translationY;
      
      // Constrain to image boundaries
      newX = Math.max(0, Math.min(newX, displayDimensions.width - savedBounds.value.width));
      newY = Math.max(0, Math.min(newY, displayDimensions.height - savedBounds.value.height));
      
      // Update local state only - don't notify parent yet
      const newBounds = {
        x: newX,
        y: newY,
        width: savedBounds.value.width,
        height: savedBounds.value.height,
      };
      
      runOnJS(updateLocalBoundsRef.current)(newBounds);
    })
    .onEnd((event) => {
      runOnJS(setDraggingStateRef.current)(false);
      console.log('👆 Pan ended');
      
      // Now update parent with final position
      let newX = savedBounds.value.x + event.translationX;
      let newY = savedBounds.value.y + event.translationY;
      
      newX = Math.max(0, Math.min(newX, displayDimensions.width - savedBounds.value.width));
      newY = Math.max(0, Math.min(newY, displayDimensions.height - savedBounds.value.height));
      
      const finalBounds = {
        x: newX,
        y: newY,
        width: savedBounds.value.width,
        height: savedBounds.value.height,
      };
      
      runOnJS(updateBoundsRef.current)(finalBounds);
    }), [enabled, displayDimensions.width, displayDimensions.height]); // ONLY stable values
  
  /**
   * Handle resize from handles
   * @param {string} handlePosition - Which handle is being dragged
   * @param {number} dx - Cumulative X translation from drag start
   * @param {number} dy - Cumulative Y translation from drag start  
   * @param {boolean} isStart - True on drag start, false during drag
   */
  const handleDrag = useCallback((handlePosition, dx, dy, isStart = false) => {
    // On drag start, save current bounds as starting point
    if (isStart) {
      handleResizeStartBounds.current = bounds;
      console.log('🔧 Handle drag started, saved bounds:', bounds);
      return;
    }
    
    // Don't process if we don't have starting bounds
    if (!handleResizeStartBounds.current) {
      console.warn('⚠️ Handle drag without starting bounds, skipping');
      return;
    }
    
    console.log('🔧 Handle drag:', handlePosition, dx, dy);
    
    try {
      // Apply cumulative delta to STARTING bounds (not current bounds)
      const newBounds = cropMath.maintainAspectRatio(
        handleResizeStartBounds.current,
        { dx, dy },
        handlePosition,
        aspectRatio,
        displayDimensions.width,
        displayDimensions.height
      );
      
      // Always validate and constrain before updating
      const validBounds = cropMath.constrainBounds(
        newBounds,
        displayDimensions.width,
        displayDimensions.height
      );
      
      if (cropMath.validateBounds(validBounds, displayDimensions.width, displayDimensions.height)) {
        updateBounds(validBounds);
      }
    } catch (error) {
      console.error('❌ Error in handleDrag:', error);
    }
  }, [bounds, aspectRatio, displayDimensions.width, displayDimensions.height, updateBounds]);
  
  
  // Don't render if invalid
  if (!isValid) {
    console.warn('⚠️ CropOverlay: Invalid props, not rendering');
    return null;
  }
  
  console.log('✅ CropOverlay rendering with bounds:', bounds);
  
  return (
    <View style={styles.container}>
      {/* Dimmed overlay - 4 rectangles around crop area */}
      <View style={styles.dimmedOverlay}>
        {/* Top */}
        <View style={[styles.dimmed, {
          top: 0,
          left: 0,
          width: displayDimensions.width,
          height: bounds.y,
        }]} />
        
        {/* Bottom */}
        <View style={[styles.dimmed, {
          top: bounds.y + bounds.height,
          left: 0,
          width: displayDimensions.width,
          height: displayDimensions.height - (bounds.y + bounds.height),
        }]} />
        
        {/* Left */}
        <View style={[styles.dimmed, {
          top: bounds.y,
          left: 0,
          width: bounds.x,
          height: bounds.height,
        }]} />
        
        {/* Right */}
        <View style={[styles.dimmed, {
          top: bounds.y,
          left: bounds.x + bounds.width,
          width: displayDimensions.width - (bounds.x + bounds.width),
          height: bounds.height,
        }]} />
      </View>
      
      {/* Crop bounds container */}
      <GestureDetector gesture={panGesture}>
        <View
          style={[
            styles.cropBounds,
            {
              left: bounds.x,
              top: bounds.y,
              width: bounds.width,
              height: bounds.height,
            },
          ]}
        >
          {/* Border */}
          <View style={styles.border} />
          
          {/* Grid overlay (rule of thirds) */}
          <View style={styles.grid}>
            {/* Vertical lines */}
            <View style={[styles.gridLine, styles.gridLineVertical, { left: '33.33%' }]} />
            <View style={[styles.gridLine, styles.gridLineVertical, { left: '66.66%' }]} />
            
            {/* Horizontal lines */}
            <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '33.33%' }]} />
            <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '66.66%' }]} />
          </View>
          
          {/* Resize handles - corners only for simplicity */}
          {enabled && (
            <>
              <CropHandle position="topLeft" onDrag={handleDrag} bounds={bounds} />
              <CropHandle position="topRight" onDrag={handleDrag} bounds={bounds} />
              <CropHandle position="bottomRight" onDrag={handleDrag} bounds={bounds} />
              <CropHandle position="bottomLeft" onDrag={handleDrag} bounds={bounds} />
            </>
          )}
          
          {/* Dimension display */}
          <View style={styles.dimensionDisplay}>
            <Text style={styles.dimensionText}>
              {Math.round(bounds.width)} × {Math.round(bounds.height)}
            </Text>
          </View>
        </View>
      </GestureDetector>
      
      {/* Drag indicator (shown when dragging) */}
      {isDragging && (
        <View style={styles.dragIndicator}>
          <Text style={styles.dragIndicatorText}>Move crop area</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  dimmedOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  dimmed: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  cropBounds: {
    position: 'absolute',
    borderWidth: 0,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 2,
    // Shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  gridLineVertical: {
    width: 1,
    height: '100%',
  },
  gridLineHorizontal: {
    width: '100%',
    height: 1,
  },
  dimensionDisplay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    pointerEvents: 'none',
  },
  dimensionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dragIndicator: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    pointerEvents: 'none',
  },
  dragIndicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});