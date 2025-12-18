export const takePicture = async (camera) => {
  if (!camera) {
    throw new Error('Camera not available');
  }
  
  try {
    const photo = await camera.takePictureAsync({
      quality: 0.8,
      skipProcessing: false,
    });
    
    return photo.uri;
  } catch (error) {
    console.error('Error taking picture:', error);
    throw error;
  }
};