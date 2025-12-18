import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { Image } from 'expo-image';
import { Video } from 'expo-av';
import { colors } from '../styles/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MediaViewerScreen({ route, navigation }) {
  const { uri, type } = route.params;
  const [videoStatus, setVideoStatus] = useState({});

  const handleClose = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    console.log('✏️  Edit button pressed for photo:', uri);
    navigation.navigate('PhotoEdit', { uri });
  };

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={handleClose}
      >
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>

      {/* Edit button - Only show for photos */}
      {type === 'photo' && (
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEdit}
        >
          <Text style={styles.editIcon}>✏️</Text>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      )}

      {/* Media content */}
      {type === 'photo' ? (
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="contain"
        />
      ) : (
        <Video
          source={{ uri }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
          isLooping={false}
          onPlaybackStatusUpdate={status => setVideoStatus(() => status)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  editText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});