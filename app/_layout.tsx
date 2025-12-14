import { Stack, router, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './AuthContext';

// Routes that are always public (login, signup, role selection)
const PUBLIC_ROUTES = ['role-selection', 'login', 'signup'];

// This component handles the actual redirection logic
function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments(); 
  
  // Check if the first segment of the current path is NOT a public route
  const inProtectedFlow = !PUBLIC_ROUTES.includes(segments[0]);

  useEffect(() => {
    // 1. Wait for loading (AsyncStorage check) to finish
    if (isLoading) return;

    // 2. LOGGED OUT: If user is NOT loaded AND they are attempting to access a protected screen, redirect them to role selection.
    // This is the ONLY automatic, forceful redirection we keep.
    if (!user && inProtectedFlow) {
      router.replace('/role-selection');
    } 
    
    // We intentionally removed the logic that redirects a logged-in user 
    // from a public screen to their dashboard. This allows the app to land 
    // on /role-selection or /login/signup, fulfilling the requirement.

  }, [user, isLoading, segments, inProtectedFlow]);


  // If the app is still checking AsyncStorage, show a loader
  if (isLoading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
  }

  return (
    <Stack>
      {/* PUBLIC ROUTES (No Auth Required) */}
      <Stack.Screen name="role-selection" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />

      {/* PROTECTED ROUTES (Auth Required) */}
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Home' }} />
      <Stack.Screen name="order" options={{ headerShown: false, title: 'Order' }} />
      <Stack.Screen name="cart" options={{ headerShown: false, title: 'Cart' }} />
      <Stack.Screen name="payment" options={{ headerShown: false, title: 'Payment' }} />
      <Stack.Screen name="success" options={{ headerShown: false, title: 'Success' }} />
      <Stack.Screen name="orders" options={{ headerShown: false, title: 'My Orders' }} />
      <Stack.Screen name="profile" options={{ headerShown: false, title: 'Profile' }} />
      
      {/* Provider Group */}
      <Stack.Screen name="provider/dashboard" options={{ headerShown: false, title: 'Dashboard' }} />
      <Stack.Screen name="provider/services" options={{ headerShown: false, title: 'Services' }} />
      <Stack.Screen name="provider/profile" options={{ headerShown: false, title: 'Partner Profile' }} />
    </Stack>
  );
}

// Wrap the main layout in the AuthProvider
export default function Root() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}