import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { CameraView } from 'expo-camera';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';
import usePermissions from '../hooks/usePermissions';
import useCamera from '../hooks/useCamera';
import CaptureButton from '../components/CaptureButton';
import CapturedThumbnail from '../components/CapturedThumbnail';
import { ScrollView } from 'react-native';
import * as storageService from '../services/storageService';

export default function CameraScreen({ navigation }) {
  const { cameraPermission, audioPermission, mediaLibraryPermission, loading, requestAllPermissions } = usePermissions();
  const { cameraRef, takePicture, startRecording, stopRecording, isCapturing, isRecording } = useCamera();
  
  // Media storage - now stores objects with type info
  const [capturedMedia, setCapturedMedia] = useState([]);
  
  // Camera settings
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [mode, setMode] = useState('photo'); // 'photo' or 'video'
  const [effect, setEffect] = useState('none'); // Live camera effect
  
  // Recording timer
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef(null);

  // Available camera effects
  const EFFECTS = ['none', 'mono', 'negative', 'posterize', 'sepia', 'solarize'];

  // Request all permissions upfront
  useEffect(() => {
    if (loading === false && (!cameraPermission || !audioPermission || !mediaLibraryPermission)) {
      console.log('🔐 Requesting permissions on CameraScreen mount...');
      requestAllPermissions();
    }
  }, [loading, cameraPermission, audioPermission, mediaLibraryPermission]);

  // Recording timer effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          // Auto-stop at 5 minutes (300 seconds)
          if (newDuration >= 300) {
            console.log('⏱️  5 minute limit reached, auto-stopping recording');
            handleStopRecording();
          }
          return newDuration;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const handleCapture = async () => {
    if (mode === 'photo') {
      // Take photo
      const photoUri = await takePicture();
      
      if (photoUri) {
        try {
          const savedUri = await storageService.savePhoto(photoUri);
          
          setCapturedMedia(prev => {
            const newMedia = [...prev, {
              uri: savedUri,
              type: 'photo',
            }];
            console.log('📸 Photo added to batch. Total items:', newMedia.length);
            return newMedia;
          });
        } catch (error) {
          console.error('❌ Failed to save photo:', error);
          Alert.alert('Error', 'Failed to save photo');
        }
      } else {
        console.error('❌ Failed to capture photo');
        Alert.alert('Error', 'Failed to capture photo');
      }
    } else {
      // Video mode - toggle recording
      if (isRecording) {
        handleStopRecording();
      } else {
        handleStartRecording();
      }
    }
  };

  const handleStartRecording = async () => {
    // CRITICAL: Check audio permission before recording
    if (!audioPermission) {
      console.error('❌ Audio permission not granted, cannot record video');
      Alert.alert(
        'Permission Required',
        'Microphone permission is required for video recording. Please enable it in Settings > Apps > CameraApp > Permissions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Request Again', 
            onPress: async () => {
              console.log('🔐 Re-requesting audio permission...');
              await requestAllPermissions();
            }
          }
        ]
      );
      return;
    }

    console.log('✅ Audio permission verified before recording');
    const success = await startRecording();
    if (!success) {
      console.error('❌ Failed to start video recording');
      Alert.alert(
        'Recording Failed',
        'Could not start video recording. This may be due to:\n\n' +
        '• Microphone permission not granted\n' +
        '• Camera in use by another app\n' +
        '• Low storage space\n\n' +
        'Check Settings > Apps > CameraApp > Permissions'
      );
    }
  };

  const handleStopRecording = async () => {
    const videoUri = await stopRecording();
    
    if (videoUri) {
      try {
        const savedUri = await storageService.saveVideo(videoUri);
        
        setCapturedMedia(prev => {
          const newMedia = [...prev, {
            uri: savedUri,
            type: 'video',
            duration: recordingDuration,
          }];
          console.log('🎥 Video added to batch. Total items:', newMedia.length);
          return newMedia;
        });
      } catch (error) {
        console.error('❌ Failed to save video:', error);
        Alert.alert('Error', 'Failed to save video');
      }
    } else {
      console.error('❌ Failed to record video');
      Alert.alert('Error', 'Failed to record video');
    }
  };

  const handleDeleteMedia = (index) => {
    const mediaToDelete = capturedMedia[index];
    console.log('🗑️  Removing item from batch:', mediaToDelete.type, mediaToDelete.uri);
    
    setCapturedMedia(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      console.log('📦 Batch updated. Remaining items:', filtered.length);
      return filtered;
    });
  };

  const handleDone = async () => {
    if (capturedMedia.length === 0) {
      console.log('📦 No items in batch, returning to profile');
      navigation.goBack();
      return;
    }

    console.log('💾 Saving batch to gallery...');
    console.log('📦 Total items in batch:', capturedMedia.length);
    
    try {
      // Save all media to gallery
      for (const media of capturedMedia) {
        if (mediaLibraryPermission) {
          await storageService.saveToGallery(media.uri);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const photoCount = capturedMedia.filter(m => m.type === 'photo').length;
      const videoCount = capturedMedia.filter(m => m.type === 'video').length;
      
      console.log('✅ Batch saved successfully. Photos:', photoCount, 'Videos:', videoCount);
      
      let message = '';
      if (photoCount > 0) message += `${photoCount} ${photoCount === 1 ? 'photo' : 'photos'}`;
      if (videoCount > 0) {
        if (message) message += ' and ';
        message += `${videoCount} ${videoCount === 1 ? 'video' : 'videos'}`;
      }
      message += ' saved to gallery!';
      
      Alert.alert('Success', message);
      navigation.goBack();
    } catch (error) {
      console.error('❌ Failed to save batch:', error);
      Alert.alert('Error', 'Failed to save some media');
    }
  };

  const handleCancel = () => {
    if (capturedMedia.length > 0) {
      console.log('🚫 Cancel pressed. Items in batch:', capturedMedia.length);
      Alert.alert(
        'Discard Media?',
        `You have ${capturedMedia.length} unsaved item${capturedMedia.length === 1 ? '' : 's'}. Discard?`,
        [
          { 
            text: 'Keep Recording', 
            style: 'cancel',
            onPress: () => console.log('📦 User chose to keep recording')
          },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              console.log('🗑️  Discarding batch. Items discarded:', capturedMedia.length);
              navigation.goBack();
            }
          },
        ]
      );
    } else {
      console.log('📦 No items in batch, returning to profile');
      navigation.goBack();
    }
  };

  const toggleFlash = () => {
    setFlash(current => {
      const next = current === 'off' ? 'on' : current === 'on' ? 'auto' : 'off';
      console.log('💡 Flash changed:', current, '→', next);
      return next;
    });
  };

  const toggleCamera = () => {
    setFacing(current => {
      const next = current === 'back' ? 'front' : 'back';
      console.log('🔄 Camera flipped:', current, '→', next);
      return next;
    });
  };

  const toggleMode = () => {
    if (!isRecording) {
      setMode(current => {
        const next = current === 'photo' ? 'video' : 'photo';
        const cameraMode = next === 'photo' ? 'picture' : 'video';
        console.log('📷/🎥 Mode changed:', current, '→', next);
        console.log('📹 CameraView mode prop:', cameraMode);
        if (next === 'video' && effect !== 'none') {
          console.log('🎨 Effects disabled for video mode (effects only work with photos)');
        }
        return next;
      });
    }
  };

  const cycleEffect = () => {
    setEffect(current => {
      const currentIndex = EFFECTS.indexOf(current);
      const nextIndex = (currentIndex + 1) % EFFECTS.length;
      const next = EFFECTS[nextIndex];
      console.log('🎨 Effect changed:', current, '→', next);
      return next;
    });
  };

  const getFlashIcon = () => {
    if (flash === 'off') return '⚡️';
    if (flash === 'on') return '⚡';
    return '⚡️';
  };

  // Format recording duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!cameraPermission || !audioPermission) {
    return (
      <View style={[globalStyles.container, globalStyles.centerContent]}>
        <Text style={styles.permissionText}>
          {!cameraPermission ? 'Camera permission required' : 'Microphone permission required'}
        </Text>
        <Text style={styles.permissionSubtext}>
          Both camera and microphone permissions are needed for video recording
        </Text>
        <TouchableOpacity 
          style={globalStyles.button}
          onPress={requestAllPermissions}
        >
          <Text style={globalStyles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ========== CAMERA VIEW (NO CHILDREN) ========== */}
      <CameraView 
        style={styles.camera}
        ref={cameraRef}
        facing={facing}
        mode={mode === 'photo' ? 'picture' : 'video'}
        flash={mode === 'photo' ? flash : 'off'}
        effect={mode === 'photo' ? effect : 'none'}
        videoQuality="1080p"
      />

      {/* ========== UI OVERLAY (SEPARATE FROM CAMERA) ========== */}
      <View style={styles.uiOverlay} pointerEvents="box-none">
        {/* Top bar: Cancel | Media Count | Done */}
        <View style={styles.topBar} pointerEvents="box-none">
          <TouchableOpacity 
            style={styles.topButton}
            onPress={handleCancel}
          >
            <Text style={styles.topButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.photoCount}>
            {capturedMedia.length} {capturedMedia.length === 1 ? 'item' : 'items'}
          </Text>
          
          <TouchableOpacity 
            style={[styles.topButton, styles.doneButton]}
            onPress={handleDone}
          >
            <Text style={styles.topButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Recording timer - shown when recording */}
        {isRecording && (
          <View style={styles.recordingIndicator} pointerEvents="none">
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>REC {formatDuration(recordingDuration)}</Text>
          </View>
        )}

        {/* Thumbnail strip */}
        {capturedMedia.length > 0 && (
          <View style={styles.thumbnailContainer} pointerEvents="box-none">
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailScroll}
            >
              {capturedMedia.map((media, index) => (
                <CapturedThumbnail 
                  key={`${media.uri}-${index}`}
                  uri={media.uri}
                  isVideo={media.type === 'video'}
                  onDelete={() => handleDeleteMedia(index)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom controls */}
        <View style={styles.controlsContainer} pointerEvents="box-none">
          {/* Mode toggle: Photo/Video */}
          <View style={styles.modeToggle}>
            <TouchableOpacity onPress={toggleMode}>
              <Text style={[styles.modeText, mode === 'photo' && styles.modeTextActive]}>
                PHOTO
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleMode}>
              <Text style={[styles.modeText, mode === 'video' && styles.modeTextActive]}>
                VIDEO
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomControls}>
            {/* Flip camera button */}
            <TouchableOpacity 
              style={styles.flipButton}
              onPress={toggleCamera}
              disabled={isRecording}
            >
              <Text style={styles.flipIcon}>🔄</Text>
            </TouchableOpacity>

            {/* Capture button */}
            <CaptureButton 
              onPress={handleCapture}
              loading={isCapturing}
              isRecording={isRecording}
              mode={mode}
            />

            {/* Effect button - cycles through effects (photo mode only) */}
            {mode === 'photo' ? (
              <TouchableOpacity 
                style={styles.flipButton}
                onPress={cycleEffect}
                disabled={isRecording}
              >
                <Text style={styles.effectIcon}>🎨</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.flipButton} />
            )}
          </View>
        </View>
      </View>

      {/* Flash toggle button - only show in photo mode */}
      {mode === 'photo' && (
        <TouchableOpacity 
          style={styles.flashButton}
          onPress={toggleFlash}
        >
          <Text style={styles.flashIcon}>{getFlashIcon()}</Text>
          <Text style={styles.flashText}>{flash.toUpperCase()}</Text>
        </TouchableOpacity>
      )}

      {/* Effect indicator - show current effect (photo mode only) */}
      {effect !== 'none' && mode === 'photo' && (
        <View style={styles.effectIndicator}>
          <Text style={styles.effectIndicatorText}>
            {effect.toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  uiOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  permissionSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  topButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  doneButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    borderRadius: 8,
  },
  topButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  photoCount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flashButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 10,
    alignItems: 'center',
    minWidth: 60,
    zIndex: 10,
  },
  flashIcon: {
    fontSize: 24,
  },
  flashText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipIcon: {
    fontSize: 30,
  },
  effectIcon: {
    fontSize: 30,
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    height: 90,
  },
  thumbnailScroll: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 20,
  },
  modeText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 100,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  effectIndicator: {
    position: 'absolute',
    top: 170,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 10,
  },
  effectIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});