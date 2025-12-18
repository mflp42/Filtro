import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export default function usePermissions() {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [audioPermission, setAudioPermission] = useState(null);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    console.log('🔐 Checking permissions...');
    
    const cameraStatus = await Camera.getCameraPermissionsAsync();
    const audioStatus = await Camera.getMicrophonePermissionsAsync();
    const mediaStatus = await MediaLibrary.getPermissionsAsync();
    
    console.log('📷 Camera permission:', cameraStatus.status);
    console.log('🎤 Audio permission:', audioStatus.status);
    console.log('📂 Media Library permission:', mediaStatus.status);
    
    setCameraPermission(cameraStatus.status === 'granted');
    setAudioPermission(audioStatus.status === 'granted');
    setMediaLibraryPermission(mediaStatus.status === 'granted');
    setLoading(false);
  };

  const requestCameraPermission = async () => {
    console.log('🔐 Requesting camera permission...');
    const { status } = await Camera.requestCameraPermissionsAsync();
    console.log('📷 Camera permission result:', status);
    setCameraPermission(status === 'granted');
    return status === 'granted';
  };

  const requestAudioPermission = async () => {
    console.log('🔐 Requesting audio permission...');
    const { status } = await Camera.requestMicrophonePermissionsAsync();
    console.log('🎤 Audio permission result:', status);
    setAudioPermission(status === 'granted');
    return status === 'granted';
  };

  const requestMediaLibraryPermission = async () => {
    console.log('🔐 Requesting media library permission...');
    const { status } = await MediaLibrary.requestPermissionsAsync();
    console.log('📂 Media Library permission result:', status);
    setMediaLibraryPermission(status === 'granted');
    return status === 'granted';
  };

  const requestAllPermissions = async () => {
    console.log('🔐 Requesting all permissions...');
    
    const cameraGranted = await requestCameraPermission();
    const audioGranted = await requestAudioPermission();
    const mediaGranted = await requestMediaLibraryPermission();
    
    const allGranted = cameraGranted && audioGranted && mediaGranted;
    console.log('✅ All permissions granted:', allGranted);
    
    return allGranted;
  };

  return {
    cameraPermission,
    audioPermission,
    mediaLibraryPermission,
    loading,
    requestCameraPermission,
    requestAudioPermission,
    requestMediaLibraryPermission,
    requestAllPermissions,
  };
}