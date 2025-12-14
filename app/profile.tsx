import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 🔗 SERVER ADDRESS
const API_URL = 'http://192.168.18.21:3000'; 

// ✅ FIX: Component defined OUTSIDE the main function
const DataRow = ({ label, value, iconName, editable, onChangeText, keyboardType }) => (
  <View style={styles.dataRow}>
    <Ionicons name={iconName} size={24} color="#4B39EF" style={styles.icon} />
    <View style={styles.dataTextContainer}>
      <Text style={styles.dataLabel}>{label}</Text>
      {editable ? (
          <TextInput
              style={styles.dataInput}
              value={value}
              onChangeText={onChangeText}
              keyboardType={keyboardType || 'default'}
              autoCapitalize={iconName === 'mail-outline' ? 'none' : 'sentences'}
          />
      ) : (
          <Text style={styles.dataValue}>{value}</Text>
      )}
    </View>
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 1. Fetch User Data
  useEffect(() => {
    const loadUserData = async () => {
      const userId = await AsyncStorage.getItem('user_id');
      const userRole = await AsyncStorage.getItem('user_role');
      
      if (!userId || userRole !== 'client') {
        router.replace('/role-selection');
        return;
      }
      
      setFullName(await AsyncStorage.getItem('user_name') || 'Customer');
      setEmail(await AsyncStorage.getItem('user_email') || 'user@example.com');
      setAddress(await AsyncStorage.getItem('address') || 'D-123, Sector F-11, Islamabad'); 

      setIsLoading(false);
    };
    loadUserData();
  }, []);

  // 2. Save Profile
  const handleSave = async () => {
    if (!fullName || !email || !address) {
        Alert.alert("Error", "All fields are required.");
        return;
    }
    
    setIsSaving(true);
    const userId = await AsyncStorage.getItem('user_id');
    
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: fullName,       
                email: email,       
                shop_name: '',        
                address: address,     
            }),
        });

        if (response.ok) {
            await AsyncStorage.setItem('user_name', fullName);
            await AsyncStorage.setItem('user_email', email);
            await AsyncStorage.setItem('address', address);
            Alert.alert("Success", "Profile updated successfully!");
            setIsEditing(false);
        } else {
            Alert.alert("Error", "Failed to save profile.");
        }
    } catch (error) {
        Alert.alert("Connection Error", "Could not connect to server.");
    } finally {
        setIsSaving(false);
    }
  };

  // 3. Logout
  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
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

  if (isLoading) {
      return (
          <SafeAreaView style={styles.container}>
              <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading profile...</Text>
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#101213" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Profile' : 'My Profile'}</Text>
        
        {isEditing ? (
            <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                <Text style={styles.headerBtnText}>{isSaving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
        ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.headerBtnText}>Edit</Text>
            </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          <View style={styles.profileHeader}>
            <Ionicons name="person-circle-outline" size={100} color="#4B39EF" />
            <Text style={styles.userName}>{fullName}</Text>
            <Text style={styles.userRole}>Customer Account</Text>
          </View>

          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            
            <DataRow 
              label="Full Name" 
              value={fullName} 
              iconName="person-outline" 
              editable={isEditing}
              onChangeText={setFullName}
            />
            <DataRow 
              label="Email Address" 
              value={email} 
              iconName="mail-outline" 
              editable={isEditing}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <DataRow 
              label="Default Address" 
              value={address} 
              iconName="location-outline" 
              editable={isEditing}
              onChangeText={setAddress}
            />

          </View>
          
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
            <Ionicons name="log-out-outline" size={24} color="#fff" style={{ marginLeft: 10 }} />
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F8', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerBtnText: { color: '#4B39EF', fontSize: 16, fontWeight: 'bold' },
  
  content: { padding: 20, flexGrow: 1 },
  
  profileHeader: { alignItems: 'center', padding: 20, marginBottom: 20 },
  userName: { fontSize: 28, fontWeight: 'bold', color: '#101213', marginTop: 10 },
  userRole: { fontSize: 14, color: '#57636C' },

  dataSection: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#101213', marginBottom: 15 },
  
  dataRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#F1F4F8' },
  icon: { marginRight: 15 },
  dataTextContainer: { flex: 1, paddingVertical: 5 },
  dataLabel: { fontSize: 12, color: '#57636C' },
  dataValue: { fontSize: 16, fontWeight: '600', color: '#101213' },
  dataInput: { 
      fontSize: 16, 
      fontWeight: '600', 
      color: '#101213',
      paddingVertical: 0,
      borderBottomWidth: 1,
      borderColor: '#4B39EF' 
  },
  
  logoutBtn: { backgroundColor: '#FF5963', borderRadius: 30, height: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});