import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const API_URL = 'http://192.168.18.21:3000'; 

export default function ProviderDashboard() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [shopName, setShopName] = useState('Your Laundry Shop');
  const [notificationCount, setNotificationCount] = useState(0); 
  const [hasServices, setHasServices] = useState(true); 

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState('');

  useEffect(() => {
    const loadOwnerData = async () => {
      const id = await AsyncStorage.getItem('user_id');
      const name = await AsyncStorage.getItem('user_name'); 
      const shop_name = await AsyncStorage.getItem('shop_name'); 
      
      setOwnerId(id);
      
      if (shop_name) setShopName(shop_name); 
      else if (name) setShopName(`${name}'s Laundry`); 
    };
    loadOwnerData();
  }, []);
  
  const fetchNotificationCount = useCallback(async (id: any) => {
      if (!id) return;
      try {
          const response = await fetch(`${API_URL}/notifications/${id}`);
          const data = await response.json();
          setNotificationCount(data.count);
      } catch (error) { console.log("Error:", error); }
  }, []);
  
  const checkServices = useCallback(async (id: any) => {
      if (!id) return;
      try {
          const response = await fetch(`${API_URL}/services/${id}`);
          const data = await response.json();
          setHasServices(data.length > 0); 
      } catch (error) { setHasServices(false); }
  }, []);

  const fetchOrders = useCallback(async (id: any) => {
    if (!id) return;
    try {
      setRefreshing(true);
      const response = await fetch(`${API_URL}/orders/${id}`); 
      const data = await response.json();
      setOrders(data);
      markNotificationsAsSeen(id);
    } catch (error) { console.log("Error:", error); } 
    finally { setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => {
        if (ownerId) {
            fetchOrders(ownerId);
            fetchNotificationCount(ownerId);
            checkServices(ownerId);
        }
        return () => {}; 
  }, [ownerId, fetchOrders, fetchNotificationCount, checkServices]));
  
  const markNotificationsAsSeen = async (id: any) => {
      if (!id) return;
      try {
          await fetch(`${API_URL}/orders/seen/${id}`, { method: 'PUT' });
          setNotificationCount(0);
      } catch (error) { console.log("Error:", error); }
  };

  const onRefresh = useCallback(() => {
    if (ownerId) {
        fetchOrders(ownerId);
        fetchNotificationCount(ownerId);
        checkServices(ownerId);
    }
  }, [ownerId, fetchOrders, fetchNotificationCount, checkServices]);

  const openAcceptModal = (orderId: number) => {
      setSelectedOrderId(orderId);
      setEstimatedTime('');
      setModalVisible(true);
  };

  const confirmAcceptOrder = async () => {
      if (!estimatedTime.trim()) {
          Alert.alert("Time Required", "Please enter estimated arrival time (e.g. 30 mins)");
          return;
      }
      try {
          const response = await fetch(`${API_URL}/orders/${selectedOrderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Picked Up', estimated_time: estimatedTime })
          });
          if (response.ok) {
            setModalVisible(false);
            fetchOrders(ownerId);
          } else {
            Alert.alert("Error", "Could not update order");
          }
      } catch (error) { Alert.alert("Error", "Server connection failed"); }
  };

  const handleUpdateStatus = async (orderId: any, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchOrders(ownerId); 
        fetchNotificationCount(ownerId); 
      } else { Alert.alert("Error", "Could not update order"); }
    } catch (error) { Alert.alert("Error", "Server connection failed"); }
  };

  const renderOrderItems = (itemsString: any) => {
    try {
        const items = typeof itemsString === 'string' ? JSON.parse(itemsString) : itemsString;
        if(Array.isArray(items)) return items.map((i: any) => `${i.count}x ${i.name}`).join(', ');
        return "Laundry Items";
    } catch (e) { return "Unknown Items"; }
  };
  
  const renderActionButton = (order: any) => {
    const status = order.status || 'Pending';

    if (status === 'Pending') {
      return (
        <View style={styles.actionRow}>
           <TouchableOpacity style={styles.rejectBtn} onPress={() => handleUpdateStatus(order.id, 'Rejected')}>
              <Text style={styles.btnTextRed}>Reject</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.acceptBtn} onPress={() => openAcceptModal(order.id)}>
              <Text style={styles.btnTextWhite}>Accept & Pickup</Text>
           </TouchableOpacity>
        </View>
      );
    }
    if (status === 'Picked Up') return <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpdateStatus(order.id, 'Washing')}><Text style={styles.btnTextWhite}>Start Washing 💧</Text></TouchableOpacity>;
    if (status === 'Washing') return <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpdateStatus(order.id, 'Ironing')}><Text style={styles.btnTextWhite}>Start Ironing 🔥</Text></TouchableOpacity>;
    if (status === 'Ironing') return <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#4CAF50'}]} onPress={() => handleUpdateStatus(order.id, 'Ready')}><Text style={styles.btnTextWhite}>Mark as Ready ✅</Text></TouchableOpacity>;
    if (status === 'Ready') return <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpdateStatus(order.id, 'Delivered')}><Text style={styles.btnTextWhite}>Out for Delivery 🚚</Text></TouchableOpacity>;
    if (status === 'Delivered') return <View style={[styles.statusBadge, {backgroundColor: '#E8F5E9', marginTop: 10}]}><Text style={{color: 'green', fontWeight:'bold', textAlign:'center'}}>Order Completed 🎉</Text></View>;
    if (status === 'Rejected') return <View style={[styles.statusBadge, {backgroundColor: '#FFEBEE', marginTop: 10}]}><Text style={{color: 'red', fontWeight:'bold', textAlign:'center'}}>Order Rejected ❌</Text></View>;
    return null; 
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.shopName}>{shopName}</Text>
          <Text style={styles.statusText}>{isOnline ? '🟢 Shop is Online' : '🔴 Shop is Offline'}</Text>
        </View>
        <View style={styles.headerActions}>
            <Switch value={isOnline} onValueChange={setIsOnline} trackColor={{ false: "#767577", true: "#4B39EF" }} />
            <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/provider/profile')}>
                <Ionicons name="person" size={20} color="#fff" />
                {notificationCount > 0 && (
                    <View style={styles.notificationBadge}>
                        <Text style={styles.notificationText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {!hasServices && (
            <TouchableOpacity style={styles.warningBanner} onPress={() => router.push('/provider/services')}>
                <Ionicons name="alert-circle-outline" size={24} color="#FF6F00" />
                <View style={styles.warningTextContainer}>
                    <Text style={styles.warningTitle}>SHOP INCOMPLETE</Text>
                    <Text style={styles.warningText}>Customers cannot see your shop until you set your prices.</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FF6F00" />
            </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Active Orders</Text>

        {orders.length === 0 ? (
          <Text style={{textAlign: 'center', color: '#999', marginTop: 20}}>No orders yet.</Text>
        ) : (
          orders.map((order) => {
            // ✅ SMART FIX: Extract phone number from the combined address string
            const fullAddress = order.address || "";
            const displayAddress = fullAddress.split(" | Phone:")[0]; 
            const displayPhone = fullAddress.split(" | Phone:")[1] || order.customer_phone || "No Phone Provided";

            return (
                <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <Text style={styles.customerName}>{order.customer_name || "Customer"}</Text> 
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusTextBadge}>{order.status || 'Pending'}</Text>
                    </View>
                </View>
                
                {/* ✅ DISPLAYING EXTRACTED PHONE NUMBER */}
                <Text style={{color: '#4B39EF', fontWeight: 'bold', marginBottom: 5}}>
                    📞 Phone: {displayPhone}
                </Text>

                <Text style={styles.orderItems}>{renderOrderItems(order.items)}</Text>
                <Text style={styles.orderAddress}>📍 Pickup: {displayAddress}</Text>
                <Text style={styles.orderTime}>⏱ Time: {order.pickup_time}</Text>
                <Text style={styles.paymentMethod}>💰 Total: Rs {order.total_price}</Text>
                
                {renderActionButton(order)}
                </View>
            );
          })
        )}
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/provider/services')}>
            <Ionicons name="pricetag" size={20} color="#fff" style={{marginRight: 10}} />
            <Text style={styles.menuButtonText}>Manage Services & Prices</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL FOR ESTIMATED TIME */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Accept Order</Text>
                <Text style={styles.modalSubtitle}>When will the delivery boy arrive?</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. 20 Mins, 1 Hour" value={estimatedTime} onChangeText={setEstimatedTime} autoFocus={true} />
                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}><Text style={{color: '#666', fontWeight:'bold'}}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.modalConfirm} onPress={confirmAcceptOrder}><Text style={{color: '#fff', fontWeight:'bold'}}>Confirm & Pickup</Text></TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F8', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', elevation: 2 },
  shopName: { fontSize: 20, fontWeight: 'bold', color: '#101213' },
  statusText: { fontSize: 14, color: '#57636C', marginTop: 4 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  warningBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEA', padding: 15, borderRadius: 12, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: '#FF6F00' },
  warningTextContainer: { flex: 1, marginLeft: 10, marginRight: 10 },
  warningTitle: { fontWeight: 'bold', color: '#FF6F00', fontSize: 14 },
  warningText: { fontSize: 12, color: '#101213' },
  profileBtn: { backgroundColor: '#101213', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 15 },
  notificationBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FF5963', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  notificationText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#101213' },
  orderCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  customerName: { fontSize: 16, fontWeight: 'bold', color: '#101213', flex: 1 },
  statusBadge: { backgroundColor: '#F1F4F8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusTextBadge: { fontSize: 12, fontWeight: 'bold', color: '#4B39EF' },
  orderItems: { color: '#101213', fontWeight: '500', marginBottom: 5 },
  orderAddress: { color: '#57636C', fontSize: 12 },
  orderTime: { color: '#57636C', fontSize: 12, marginBottom: 5 },
  paymentMethod: { color: '#57636C', fontSize: 14, marginBottom: 5, fontWeight:'bold' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  rejectBtn: { flex: 1, marginRight: 10, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FF5963', alignItems: 'center' },
  acceptBtn: { flex: 1, marginLeft: 10, padding: 12, borderRadius: 8, backgroundColor: '#4B39EF', alignItems: 'center' },
  actionBtn: { width: '100%', padding: 12, borderRadius: 8, backgroundColor: '#4B39EF', alignItems: 'center', marginTop: 5 },
  btnTextRed: { color: '#FF5963', fontWeight: 'bold' },
  btnTextWhite: { color: '#fff', fontWeight: 'bold' },
  menuButton: { flexDirection: 'row', backgroundColor: '#101213', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  menuButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#101213', marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: '#57636C', marginBottom: 20 },
  modalInput: { backgroundColor: '#F1F4F8', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalCancel: { padding: 10, marginRight: 10 },
  modalConfirm: { backgroundColor: '#4B39EF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
});