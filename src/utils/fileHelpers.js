import * as FileSystem from 'expo-file-system/legacy';

export const generatePhotoFilename = () => {
  const timestamp = Date.now();
  return `photo_${timestamp}.jpg`;
};

export const getPhotosDirectory = async () => {
  const directory = `${FileSystem.documentDirectory}photos/`;
  
  // Create directory if it doesn't exist
  const dirInfo = await FileSystem.getInfoAsync(directory);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }
  
  return directory;
};