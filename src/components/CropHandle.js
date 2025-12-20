import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { colors } from '../styles/colors';

/**
 * CropHandle Component
 * Individual resize handle for crop overlay
 * @param {string} position - Handle position: 'topLeft', 'top', 'topRight', etc.
 * @param {function} onDrag - Callback when handle is dragged (dx, dy)
 * @param {object} bounds - Current crop bounds (for positioning)
 */
export default function CropHandle({ position, onDrag, bounds }) {
  const scale = useSharedValue(1);
  
  // Calculate handle position based on position prop and bounds
  const handlePosition = getHandlePosition(position, bounds);
  
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Scale up handle on touch for visual feedback
      scale.value = withSpring(1.3);
      
      // Notify parent that drag started (to save starting bounds)
      runOnJS(onDrag)(position, 0, 0, true);
    })
    .onUpdate((event) => {
      // Call parent callback with CUMULATIVE delta from start
      runOnJS(onDrag)(position, event.translationX, event.translationY, false);
    })
    .onEnd(() => {
      // Reset scale
      scale.value = withSpring(1);
    });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      // Removed translateX/Y - handle position purely controlled by bounds
    ],
  }));
  
  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.handle,
          handlePosition,
          animatedStyle,
          getHandleStyle(position),
        ]}
      >
        <View style={styles.handleInner} />
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * Get handle position styles based on position name
 */
function getHandlePosition(position, bounds) {
  const offset = -15; // Half of handle size (30px / 2)
  
  switch (position) {
    case 'topLeft':
      return { top: offset, left: offset };
    case 'top':
      return { top: offset, left: bounds.width / 2 + offset };
    case 'topRight':
      return { top: offset, right: offset };
    case 'right':
      return { top: bounds.height / 2 + offset, right: offset };
    case 'bottomRight':
      return { bottom: offset, right: offset };
    case 'bottom':
      return { bottom: offset, left: bounds.width / 2 + offset };
    case 'bottomLeft':
      return { bottom: offset, left: offset };
    case 'left':
      return { top: bounds.height / 2 + offset, left: offset };
    default:
      return {};
  }
}

/**
 * Get handle-specific styles (corner handles are circles, edge handles are rectangles)
 */
function getHandleStyle(position) {
  const isCorner = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(position);
  
  if (isCorner) {
    return styles.cornerHandle;
  }
  
  if (position === 'top' || position === 'bottom') {
    return styles.horizontalHandle;
  }
  
  return styles.verticalHandle;
}

const styles = StyleSheet.create({
  handle: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cornerHandle: {
    borderRadius: 15,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    // Shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  horizontalHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  verticalHandle: {
    width: 8,
    height: 40,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  handleInner: {
    // Optional: Add inner dot for corner handles
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});