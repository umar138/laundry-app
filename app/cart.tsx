import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CartScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 

  let cartItems = [];
  try {
    cartItems = params.data ? JSON.parse(params.data) : [];
  } catch (e) {
    cartItems = [];
  }

  const serviceType = params.serviceType || 'Wash & Fold';
  const isExpress = params.isExpress === 'true';
  const finalPreTaxTotal = params.total ? parseFloat(params.total) : 0; 
  const selectedShopId = params.selectedShopId; // GET SHOP ID
  
  const tax = finalPreTaxTotal * 0.05; 
  const total = finalPreTaxTotal + tax;

  const [deliveryAddress, setDeliveryAddress] = useState('D-123, Sector F-11, Islamabad');
  const [pickupTime, setPickupTime] = useState('Today, 5:00 PM - 7:00 PM'); 

  const handleCheckout = () => {
    if (!deliveryAddress || !pickupTime) {
        Alert.alert("Missing Details", "Please enter a delivery address and preferred pickup time.");
        return;
    }
    if (!selectedShopId) {
        Alert.alert("Error", "Shop ID missing. Cannot proceed.");
        return;
    }
    
    // Send all data to the payment page
    router.push({
      pathname: '/payment',
      params: { 
          total: total.toFixed(2),
          items: JSON.stringify(cartItems),
          address: deliveryAddress,
          pickupTime: pickupTime,
          serviceType: serviceType, 
          isExpress: isExpress ? 'true' : 'false',
          selectedShopId: selectedShopId, 
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#101213" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{width: 24}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup & Delivery Details</Text>
            
            <Text style={styles.inputLabel}>Pickup/Delivery Address</Text>
            <TextInput
                style={styles.input}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="Enter Address (e.g., House no, Street, City)"
            />

            <Text style={styles.inputLabel}>Preferred Pickup Time</Text>
            <TextInput
                style={styles.input}
                value={pickupTime}
                onChangeText={setPickupTime}
                placeholder="e.g., Today, 5:00 PM - 7:00 PM"
            />
        </View>
        
        <View style={styles.section}>
             <Text style={styles.sectionTitle}>Service Options</Text>
             <View style={styles.row}>
                <Text style={styles.label}>Service Type</Text>
                <Text style={styles.value}>{serviceType}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Express Service</Text>
                <Text style={[styles.value, isExpress && {color: '#FF6F00', fontWeight: 'bold'}]}>
                    {isExpress ? 'Yes (+25%)' : 'No'}
                </Text>
            </View>
        </View>


        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items Selected</Text>
            
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <View key={index} style={styles.row}>
                    <Text style={styles.qty}>{item.count} x</Text>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.price}>Rs {(item.price * item.count).toFixed(0)}</Text> 
                </View>
              ))
            ) : (
              <Text style={{color: '#999'}}>No items selected</Text>
            )}
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Breakdown</Text>
            <View style={styles.row}>
                <Text style={styles.label}>Calculated Item Total</Text>
                <Text style={styles.value}>Rs {finalPreTaxTotal.toFixed(0)}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Sales Tax (5%)</Text>
                <Text style={styles.value}>Rs {tax.toFixed(0)}</Text>
            </View>
            <View style={[styles.row, {marginTop: 10}]}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>Rs {total.toFixed(0)}</Text>
            </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Proceed to Payment</Text>
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
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#101213' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#101213', marginTop: 10, marginBottom: 5 },
  input: { 
      backgroundColor: '#F7F7F7', 
      borderRadius: 8, 
      padding: 10, 
      fontSize: 16, 
      borderWidth: 1,
      borderColor: '#E0E0E0',
      marginBottom: 10
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  qty: { color: '#4B39EF', fontWeight: 'bold', width: 30 },
  itemName: { flex: 1, color: '#101213' },
  price: { color: '#101213', fontWeight: '600' },
  label: { color: '#57636C' },
  value: { color: '#101213', fontWeight: '500' },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#101213' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#4B39EF' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  checkoutButton: { backgroundColor: '#4B39EF', padding: 16, borderRadius: 30, alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});