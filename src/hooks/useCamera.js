import { useRef, useState } from 'react';
import * as cameraService from '../services/cameraService';

export default function useCamera() {
  const cameraRef = useRef(null);
  const recordingRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const takePicture = async () => {
    if (!cameraRef.current) {
      console.error('❌ Camera ref not available');
      return null;
    }

    console.log('📸 Taking picture...');
    setIsCapturing(true);
    
    try {
      const photoUri = await cameraService.takePicture(cameraRef.current);
      console.log('✅ Picture captured:', photoUri);
      return photoUri;
    } catch (error) {
      console.error('❌ Error taking picture:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) {
      console.error('❌ Camera ref not available');
      return false;
    }

    console.log('🎥 Starting video recording...');
    setIsRecording(true);
    
    try {
      recordingRef.current = cameraRef.current.recordAsync({
        maxDuration: 300, // 5 mins
      });
      console.log('✅ Recording started');
      return true;
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      setIsRecording(false);
      recordingRef.current = null;
      return false;
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current || !recordingRef.current) {
      console.error('❌ Camera or recording not available');
      return null;
    }

    console.log('⏹️  Stopping video recording...');
    
    try {
      cameraRef.current.stopRecording();
      const video = await recordingRef.current;
      
      setIsRecording(false);
      recordingRef.current = null;
      
      console.log('✅ Video recorded:', video?.uri);
      return video?.uri || null;
    } catch (error) {
      console.error('❌ Error stopping recording:', error);
      setIsRecording(false);
      recordingRef.current = null;
      return null;
    }
  };

  return {
    cameraRef,
    takePicture,
    startRecording,
    stopRecording,
    isCapturing,
    isRecording,
  };
}