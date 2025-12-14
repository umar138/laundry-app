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
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// ✅ CONFIRMED IP ADDRESS
const API_URL = 'http://192.168.18.21:3000'; 

export default function SignupScreen() {
  const router = useRouter();
  const [role, setRole] = useState('client'); // 'client' or 'owner'
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(''); // Added Phone for Owners

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!name || !email || !password) {
        Alert.alert("Missing Fields", "Please fill in all required fields.");
        return;
    }
    if (role === 'owner' && (!shopName || !address)) {
        Alert.alert("Missing Fields", "Shop Name and Address are required for Shop Owners.");
        return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          shop_name: role === 'owner' ? shopName : null,
          address: role === 'owner' ? address : null,
          phone: phone 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto Login after Signup
        await AsyncStorage.setItem('user_id', data.id.toString());
        await AsyncStorage.setItem('user_name', data.name);
        await AsyncStorage.setItem('user_role', data.role);
        
        // Save extra info for owners
        if(role === 'owner') {
            await AsyncStorage.setItem('shop_name', shopName);
            await AsyncStorage.setItem('address', address);
        }

        Alert.alert("Success", "Account created successfully!", [
            { text: "OK", onPress: () => {
                if (role === 'owner') router.replace('/provider/dashboard');
                else router.replace('/home');
            }}
        ]);
      } else {
        Alert.alert("Signup Failed", data.error || "Could not create account.");
      }
    } catch (error) {
      Alert.alert("Connection Error", "Check your WiFi connection and make sure your PC Firewall is OFF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.content}>
          
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up as a {role === 'client' ? 'Customer' : 'Laundry Partner'}</Text>

          {/* ROLE TOGGLE */}
          <View style={styles.roleContainer}>
            <TouchableOpacity 
                style={[styles.roleBtn, role === 'client' && styles.roleBtnActive]} 
                onPress={() => setRole('client')}
            >
                <Ionicons name="person" size={20} color={role === 'client' ? '#fff' : '#57636C'} />
                <Text style={[styles.roleText, role === 'client' && styles.roleTextActive]}>Customer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.roleBtn, role === 'owner' && styles.roleBtnActive]} 
                onPress={() => setRole('owner')}
            >
                <Ionicons name="business" size={20} color={role === 'owner' ? '#fff' : '#57636C'} />
                <Text style={[styles.roleText, role === 'owner' && styles.roleTextActive]}>Shop Owner</Text>
            </TouchableOpacity>
          </View>

          {/* COMMON FIELDS */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#999" style={styles.icon} />
            <TextInput placeholder="Full Name" style={styles.input} value={name} onChangeText={setName} />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#999" style={styles.icon} />
            <TextInput placeholder="Email Address" style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.icon} />
            <TextInput placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          {/* OWNER SPECIFIC FIELDS */}
          {role === 'owner' && (
            <>
                <View style={styles.inputContainer}>
                    <Ionicons name="storefront-outline" size={20} color="#999" style={styles.icon} />
                    <TextInput placeholder="Shop Name" style={styles.input} value={shopName} onChangeText={setShopName} />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="location-outline" size={20} color="#999" style={styles.icon} />
                    <TextInput placeholder="Shop Address" style={styles.input} value={address} onChangeText={setAddress} />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color="#999" style={styles.icon} />
                    <TextInput placeholder="Phone Number" style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
            </>
          )}

          <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupBtnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Already have an account? <Text style={{fontWeight: 'bold', color: '#4B39EF'}}>Login</Text></Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  content: { padding: 25, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#101213', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#57636C', textAlign: 'center', marginBottom: 30 },
  
  roleContainer: { flexDirection: 'row', backgroundColor: '#F1F4F8', borderRadius: 12, padding: 4, marginBottom: 25 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },
  roleBtnActive: { backgroundColor: '#4B39EF', elevation: 2 },
  roleText: { marginLeft: 8, fontWeight: '600', color: '#57636C' },
  roleTextActive: { color: '#fff' },

  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F4F8', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, height: 50 },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', color: '#101213' },

  signupBtn: { backgroundColor: '#101213', borderRadius: 30, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 2 },
  signupBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  linkBtn: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#57636C' }
});