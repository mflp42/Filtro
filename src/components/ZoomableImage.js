import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

/**
 * ZoomableImage Component
 * Supports pinch-to-zoom, pan when zoomed, and double-tap to reset
 * Can wrap either an image (via uri) or custom children (like Video)
 * 
 * @param {string} uri - Image URI (optional if children provided)
 * @param {ReactNode} children - Custom content to make zoomable (optional)
 * @param {object} style - Additional styles for image
 * @param {number} minZoom - Minimum zoom level (default: 1)
 * @param {number} maxZoom - Maximum zoom level (default: 5)
 * @param {boolean} enabled - Whether zoom gestures are enabled (default: true)
 * @param {function} onZoomChange - Callback when zoom level changes
 */
export default function ZoomableImage({ 
  uri, 
  children,
  style,
  minZoom = 1,
  maxZoom = 5,
  enabled = true,
  onZoomChange,
}) {
  // Shared values for animation
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  
  // Track container layout for focal point calculations
  const containerX = useSharedValue(0);
  const containerY = useSharedValue(0);
  const containerWidth = useSharedValue(0);
  const containerHeight = useSharedValue(0);

  /**
   * Track container layout to convert screen coords to container coords
   */
  const handleLayout = (event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    containerX.value = x;
    containerY.value = y;
    containerWidth.value = width;
    containerHeight.value = height;
  };

  /**
   * Pinch Gesture - Zoom in/out around focal point (midpoint between fingers)
   */
  const pinchGesture = Gesture.Pinch()
    .enabled(enabled)
    .onStart((e) => {
      // Convert screen focal point to container-relative coordinates
      focalX.value = e.focalX - containerX.value;
      focalY.value = e.focalY - containerY.value;
    })
    .onUpdate((e) => {
      // Convert screen focal point to container-relative coordinates
      const relativeFocalX = e.focalX - containerX.value;
      const relativeFocalY = e.focalY - containerY.value;
      
      // Calculate new scale
      const newScale = savedScale.value * e.scale;
      
      // Constrain scale between min and max
      const constrainedScale = Math.min(Math.max(newScale, minZoom), maxZoom);
      
      // Calculate scale factor relative to saved scale
      const scaleFactor = constrainedScale / savedScale.value;
      
      // Adjust translation to zoom around focal point (container-relative)
      // Formula: newTranslate = focal - (focal - savedTranslate) * scaleFactor
      // This keeps the point under the focal point stationary
      translateX.value = relativeFocalX - (relativeFocalX - savedTranslateX.value) * scaleFactor;
      translateY.value = relativeFocalY - (relativeFocalY - savedTranslateY.value) * scaleFactor;
      
      scale.value = constrainedScale;
    })
    .onEnd(() => {
      // Save scale and translation for next pinch
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      
      // Reset to minimum if close to it
      if (scale.value < minZoom + 0.1) {
        scale.value = withSpring(minZoom);
        savedScale.value = minZoom;
        
        // Also reset position
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
      
      // Notify parent of zoom change (wrap in runOnJS)
      if (onZoomChange) {
        runOnJS(onZoomChange)(scale.value);
      }
    });

  /**
   * Pan Gesture - Move image when zoomed
   */
  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onUpdate((e) => {
      // Only allow panning when zoomed in
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      // Constrain translation to container bounds when zoomed
      if (scale.value > 1) {
        const maxTranslateX = (containerWidth.value * (scale.value - 1)) / 2;
        const maxTranslateY = (containerHeight.value * (scale.value - 1)) / 2;
        
        translateX.value = Math.min(
          Math.max(translateX.value, -maxTranslateX),
          maxTranslateX
        );
        
        translateY.value = Math.min(
          Math.max(translateY.value, -maxTranslateY),
          maxTranslateY
        );
        
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  /**
   * Double Tap - Quick zoom toggle
   */
  const doubleTapGesture = Gesture.Tap()
    .enabled(enabled)
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        // Zoom out to fit
        scale.value = withSpring(minZoom);
        savedScale.value = minZoom;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        
        if (onZoomChange) {
          runOnJS(onZoomChange)(minZoom);
        }
      } else {
        // Zoom in to 2x
        const targetZoom = Math.min(2, maxZoom);
        scale.value = withSpring(targetZoom);
        savedScale.value = targetZoom;
        
        if (onZoomChange) {
          runOnJS(onZoomChange)(targetZoom);
        }
      }
    });

  // Compose gestures (pinch and pan can happen simultaneously, double-tap is separate)
  const composedGesture = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          {children ? (
            // Render custom children (e.g., Video component)
            children
          ) : (
            // Render image from URI
            <Image
              source={{ uri }}
              style={[styles.image, style]}
              contentFit="contain"
            />
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});