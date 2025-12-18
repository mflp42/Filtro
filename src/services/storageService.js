import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

const PHOTOS_DIR = `${FileSystem.documentDirectory}photos/`;

// Ensure photos directory exists
async function ensureDirectoryExists() {
  const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!dirInfo.exists) {
    console.log('📁 Creating photos directory:', PHOTOS_DIR);
    await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

// Save photo to app storage
export async function savePhoto(photoUri) {
  await ensureDirectoryExists();
  
  const filename = `photo_${Date.now()}.jpg`;
  const destination = `${PHOTOS_DIR}${filename}`;
  
  console.log('💾 Saving photo to app storage...');
  console.log('   From:', photoUri);
  console.log('   To:', destination);
  
  await FileSystem.copyAsync({
    from: photoUri,
    to: destination,
  });
  
  console.log('✅ Photo saved to app storage');
  return destination;
}

// Save video to app storage
export async function saveVideo(videoUri) {
  await ensureDirectoryExists();
  
  const filename = `video_${Date.now()}.mp4`;
  const destination = `${PHOTOS_DIR}${filename}`;
  
  console.log('💾 Saving video to app storage...');
  console.log('   From:', videoUri);
  console.log('   To:', destination);
  
  await FileSystem.copyAsync({
    from: videoUri,
    to: destination,
  });
  
  console.log('✅ Video saved to app storage');
  return destination;
}

// Save photo/video to device gallery
export async function saveToGallery(uri) {
  console.log('📱 Saving to device gallery...');
  console.log('   URI:', uri);
  
  try {
    const asset = await MediaLibrary.createAssetAsync(uri);
    console.log('✅ Asset created:', asset.id);
    
    // Get or create CameraApp album
    const albums = await MediaLibrary.getAlbumsAsync();
    let album = albums.find(a => a.title === 'CameraApp');
    
    if (!album) {
      console.log('📂 Creating CameraApp album...');
      album = await MediaLibrary.createAlbumAsync('CameraApp', asset, false);
      console.log('✅ Album created');
    } else {
      console.log('📂 Adding to existing CameraApp album...');
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }
    
    console.log('✅ Saved to gallery - Album:', album.title);
    return asset;
  } catch (error) {
    console.error('❌ Error saving to gallery:', error);
    throw error;
  }
}