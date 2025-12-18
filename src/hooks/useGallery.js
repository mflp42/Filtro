import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';

export default function useGallery() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async (loadMore = false) => {
    console.log('Loading media, loadMore:', loadMore);
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      // Load ALL media (photos and videos) - no album filtering
      const result = await MediaLibrary.getAssetsAsync({
        first: 100,
        after: loadMore ? endCursor : undefined,
        sortBy: [MediaLibrary.SortBy.modificationTime],
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
      });
      
      console.log('Loaded media:', result.assets.length);
      
      // Filter to only DCIM/Camera and Pictures/CameraApp
      const filtered = result.assets.filter(item => 
        item.uri.includes('/DCIM/Camera/') || 
        item.uri.includes('/Pictures/CameraApp/')
      );
      
      console.log('Filtered media:', filtered.length);
      
      // Transform to match expected format (mediaType -> type)
      const transformed = filtered.map(item => ({
        uri: item.uri,
        type: item.mediaType === 'video' ? 'video' : 'photo',
        duration: item.duration || 0,
      }));
      
      if (loadMore) {
        setMedia(prev => [...prev, ...transformed]);
      } else {
        setMedia(transformed);
      }
      
      setHasNextPage(result.hasNextPage);
      setEndCursor(result.endCursor);
      setLoading(false);
    } catch (error) {
      console.error('Error loading gallery:', error);
      setLoading(false);
    }
  };

  const loadMoreMedia = () => {
    if (hasNextPage && !loading) {
      setLoading(true);
      loadMedia(true);
    }
  };

  const refreshMedia = () => {
    setLoading(true);
    loadMedia(false);
  };

  return {
    media,
    loading,
    hasNextPage,
    loadMoreMedia,
    refreshMedia,
  };
}