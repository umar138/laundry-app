import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_URL = 'http://192.168.18.21:3000'; 

// ... (getProgress, getStatusColor, getStatusLabel functions remain same as previous) ...
const getProgress = (status: string) => {
    switch (status) {
        case 'Pending': return 10;
        case 'Picked Up': return 30;
        case 'Washing': return 50;
        case 'Ironing': return 70;
        case 'Ready': return 90;
        case 'Delivered': return 100;
        default: return 5;
    }
};

const getStatusColor = (status: string) => {
    if (status === 'Delivered') return '#4CAF50';
    if (status === 'Ready') return '#FFA000';
    if (status === 'Rejected') return '#FF5963';
    return '#4B39EF';
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'Pending': return 'Waiting for shop approval ⏳';
        case 'Picked Up': return 'Clothes picked up 🚕';
        case 'Washing': return 'Washing in Progress 🧺';
        case 'Ironing': return 'Ironing Your Clothes 👕';
        case 'Ready': return 'Ready for Delivery 📦';
        case 'Delivered': return 'Delivered Successfully 🚚';
        case 'Rejected': return 'Order Rejected ❌';
        default: return 'Processing Order...';
    }
};

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    const loadUser = async () => {
        const id = await AsyncStorage.getItem('user_id');
        if(id) setCurrentUserId(id);
    };
    loadUser();
  }, []);

  const renderOrderItems = (items: any) => {
    try {
        const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
        if (Array.isArray(parsedItems)) {
             return parsedItems.map((i: any) => `${i.count}x ${i.name}`).join(', ');
        }
        return "Laundry Items";
    } catch (e) { return "Laundry Items"; }
  };

  const fetchMyOrders = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_URL}/orders`); 
      if (!response.ok) return; 
      const data = await response.json();
      if (Array.isArray(data)) setOrders(data.reverse()); 
    } catch (error) { console.log("Error:", error); } 
    finally { setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchMyOrders(); }, [fetchMyOrders]));
  const onRefresh = useCallback(() => { fetchMyOrders(); }, [fetchMyOrders]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#101213" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track My Orders</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
             <Ionicons name="basket-outline" size={80} color="#ccc" />
             <Text style={styles.emptyText}>No orders found.</Text>
          </View>
        ) : (
          orders.map((order, index) => {
            const currentStatus = order.status || 'Pending';
            const progress = getProgress(currentStatus);
            const statusColor = getStatusColor(currentStatus); 
            const trackingText = getStatusLabel(currentStatus);
            // ✅ GET ESTIMATED TIME FROM SERVER
            const estimatedTime = order.estimated_time; 

            return (
              <View key={order.id || index} style={styles.orderCard}>
                
                <View style={styles.orderHeader}>
                  <Text style={styles.date}>{order.date ? new Date(order.date).toDateString() : "Recent Order"}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>{currentStatus}</Text>
                  </View>
                </View>
                
                <Text style={styles.items}>{renderOrderItems(order.items)}</Text>
                
                {/* ✅ NEW: ESTIMATED TIME ALERT */}
                {estimatedTime && (currentStatus !== 'Delivered') && (
                    <View style={styles.timeAlert}>
                        <Ionicons name="alarm-outline" size={20} color="#D32F2F" />
                        <Text style={styles.timeAlertText}>
                            Delivery Boy arriving in: <Text style={{fontWeight: 'bold'}}>{estimatedTime}</Text>
                        </Text>
                    </View>
                )}

                <View style={styles.trackingSection}>
                    <Text style={styles.trackingLabel}>{trackingText}</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: statusColor }]} />
                    </View>
                </View>
                
                <View style={styles.divider} />
                <View style={styles.footer}>
                    <Text style={styles.shopDetail}>Shop ID: {order.owner_id}</Text>
                    <Text style={styles.price}>Rs {order.total_price}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#101213' },
  content: { padding: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#57636C', marginTop: 20 },
  orderCard: { backgroundColor: '#fff', borderRadius: 16, padding: 15, marginBottom: 20, elevation: 3 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  date: { color: '#57636C', fontSize: 12, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontWeight: 'bold', fontSize: 12 },
  items: { fontSize: 16, fontWeight: '600', color: '#101213', marginBottom: 15 },
  
  // ✅ New Time Alert Style
  timeAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', padding: 10, borderRadius: 8, marginBottom: 15 },
  timeAlertText: { color: '#D32F2F', marginLeft: 8, fontSize: 14 },

  trackingSection: { marginBottom: 15, backgroundColor: '#F8F9FA', padding: 12, borderRadius: 10 },
  trackingLabel: { fontSize: 15, color: '#101213', marginBottom: 8, fontWeight: 'bold' },
  progressBarBg: { height: 10, backgroundColor: '#E0E0E0', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  divider: { height: 1, backgroundColor: '#F1F4F8', marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shopDetail: { fontSize: 12, color: '#999' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#4B39EF' },
});