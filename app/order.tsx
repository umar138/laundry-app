import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 🔗 SERVER ADDRESS
const API_URL = 'http://192.168.18.21:3000'; 

// --- Helper: Get Icon Name based on service name ---
const getIconName = (serviceName) => {
    const lowerName = serviceName.toLowerCase();
    if (lowerName.includes('shirt') || lowerName.includes('top')) return 'shirt-outline';
    if (lowerName.includes('pant') || lowerName.includes('jeans')) return 'accessibility-outline';
    if (lowerName.includes('suit') || lowerName.includes('coat')) return 'business-outline';
    if (lowerName.includes('bed') || lowerName.includes('linen')) return 'bed-outline';
    if (lowerName.includes('towel') || lowerName.includes('wash')) return 'water-outline';
    return 'basket-outline'; // Default icon
};


export default function OrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const shopId = params.shopId;
  const shopName = params.shopName;
  const serviceType = params.serviceType || 'General Laundry'; // CRITICAL: Read the selected service type

  const [services, setServices] = useState([]);
  const [cart, setCart] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // 1. Fetch Services & User Data on Load
  useEffect(() => {
    const loadData = async () => {
      // Fetch user name and address from storage for pre-filling order form
      setClientName(await AsyncStorage.getItem('user_name') || '');
      setClientAddress(await AsyncStorage.getItem('address') || '');

      if (shopId) {
        try {
          const response = await fetch(`${API_URL}/services/${shopId}`);
          const data = await response.json();
          setServices(data);
        } catch (error) {
          Alert.alert("Error", "Could not load services for this shop.");
        }
      }
    };
    loadData();
  }, [shopId]);
  
  // 2. Calculate Total Price
  useEffect(() => {
    let newTotal = 0;
    Object.keys(cart).forEach(serviceName => {
      const service = services.find(s => s.name === serviceName);
      if (service) {
        newTotal += cart[serviceName] * service.price;
      }
    });
    setTotalPrice(newTotal);
  }, [cart, services]);

  // 3. Add/Remove Item to Cart
  const updateCart = (serviceName, change) => {
    setCart(prevCart => {
      const newCount = (prevCart[serviceName] || 0) + change;
      if (newCount <= 0) {
        const { [serviceName]: _, ...rest } = prevCart;
        return rest;
      }
      return { ...prevCart, [serviceName]: newCount };
    });
  };

  // 4. Place Order
  const handlePlaceOrder = async () => {
    const client_id = await AsyncStorage.getItem('user_id');
    const customer_name = clientName;
    
    if (!client_id || !customer_name || !clientAddress || Object.keys(cart).length === 0) {
      Alert.alert("Missing Info", "Please select items and provide your details.");
      return;
    }

    const orderItems = Object.keys(cart).map(name => ({
        name: name,
        count: cart[name]
    }));

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: client_id,
          owner_id: shopId,
          customer_name: customer_name,
          items: orderItems,
          total_price: totalPrice,
          payment_method: 'Cash on Delivery', 
          address: clientAddress,
          pickup_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        }),
      });

      if (response.ok) {
        router.push({ pathname: '/success', params: { orderId: (await response.json()).orderId } });
        setCart({}); // Clear cart after success
      } else {
        Alert.alert("Order Failed", "Could not place order. Try again.");
      }
    } catch (error) {
      Alert.alert("Connection Error", "Server is unreachable. Please try later.");
    }
  };


  // --- Render Item Row with Icon ---
  const ServiceItem = ({ service }) => {
    const count = cart[service.name] || 0;
    const iconName = getIconName(service.name);

    return (
        <View style={styles.serviceRow}>
            <Ionicons name={iconName} size={28} color="#101213" style={{marginRight: 10}} />
            <View style={styles.serviceDetails}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>Rs {service.price}</Text>
            </View>
            <View style={styles.counter}>
                <TouchableOpacity onPress={() => updateCart(service.name, -1)} style={styles.counterBtn}>
                    <Text style={styles.counterText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{count}</Text>
                <TouchableOpacity onPress={() => updateCart(service.name, 1)} style={styles.counterBtn}>
                    <Text style={styles.counterText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#101213" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order from {shopName}</Text>
        <View style={{width: 24}} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.serviceTypeHeader}>
             Service Type Selected: <Text style={styles.serviceTypeHighlight}>{serviceType}</Text>
        </Text>

        <Text style={styles.sectionTitle}>1. Select Specific Items</Text>
        <View style={styles.servicesContainer}>
          {services.length === 0 ? (
            <Text style={{textAlign: 'center', color: '#999'}}>
                {shopName} has not listed services yet.
            </Text>
          ) : (
            services.map((service, index) => (
              <ServiceItem key={index} service={service} />
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>2. Pickup Details</Text>
        
        <View style={styles.inputCard}>
            <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput 
                    placeholder="Your Name" 
                    style={styles.input} 
                    value={clientName}
                    onChangeText={setClientName}
                />
            </View>
            <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput 
                    placeholder="Pickup Address" 
                    style={styles.input} 
                    value={clientAddress}
                    onChangeText={setClientAddress}
                />
            </View>
        </View>


      </ScrollView>

      {/* Footer / Cart Summary */}
      <View style={styles.footer}>
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Total ({Object.keys(cart).length} Items)</Text>
          <Text style={styles.summaryPrice}>Rs {totalPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.orderBtn} 
          onPress={handlePlaceOrder} 
          disabled={Object.keys(cart).length === 0 || services.length === 0}
        >
          <Text style={styles.orderBtnText}>Place Order (Cash on Delivery)</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F8', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 100 },
  
  serviceTypeHeader: { 
      fontSize: 16, 
      color: '#57636C', 
      marginBottom: 10,
      textAlign: 'center'
  },
  serviceTypeHighlight: { 
      fontWeight: 'bold', 
      color: '#4B39EF' 
  },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#101213', marginBottom: 15, marginTop: 10 },
  
  servicesContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 20 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F4F8' },
  serviceDetails: { flex: 1, marginLeft: 5 },
  serviceName: { fontSize: 16, fontWeight: '600', color: '#101213' },
  servicePrice: { fontSize: 14, color: '#57636C' },
  
  counter: { flexDirection: 'row', alignItems: 'center' },
  counterBtn: { backgroundColor: '#F1F4F8', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  counterText: { fontSize: 18, fontWeight: 'bold', color: '#101213' },
  counterValue: { marginHorizontal: 10, fontSize: 16, fontWeight: '600' },

  inputCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F4F8', borderRadius: 12, marginBottom: 10, paddingHorizontal: 15, height: 50 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', color: '#101213' },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  summary: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#57636C' },
  summaryPrice: { fontSize: 20, fontWeight: 'bold', color: '#4B39EF' },
  orderBtn: { backgroundColor: '#4B39EF', borderRadius: 30, height: 50, justifyContent: 'center', alignItems: 'center' },
  orderBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});