import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      // 1. Check if user is logged in
      const userId = await AsyncStorage.getItem('user_id');
      const role = await AsyncStorage.getItem('user_role');

      // 2. Decide where to go
      if (userId) {
        if (role === 'owner') {
          router.replace('/provider/dashboard'); // Go to Owner Dashboard
        } else {
          router.replace('/home'); // Go to Client Home
        }
      } else {
        router.replace('/login'); // Go to Login if no user
      }
    };

    // Small delay to let splash screen show
    setTimeout(checkLogin, 1000);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#4B39EF" />
    </View>
  );
}