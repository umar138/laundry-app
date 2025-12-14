import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 🔗 SERVER ADDRESS - UPDATE YOUR IP HERE!
const API_URL = 'http://192.168.18.21:3000'; 

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const totalAmount = params.total || '0';
  
  // Get all necessary data from previous screens
  const deliveryAddress = params.address || '';
  const pickupTime = params.pickupTime || '';
  const selectedShopId = params.selectedShopId; // GET SHOP ID
  
  let orderItems = [];
  try {
     orderItems = params.items ? JSON.parse(params.items) : [{name: 'Mixed Order', count: 1}];
  } catch (e) {
     orderItems = [{name: 'Mixed Order', count: 1}];
  }

  const [selectedMethod, setSelectedMethod] = useState('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');

  // Load User Data
  useEffect(() => {
    const loadUser = async () => {
      const id = await AsyncStorage.getItem('user_id');
      const name = await AsyncStorage.getItem('user_name');
      setUserId(id);
      setUserName(name || 'Guest Customer');
    };
    loadUser();
  }, []);

  const handlePay = async () => {
    if (!userId) {
        Alert.alert("Error", "You are not logged in!");
        return;
    }
    if (!selectedShopId) {
        Alert.alert("Error", "Shop ID missing. Order cannot be placed.");
        return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        client_id: userId,
        owner_id: selectedShopId, // SEND SHOP ID
        customer_name: userName,
        items: orderItems,
        total_price: totalAmount,
        payment_method: selectedMethod,
        address: deliveryAddress,
        pickup_time: pickupTime
      };

      // Send to Server
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        router.push('/success');
      } else {
        const data = await response.json();
        Alert.alert("Error Placing Order", data.error || "Could not place order (Server Error)");
      }

    } catch (error) {
      Alert.alert("Connection Error", "Server connection failed. Check your IP/WiFi.");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#101213" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Total to Pay</Text>
        <Text style={styles.price}>Rs {totalAmount}</Text>
        
        <Text style={styles.detailLabel}>Pickup Address:</Text>
        <Text style={styles.detailValue}>{deliveryAddress}</Text>

        <Text style={styles.detailLabel}>Pickup Time:</Text>
        <Text style={styles.detailValue}>{pickupTime}</Text>

        <Text style={styles.label}>Select Payment Option</Text>

        {['easypaisa', 'jazzcash', 'cod'].map((method) => (
            <TouchableOpacity 
              key={method}
              style={[styles.option, selectedMethod === method && styles.selectedOption]} 
              onPress={() => setSelectedMethod(method)}
            >
              <Text style={styles.optionText}>{method.toUpperCase()}</Text>
              {selectedMethod === method && <Ionicons name="checkmark-circle" size={24} color="#4B39EF" />}
            </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={isLoading}>
            <Text style={styles.payText}>{isLoading ? "Processing..." : `Pay Rs ${totalAmount}`}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F8', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 14, color: '#57636C' },
  price: { fontSize: 32, fontWeight: 'bold', color: '#4B39EF', marginBottom: 30 },
  detailLabel: { fontSize: 14, color: '#57636C', marginTop: 10 },
  detailValue: { fontSize: 16, fontWeight: '600', color: '#101213', marginBottom: 15 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },
  option: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderRadius: 12, marginBottom: 10, backgroundColor: '#fff' },
  selectedOption: { borderWidth: 1, borderColor: '#4B39EF', backgroundColor: '#F2F1FF' },
  optionText: { fontSize: 16, fontWeight: '500', color: '#101213' },
  footer: { padding: 20, backgroundColor: '#fff' },
  payBtn: { backgroundColor: '#101213', padding: 18, borderRadius: 30, alignItems: 'center' },
  payText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});