import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 🔗 SERVER ADDRESS - UPDATE YOUR IP HERE!
const API_URL = 'http://192.168.18.21:3000'; 

// --- Dummy service types for the top row ---
const SERVICE_TYPES = [
    { name: 'Wash', icon: 'water-outline', color: '#4B39EF' },
    { name: 'Iron', icon: 'color-filter-outline', color: '#FF6F00' },
    { name: 'Dry Clean', icon: 'snow-outline', color: '#101213' },
];

export default function CustomerHomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('Customer');
  const [shops, setShops] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  // CRITICAL: Initialize selectedService to ensure one is active or null
  const [selectedService, setSelectedService] = useState(SERVICE_TYPES[0].name); 

  // 1. Load User Data
  useEffect(() => {
    const loadUser = async () => {
      const name = await AsyncStorage.getItem('user_name');
      const id = await AsyncStorage.getItem('user_id');
      if (name) setUserName(name);
      if (id) setUserId(id);
    };
    loadUser();
  }, []);

  // 2. Fetch All Laundry Shops
  const fetchShops = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/users/owners`);
      const data = await response.json();
      setShops(data);
    } catch (error) {
      console.log("Error fetching shops:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // 3. Fetch shops every time the screen is focused
  useFocusEffect(
    useCallback(() => {
        fetchShops();
        return () => {}; 
    }, [fetchShops])
  );
  
  const onRefresh = useCallback(() => {
    fetchShops();
  }, [fetchShops]);

  // 4. CRITICAL FIX: Navigate to Order Screen and pass ALL required data
  const handleSelectShop = (shop) => {
    if (!selectedService) {
        Alert.alert("Service Required", "Please select a service type (Wash, Iron, or Dry Clean) first.");
        return;
    }
    
    // Pass shopId (owner ID), shopName, AND the selected service filter
    router.push({
      pathname: '/order',
      params: { 
        shopId: shop.id.toString(), 
        shopName: shop.shop_name,
        serviceType: selectedService, // <--- CRITICAL: Pass the filter
      },
    });
  };
  
  // 5. Helper for aesthetic highlighting
  const getBoxStyle = (serviceName) => {
      return serviceName === selectedService ? styles.serviceTypeBoxActive : styles.serviceTypeBox;
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome Back, {userName}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/orders')} style={{marginRight: 15}}>
            <Ionicons name="receipt-outline" size={24} color="#101213" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Ionicons name="person-circle-outline" size={28} color="#4B39EF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {/* --- 1. Service Type Selector (CRITICAL: Sets the selectedService state) --- */}
        <Text style={styles.sectionTitle}>Select Service Type</Text>
        <View style={styles.serviceTypeRow}>
            {SERVICE_TYPES.map((service) => (
                <TouchableOpacity 
                    key={service.name} 
                    style={getBoxStyle(service.name)} // Apply active style
                    onPress={() => setSelectedService(service.name)} // Sets the state
                >
                    <Ionicons name={service.icon} size={30} color={service.color} />
                    <Text style={[styles.serviceTypeName, {color: service.color}]}>{service.name}</Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* --- 2. Nearby Laundry Shops List --- */}
        <Text style={styles.sectionTitle}>Popular laundry nearby</Text>

        {shops.length === 0 ? (
          <Text style={styles.emptyText}>No laundry partners available right now.</Text>
        ) : (
          shops.map((shop) => (
            <TouchableOpacity 
              key={shop.id} 
              style={styles.shopCard}
              onPress={() => handleSelectShop(shop)} // Now passes selectedService
            >
              <View style={styles.shopIconContainer}>
                <Ionicons name="business" size={32} color="#FF6F00" />
              </View>
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{shop.shop_name}</Text>
                <Text style={styles.shopAddress}>📍 {shop.address}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.shopRating}> 5.0 (2.1 km)</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F8', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#fff', elevation: 2 },
  welcomeText: { fontSize: 18, fontWeight: 'bold', color: '#101213' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#101213' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },
  
  // Service Type Row Styles
  serviceTypeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  serviceTypeBox: { 
      backgroundColor: '#fff', 
      padding: 15, 
      borderRadius: 12, 
      alignItems: 'center', 
      flex: 1, 
      marginHorizontal: 5,
      borderWidth: 1.5,
      borderColor: '#F1F4F8'
  },
  serviceTypeBoxActive: { 
      backgroundColor: '#fff', 
      padding: 15, 
      borderRadius: 12, 
      alignItems: 'center', 
      flex: 1, 
      marginHorizontal: 5,
      borderWidth: 1.5,
      borderColor: '#4B39EF' // Active border color
  },
  serviceTypeName: { fontSize: 14, fontWeight: '600', color: '#101213', marginTop: 8 },
  
  // Shop Card Styles 
  shopCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  shopIconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF4E3', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  shopInfo: { flex: 1 },
  shopName: { fontSize: 16, fontWeight: 'bold', color: '#101213' },
  shopAddress: { fontSize: 12, color: '#57636C' },
  shopRating: { fontSize: 12, color: '#57636C', marginLeft: 4 },
});