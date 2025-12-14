import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 🔗 SERVER ADDRESS
const API_URL = 'http://192.168.18.21:3000'; 

export default function ProviderProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState({ 
    id: null,
    name: '', 
    email: '', 
    shopName: '',
    address: '' 
  });
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Owner Data on Load
  useEffect(() => {
    const loadOwnerData = async () => {
      const userId = await AsyncStorage.getItem('user_id');
      const userName = await AsyncStorage.getItem('user_name');
      const userRole = await AsyncStorage.getItem('user_role');
      const userEmail = await AsyncStorage.getItem('user_email') || '';

      if (!userId || userRole !== 'owner') {
        router.replace('/role-selection');
        return;
      }
      
      // We rely on data saved during signup/login
      setUser({
        id: userId,
        name: userName || 'Owner',
        email: userEmail,
        shopName: `${userName || 'Default'}'s Laundry Shop`, // Placeholder/display name
        address: '123 Laundry Street, Islamabad', // Placeholder/default address
      });
    };
    loadOwnerData();
  }, []);

  // 2. Profile Update Function (Uses the same PUT /users/:id endpoint)
  const handleSave = async () => {
    if (!user.id || !user.name || !user.email || !user.address) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          address: user.address,
          // Note: shopName is usually a separate update, but for this simple schema, 
          // we are only updating name, email, and address in the users table.
        }),
      });

      if (response.ok) {
        // Update local storage to reflect changes immediately
        await AsyncStorage.setItem('user_name', user.name);
        await AsyncStorage.setItem('user_email', user.email);
        
        Alert.alert("Success", "Shop profile updated!");
        // Update the displayed shop name (which uses user.name as a base)
        setUser(prev => ({ ...prev, shopName: `${user.name}'s Laundry Shop` }));

      } else {
        const data = await response.json();
        Alert.alert("Update Failed", data.message || "Failed to update profile on server.");
      }
    } catch (error) {
      Alert.alert("Connection Error", "Could not connect to server to save changes.");
    } finally {
      setIsSaving(false);
    }
  };


  // 3. Logout Function
  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your Partner Account?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          onPress: async () => {
            await AsyncStorage.clear(); 
            router.replace('/role-selection'); 
          }
        }
      ]
    );
  };

  const InputRow = ({ label, value, iconName, onChangeText, keyboardType = 'default' }) => (
    <View style={styles.dataRow}>
      <Ionicons name={iconName} size={24} color="#FF6F00" style={styles.icon} />
      <View style={styles.dataTextContainer}>
        <Text style={styles.dataLabel}>{label}</Text>
        <TextInput
            style={styles.dataInput}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#101213" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={isSaving}>
            <Text style={styles.saveBtnText}>{isSaving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.profileHeader}>
          <Ionicons name="business-outline" size={100} color="#FF6F00" />
          <Text style={styles.shopName}>{user.shopName}</Text>
          <Text style={styles.userName}>Manager: {user.name}</Text>
        </View>

        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>Edit Shop Information</Text>
          
          <InputRow 
            label="Manager Name" 
            value={user.name} 
            iconName="person-outline" 
            onChangeText={(text) => setUser({...user, name: text})}
          />
          <InputRow 
            label="Shop Address" 
            value={user.address} 
            iconName="location-outline" 
            onChangeText={(text) => setUser({...user, address: text})}
          />
          <InputRow 
            label="Login Email" 
            value={user.email} 
            iconName="mail-outline" 
            onChangeText={(text) => setUser({...user, email: text})}
            keyboardType='email-address'
          />
          
        </View>
        
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
          <Ionicons name="log-out-outline" size={24} color="#fff" style={{ marginLeft: 10 }} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F8', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#FF6F00', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  
  content: { padding: 20, flexGrow: 1 },
  
  profileHeader: { alignItems: 'center', padding: 20, marginBottom: 20 },
  shopName: { fontSize: 28, fontWeight: 'bold', color: '#101213', marginTop: 10 },
  userName: { fontSize: 16, color: '#57636C' },

  dataSection: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#101213', marginBottom: 15 },
  
  dataRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F4F8' },
  icon: { marginRight: 15 },
  dataTextContainer: { flex: 1 },
  dataLabel: { fontSize: 12, color: '#57636C' },
  dataInput: { 
      fontSize: 16, 
      fontWeight: '600', 
      color: '#101213',
      paddingVertical: 0,
      minHeight: 25 
  },
  
  logoutBtn: { 
    backgroundColor: '#FF6F00', 
    borderRadius: 30, 
    height: 50, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 20
  },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});