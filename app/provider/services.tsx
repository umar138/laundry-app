import React, { useCallback, useEffect, useState } from 'react';
// CRITICAL FIX: Added RefreshControl to the import list
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Alert, Platform, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 🔗 SERVER ADDRESS
const API_URL = 'http://192.168.18.21:3000'; 

export default function ServicesScreen() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState(null);
  const [services, setServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Owner ID
  useEffect(() => {
    const loadOwnerId = async () => {
      const id = await AsyncStorage.getItem('user_id');
      setOwnerId(id);
    };
    loadOwnerId();
  }, []);

  // 2. Fetch Services
  const fetchServices = useCallback(async (id) => {
    if (!id) return;
    setRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/services/${id}`);
      const data = await response.json();
      setServices(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load services.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // 3. Auto-refresh on screen focus (or when ownerId changes)
  useFocusEffect(
    useCallback(() => {
        if (ownerId) {
            fetchServices(ownerId);
        }
        return () => {};
    }, [ownerId, fetchServices])
  );

  const onRefresh = useCallback(() => {
    if (ownerId) {
      fetchServices(ownerId);
    }
  }, [ownerId, fetchServices]);


  // 4. Add/Update Services
  const handleSaveServices = async () => {
    if (!ownerId) {
      Alert.alert("Error", "Owner ID not found.");
      return;
    }

    if (services.length === 0) {
        Alert.alert("Required", "Please add at least one service before saving.");
        return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: ownerId,
          services: services,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Services updated successfully.");
        // Redirect back to dashboard after saving the initial setup
        router.replace('/provider/dashboard');
      } else {
        Alert.alert("Error", "Failed to save services on server.");
      }
    } catch (error) {
      Alert.alert("Connection Error", "Could not connect to server.");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Add New Service Locally
  const handleAddService = () => {
    const name = newServiceName.trim();
    const price = parseFloat(newServicePrice);

    if (!name || isNaN(price) || price <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid name and price.");
      return;
    }
    
    // Check for duplicates
    if (services.some(s => s.name.toLowerCase() === name.toLowerCase())) {
        Alert.alert("Duplicate", "This service already exists.");
        return;
    }

    setServices(prev => [...prev, { name, price }]);
    setNewServiceName('');
    setNewServicePrice('');
  };
  
  // 6. Remove Service Locally
  const handleRemoveService = (serviceName) => {
      setServices(prev => prev.filter(s => s.name !== serviceName));
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#101213" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Services & Prices</Text>
        <TouchableOpacity onPress={handleSaveServices} style={styles.saveBtn} disabled={isSaving}>
            <Text style={styles.saveBtnText}>{isSaving ? "Saving..." : "Save Prices"}</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* Empty State / First-Time Setup Guide */}
        {services.length === 0 && (
          <View style={styles.emptyState}>
             <Ionicons name="pricetags-outline" size={64} color="#FF6F00" />
             <Text style={styles.emptyTitle}>Welcome, New Partner!</Text>
             <Text style={styles.emptyText}>
                Before you can accept orders, please define at least one laundry service and price. 
             </Text>
          </View>
        )}


        <Text style={styles.sectionTitle}>Add New Service</Text>
        <View style={styles.inputCard}>
            <View style={styles.inputGroup}>
                <TextInput 
                    placeholder="Service Name (e.g., Shirt Wash & Iron)" 
                    style={styles.inputName} 
                    value={newServiceName}
                    onChangeText={setNewServiceName}
                />
                <TextInput 
                    placeholder="Price (Rs)" 
                    style={styles.inputPrice} 
                    keyboardType="numeric"
                    value={newServicePrice}
                    onChangeText={setNewServicePrice}
                />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddService}>
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.addBtnText}>Add Service</Text>
            </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Current Pricing ({services.length} Items)</Text>
        <View style={styles.listContainer}>
          {services.map((service, index) => (
            <View key={index} style={styles.serviceRow}>
              <View style={styles.serviceText}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>Rs {service.price}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveService(service.name)}>
                <Ionicons name="trash-outline" size={24} color="#FF5963" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F8', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#fff', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#4B39EF', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  
  content: { padding: 20, flexGrow: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#101213', marginBottom: 15, marginTop: 10 },

  // Empty State Styles
  emptyState: { alignItems: 'center', padding: 30, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FF6F0020' },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#101213', marginTop: 10 },
  emptyText: { fontSize: 14, color: '#57636C', textAlign: 'center', marginTop: 5 },

  // Input Card Styles
  inputCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 20 },
  inputGroup: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  inputName: { flex: 2, backgroundColor: '#F1F4F8', padding: 10, borderRadius: 8, marginRight: 10 },
  inputPrice: { flex: 1, backgroundColor: '#F1F4F8', padding: 10, borderRadius: 8, textAlign: 'center' },
  addBtn: { backgroundColor: '#4CAF50', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 10, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  
  // List Styles
  listContainer: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, marginBottom: 30 },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F4F8' },
  serviceText: { flexDirection: 'row', flex: 1, justifyContent: 'space-between', marginRight: 15 },
  serviceName: { fontSize: 16, fontWeight: '600', color: '#101213' },
  servicePrice: { fontSize: 16, fontWeight: 'bold', color: '#4B39EF' },
});