import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 🔗 SERVER ADDRESS - UPDATE YOUR IP HERE!
const API_URL = 'http://192.168.18.21:3000'; 

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role || 'client'; 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // SAVE USER DATA
        await AsyncStorage.setItem('user_id', data.user.id.toString());
        await AsyncStorage.setItem('user_name', data.user.name);
        await AsyncStorage.setItem('user_role', data.user.role);

        // Navigate
        if (data.user.role === 'owner') {
           router.push('/provider/dashboard');
        } else {
           router.replace('/'); 
        }

      } else {
        Alert.alert("Login Failed", "Invalid email or password");
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
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Login as {role === 'owner' ? 'Laundry Owner' : 'Customer'}</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#999" style={styles.icon} />
          <TextInput placeholder="Email Address" style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.icon} />
          <TextInput placeholder="Password" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={isLoading}>
          <Text style={styles.loginText}>{isLoading ? "Checking..." : "Login"}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={{color: '#57636C'}}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/signup', params: { role } })}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  content: { padding: 30, flex: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#101213', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#57636C', marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F4F8', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, height: 50 },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', color: '#101213' },
  loginBtn: { backgroundColor: '#4B39EF', borderRadius: 30, height: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  loginText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  link: { color: '#4B39EF', fontWeight: 'bold' }
});