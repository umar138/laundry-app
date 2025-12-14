import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// ✅ CORRECT SERVER IP
const API_URL = 'http://192.168.18.21:3000'; 

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Info", "Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save User Data
        await AsyncStorage.setItem('user_id', data.id.toString());
        await AsyncStorage.setItem('user_name', data.name);
        await AsyncStorage.setItem('user_role', data.role);
        
        // Save Owner Details if they exist
        if (data.shop_name) await AsyncStorage.setItem('shop_name', data.shop_name);
        if (data.phone) await AsyncStorage.setItem('user_phone', data.phone);
        if (data.address) await AsyncStorage.setItem('address', data.address);

        Alert.alert("Success", "Logged in successfully!", [
            { text: "OK", onPress: () => {
                // Navigate based on Role
                if (data.role === 'owner') {
                    router.replace('/provider/dashboard');
                } else {
                    router.replace('/home');
                }
            }}
        ]);
      } else {
        Alert.alert("Login Failed", "Invalid email or password");
      }
    } catch (error) {
      Alert.alert("Connection Error", "Could not connect to server. Ensure your PC and Phone are on the same WiFi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1, justifyContent: 'center'}}>
        <View style={styles.content}>
          
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to continue</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#999" style={styles.icon} />
            <TextInput 
                placeholder="Email Address" 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail} 
                autoCapitalize="none" 
                keyboardType="email-address" 
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.icon} />
            <TextInput 
                placeholder="Password" 
                style={styles.input} 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
            />
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Login</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/signup')}>
            <Text style={styles.linkText}>Don't have an account? <Text style={{fontWeight: 'bold', color: '#4B39EF'}}>Sign Up</Text></Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  content: { padding: 25 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#101213', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#57636C', textAlign: 'center', marginBottom: 40 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F4F8', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, height: 50 },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', color: '#101213' },
  loginBtn: { backgroundColor: '#4B39EF', borderRadius: 30, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 2 },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkBtn: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#57636C' }
});