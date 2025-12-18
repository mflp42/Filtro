import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CameraScreen from '../screens/CameraScreen';
import GalleryScreen from '../screens/GalleryScreen';
import MediaViewerScreen from '../screens/MediaViewerScreen';
import PhotoEditScreen from '../screens/PhotoEditScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Profile"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'My Profile' }}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen}
          options={{ title: 'Edit Profile' }}
        />
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen}
          options={{ 
            title: 'Camera',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Gallery" 
          component={GalleryScreen}
          options={{ title: 'Gallery' }}
        />
        <Stack.Screen 
          name="MediaViewer" 
          component={MediaViewerScreen}
          options={{ 
            title: 'Media',
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen 
          name="PhotoEdit" 
          component={PhotoEditScreen}
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}