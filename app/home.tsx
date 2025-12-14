import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// 🔗 SERVER ADDRESS - Confirm this matches your PC IP
const API_URL = 'http://192.168.18.21:3000'; 

export default function HomeScreen() {
  const router = useRouter();
  const [shops, setShops] = useState<any[]>([]);
  const [userName, setUserName] = useState('User');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Load User Name
  useEffect(() => {
    const loadData = async () => {
      const name = await AsyncStorage.getItem('user_name');
      if (name) setUserName(name);
    };
    loadData();
  }, []);

  // 2. Fetch Shops from Server
  const fetchShops = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/shops`); // We will add this route to server next
      if (response.ok) {
        const data = await response.json();
        setShops(data);
      }
    } catch (error) {
      console.log("Error fetching shops");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchShops();
    }, [fetchShops])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchShops();
  };

  const ServiceCard = ({ title, icon, color }: any) => (
    <TouchableOpacity style={styles.serviceCard}>
      <View style={[styles.iconContainer, { borderColor: color }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.serviceText, { color: color }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back,</Text>
          <Text style={styles.userText}>{userName}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/orders')}>
            <Ionicons name="receipt-outline" size={24} color="#101213" />
          </TouchableOpacity>
          {/* Profile Button - Make sure app/profile.tsx exists if you use this */}
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/profile')}> 
            <Ionicons name="person-circle-outline" size={30} color="#4B39EF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* Services */}
        <Text style={styles.sectionTitle}>Select Service Type</Text>
        <View style={styles.servicesGrid}>
          <ServiceCard title="Wash" icon="water-outline" color="#4B39EF" />
          <ServiceCard title="Iron" icon="shirt-outline" color="#FF9800" />
          <ServiceCard title="Dry Clean" icon="snow-outline" color="#009688" />
        </View>

        {/* Shops List */}
        <Text style={styles.sectionTitle}>Popular Laundry Nearby</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4B39EF" style={{marginTop: 20}} />
        ) : shops.length === 0 ? (
          <Text style={styles.emptyText}>No laundry shops found.</Text>
        ) : (
          shops.map((shop) => (
            <TouchableOpacity 
              key={shop.id} 
              style={styles.shopCard}
              // Navigate to Order Screen with Shop ID
              onPress={() => router.push({ pathname: '/order', params: { shopId: shop.id, shopName: shop.shop_name } })}
            >
              <View style={styles.shopIconBg}>
                <Ionicons name="business" size={24} color="#FF9800" />
              </View>
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{shop.shop_name || "Laundry Shop"}</Text>
                <Text style={styles.shopAddress}>📍 {shop.address || "No address provided"}</Text>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color="#FFC107" />
                    <Text style={styles.ratingText}>5.0 (2.1 km)</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F8', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  welcomeText: { fontSize: 14, color: '#57636C' },
  userText: { fontSize: 20, fontWeight: 'bold', color: '#101213' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 15 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#101213', marginBottom: 15, marginTop: 10 },
  
  servicesGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  serviceCard: { alignItems: 'center', width: '30%', backgroundColor: '#fff', padding: 10, borderRadius: 12, elevation: 2 },
  iconContainer: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  serviceText: { fontWeight: 'bold', fontSize: 14 },

  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },

  shopCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 2 },
  shopIconBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  shopInfo: { flex: 1 },
  shopName: { fontSize: 16, fontWeight: 'bold', color: '#101213' },
  shopAddress: { fontSize: 12, color: '#57636C', marginTop: 2 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 12, color: '#57636C', marginLeft: 4, fontWeight: '600' },
});