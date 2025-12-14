import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

// Create the Context
const AuthContext = createContext(null);

// Custom hook to easily access auth state
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Stores {id, role}
  const [isLoading, setIsLoading] = useState(true); // Tracks if AsyncStorage check is complete

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        const userRole = await AsyncStorage.getItem('user_role');
        
        if (userId) {
          setUser({ id: userId, role: userRole });
        }
      } catch (e) {
        console.error("Failed to load user from storage:", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);
  
  const value = {
    user,
    isLoading,
    login: () => {}, 
    logout: () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}