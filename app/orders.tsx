import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react'; // FIXED: Removed 'React' from the imports
import { Platform, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 🔗 SERVER ADDRESS - UPDATE YOUR IP HERE!
const API_URL = 'http://192.168.18.21:3000'; 

// --- Helper function to determine the visual progress ---
const getProgress = (status) => {
    switch (status) {
        case 'Pending':
            return 5;
        case 'Picked Up':
            return 20;
        case 'Washing':
            return 40;
        case 'Ironing':
            return 60;
        case 'Ready':
            return 80;
        case 'Delivered':
            return 100;
        case 'Rejected':
            return 100; 
        default:
            return 5;
    }
};

// Helper for Status Color
const getStatusColor = (status) => {
    if (status === 'Delivered') return '#4CAF50'; 
    if (status === 'Rejected') return '#FF5963'; 
    if (status === 'Ready') return '#FFA000'; 
    return '#4B39EF'; 
};


export default function MyOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  // 1. Get Logged In User ID 
  useEffect(() => {
    const loadUser = async () => {
        const id = await AsyncStorage.getItem('user_id');
        setUserId(id);
    };
    loadUser();
  }, []);

  // 2. Fetch Orders & Filter for this User (Use useCallback for optimized refresh)
  const fetchMyOrders = useCallback(async (id) => {
    if (!id) return;
    try {
      setRefreshing(true);
      // NOTE: We fetch all orders using a placeholder ownerId (1) 
      const response = await fetch(`${API_URL}/orders/1`); 
      const data = await response.json();
      
      // CRITICAL: Filter to show only orders belonging to THIS customer ID
      const myOrders = data.filter(order => order.client_id == id);
      setOrders(myOrders);
    } catch (error) {
      console.log("Error fetching orders:", error);
    } finally {
        setRefreshing(false);
    }
  }, []);

  // 3. CRITICAL FIX: Fetch orders every time the screen is focused (opened)
  useFocusEffect(
    useCallback(() => {
        if (userId) {
            fetchMyOrders(userId);
        }
        return () => {}; 
    }, [userId, fetchMyOrders])
  );
  
  // 4. Pull-to-Refresh
  const onRefresh = useCallback(() => {
    if (userId) {
        fetchMyOrders(userId);
    }
  }, [userId, fetchMyOrders]);

  // Helper to Render Items
  const renderOrderItems = (itemsString) => {
    try {
        const items = JSON.parse(itemsString);
        return items.map(i => `${i.count}x ${i.name}`).join(', ');
    } catch (e) { return "Unknown Items"; }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#101213" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {orders.length === 0 ? (
          <View style={{alignItems: 'center', marginTop: 50}}>
             <Ionicons name="basket-outline" size={64} color="#ccc" />
             <Text style={{color: '#999', marginTop: 10}}>No active orders</Text>
          </View>
        ) : (
          orders.map((order) => {
            const progress = getProgress(order.status);
            const statusColor = getStatusColor(order.status);

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.date}>{new Date(order.date).toDateString()}</Text>
                  <Text style={[styles.status, { color: statusColor }]}>
                      {order.status || 'Pending'}
                  </Text>
                </View>
                
                <Text style={styles.items}>{renderOrderItems(order.items)}</Text>
                <Text style={styles.shopDetail}>Shop ID: {order.owner_id}</Text>
                
                <View style={styles.divider} />
                
                <View style={styles.footer}>
                    <Text style={styles.priceLabel}>Total Amount</Text>
                    <Text style={styles.price}>Rs {order.total_price}</Text>
                </View>

                {/* VISUAL STATUS BAR */}
                <View style={styles.statusBarContainer}>
                   <View style={[
                      styles.statusBar, 
                      { 
                         width: `${progress}%`,
                         backgroundColor: statusColor 
                      }
                   ]} />
                </View>

              </View>
            );
          })
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F8', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  orderCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  date: { color: '#57636C', fontSize: 12 },
  status: { fontWeight: 'bold', fontSize: 14 },
  items: { fontSize: 16, fontWeight: '500', color: '#101213', marginBottom: 5 },
  shopDetail: { fontSize: 12, color: '#57636C' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { color: '#57636C' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#4B39EF' },
  
  statusBarContainer: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, marginTop: 15, overflow: 'hidden' },
  statusBar: { height: '100%', borderRadius: 3 }
});