import React from 'react';
import { TouchableOpacity, View, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../styles/colors';

export default function CaptureButton({ onPress, loading, isRecording, mode }) {
  return (
    <TouchableOpacity 
      style={styles.outerCircle}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="large" color={colors.surface} />
      ) : (
        <View style={[
          styles.innerCircle,
          isRecording && styles.recordingSquare,
          mode === 'video' && !isRecording && styles.videoInner,
        ]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.surface,
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
  },
  videoInner: {
    backgroundColor: '#FF3B30', // Red for video mode
  },
  recordingSquare: {
    width: 30,
    height: 30,
    borderRadius: 5,
    backgroundColor: '#FF3B30', // Red square when recording
  },
});