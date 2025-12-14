import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// ✅ CORRECT SERVER IP
const API_URL = 'http://192.168.18.21:3000'; 

export default function ProviderProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const id = await AsyncStorage.getItem('user_id');
        if (!id) return;

        const response = await fetch(`${API_URL}/users/${id}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        // Silent fail or alert
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Log Out", 
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace('/login');
        } 
      }
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4B39EF" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#101213" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
             <Text style={styles.avatarText}>{user?.name?.charAt(0) || "U"}</Text>
          </View>
          <Text style={styles.name}>{user?.name || "Laundry Owner"}</Text>
          <Text style={styles.role}>Shop Partner</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.row}>
            <Ionicons name="storefront-outline" size={20} color="#57636C" />
            <Text style={styles.infoText}>{user?.shop_name || "No Shop Name"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={20} color="#57636C" />
            <Text style={styles.infoText}>{user?.email || "No Email"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color="#57636C" />
            <Text style={styles.infoText}>{user?.address || "No Address"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons name="call-outline" size={20} color="#57636C" />
            <Text style={styles.infoText}>{user?.phone || "No Phone"}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
          <Ionicons name="log-out-outline" size={20} color="#FF5963" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F8', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4B39EF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#101213' },
  role: { fontSize: 14, color: '#57636C' },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 30 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  infoText: { marginLeft: 15, fontSize: 16, color: '#101213' },
  divider: { height: 1, backgroundColor: '#F1F4F8' },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FF5963' },
  logoutText: { color: '#FF5963', fontSize: 16, fontWeight: 'bold', marginRight: 10 },
});