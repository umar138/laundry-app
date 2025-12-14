import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 🔗 SERVER ADDRESS - UPDATE YOUR IP HERE!
const API_URL = 'http://192.168.18.21:3000'; 

export default function SignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role || 'client'; 

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || (role === 'owner' && (!shopName || !address))) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          role: role,
          shop_name: shopName,
          address: address
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Account Created!");
        
        // SAVE CORE USER DATA
        await AsyncStorage.setItem('user_id', data.userId.toString());
        await AsyncStorage.setItem('user_name', name);
        await AsyncStorage.setItem('user_role', role);
        await AsyncStorage.setItem('user_email', email); 

        // SAVE OWNER-SPECIFIC DATA AND REDIRECT
        if (role === 'owner') {
           // Save shop_name and address for dashboard display
           await AsyncStorage.setItem('shop_name', shopName); 
           await AsyncStorage.setItem('address', address); 
           
           // REVERTED: Go to Dashboard, as requested
           router.push('/provider/dashboard'); 
        } else {
           // Client: Go to Customer Home
           router.replace('/'); 
        }

      } else {
        Alert.alert("Error", data.error || "Signup failed");
      }

    } catch (error) {
      Alert.alert("Connection Error", "Could not connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
           <Ionicons name="arrow-back" size={24} color="#101213" />
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Sign up as a {role === 'owner' ? 'Laundry Partner' : 'Customer'}
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#999" style={styles.icon} />
          <TextInput 
            placeholder="Full Name" 
            style={styles.input} 
            value={name}
            onChangeText={setName}
          />
        </View>

        {role === 'owner' && (
            <>
            <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={20} color="#999" style={styles.icon} />
                <TextInput 
                    placeholder="Shop Name" 
                    style={styles.input} 
                    value={shopName}
                    onChangeText={setShopName}
                />
            </View>
            <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#999" style={styles.icon} />
                <TextInput 
                    placeholder="Shop Address" 
                    style={styles.input} 
                    value={address}
                    onChangeText={setAddress}
                />
            </View>
            </>
        )}

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#999" style={styles.icon} />
          <TextInput 
            placeholder="Email Address" 
            style={styles.input} 
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.icon} />
          <TextInput 
            placeholder="Password" 
            style={styles.input} 
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={isLoading}>
          <Text style={styles.signupText}>{isLoading ? "Creating..." : "Create Account"}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={{color: '#57636C'}}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/login', params: { role } })}>
            <Text style={styles.link}>Login</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  content: { padding: 30, flex: 1, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#101213', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#57636C', marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F4F8', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, height: 50 },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', color: '#101213' },
  signupBtn: { backgroundColor: '#101213', borderRadius: 30, height: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  signupText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  link: { color: '#4B39EF', fontWeight: 'bold' }
});