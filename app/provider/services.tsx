import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// ✅ CORRECT SERVER IP
const API_URL = 'http://192.168.18.21:3000'; 

export default function ServicesScreen() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  // Add Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    const load = async () => {
        const id = await AsyncStorage.getItem('user_id');
        setOwnerId(id);
        fetchServices(id);
    };
    load();
  }, []);

  const fetchServices = async (id: any) => {
    try {
        const response = await fetch(`${API_URL}/services/${id}`);
        const data = await response.json();
        setServices(data);
    } catch (e) {
        console.log("Error loading services");
    } finally {
        setLoading(false);
    }
  };

  const handleAddService = async () => {
    if(!newName || !newPrice) return Alert.alert("Error", "Enter name and price");

    try {
        const response = await fetch(`${API_URL}/services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                owner_id: ownerId,
                name: newName,
                price: parseFloat(newPrice)
            })
        });

        if(response.ok) {
            setModalVisible(false);
            setNewName('');
            setNewPrice('');
            fetchServices(ownerId);
        }
    } catch(e) {
        Alert.alert("Error", "Could not add service");
    }
  };

  const handleDelete = async (id: number) => {
      try {
          await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
          fetchServices(ownerId);
      } catch(e) {
          Alert.alert("Error", "Could not delete");
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#101213" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Services</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
             <Ionicons name="add-circle" size={30} color="#4B39EF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? <ActivityIndicator size="large" color="#4B39EF" /> : 
         services.length === 0 ? (
             <Text style={styles.emptyText}>No services added yet. Tap + to add.</Text>
         ) : (
             services.map((item, index) => (
                 <View key={index} style={styles.card}>
                     <View>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.price}>Rs {item.price}</Text>
                     </View>
                     <TouchableOpacity onPress={() => handleDelete(item.id)}>
                         <Ionicons name="trash-outline" size={24} color="#FF5963" />
                     </TouchableOpacity>
                 </View>
             ))
         )
        }
      </ScrollView>

      {/* ADD SERVICE MODAL */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add New Service</Text>
                
                <TextInput placeholder="Service Name (e.g. Shirt Wash)" style={styles.input} value={newName} onChangeText={setNewName} />
                <TextInput placeholder="Price (e.g. 150)" style={styles.input} value={newPrice} onChangeText={setNewPrice} keyboardType="numeric" />

                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                        <Text style={{fontWeight: 'bold', color: '#666'}}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalAdd} onPress={handleAddService}>
                        <Text style={{fontWeight: 'bold', color: '#fff'}}>Add Service</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F4F8', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#101213' },
  price: { fontSize: 14, color: '#4B39EF', fontWeight: '600' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#F1F4F8', borderRadius: 8, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  modalCancel: { padding: 10, marginRight: 10 },
  modalAdd: { backgroundColor: '#4B39EF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
});