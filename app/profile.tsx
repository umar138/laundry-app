import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 🔗 SERVER ADDRESS
const API_URL = 'http://192.168.18.21:3000'; 

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState({ name: 'Loading...', email: 'Loading...', address: 'Loading...' });
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch User Data on Load
  useEffect(() => {
    const loadUserData = async () => {
      // Get stored data (ID, Name, Role are stored locally at login)
      const userId = await AsyncStorage.getItem('user_id');
      const userName = await AsyncStorage.getItem('user_name');
      const userRole = await AsyncStorage.getItem('user_role');
      const userEmail = await AsyncStorage.getItem('user_email') || 'user@example.com'; // Fallback for email

      if (!userId || userRole !== 'client') {
        // Not logged in as a client, redirect
        router.replace('/role-selection');
        return;
      }

      // Note: We use the local data saved during login/signup.
      setUser({
        name: userName || 'Customer',
        email: userEmail,
        // We use a placeholder since the full address isn't saved to local storage upon login
        address: 'D-123, Sector F-11, Islamabad', 
      });
      setIsLoading(false);
    };
    loadUserData();
  }, []);

  // 2. Logout Function
  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Log Out", 
          onPress: async () => {
            await AsyncStorage.clear(); // Clear ALL stored user data
            router.replace('/role-selection'); // Go back to the starting screen
          }
        }
      ]
    );
  };

  const DataRow = ({ label, value, iconName }) => (
    <View style={styles.dataRow}>
      <Ionicons name={iconName} size={24} color="#4B39EF" style={styles.icon} />
      <View style={styles.dataTextContainer}>
        <Text style={styles.dataLabel}>{label}</Text>
        <Text style={styles.dataValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#101213" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        
        <View style={styles.profileHeader}>
          <Ionicons name="person-circle-outline" size={100} color="#4B39EF" />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>Customer Account</Text>
        </View>

        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <DataRow 
            label="Full Name" 
            value={user.name} 
            iconName="person-outline" 
          />
          <DataRow 
            label="Email Address" 
            value={user.email} 
            iconName="mail-outline" 
          />
          <DataRow 
            label="Default Address" 
            value={user.address} 
            iconName="location-outline" 
          />

        </View>
        
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
          <Ionicons name="log-out-outline" size={24} color="#fff" style={{ marginLeft: 10 }} />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F8', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, flex: 1 },
  
  profileHeader: { alignItems: 'center', padding: 20, marginBottom: 20 },
  userName: { fontSize: 28, fontWeight: 'bold', color: '#101213', marginTop: 10 },
  userRole: { fontSize: 14, color: '#57636C' },

  dataSection: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#101213', marginBottom: 15 },
  
  dataRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F4F8' },
  icon: { marginRight: 15 },
  dataTextContainer: { flex: 1 },
  dataLabel: { fontSize: 12, color: '#57636C' },
  dataValue: { fontSize: 16, fontWeight: '600', color: '#101213' },
  
  logoutBtn: { 
    backgroundColor: '#FF5963', 
    borderRadius: 30, 
    height: 50, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 'auto' 
  },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});