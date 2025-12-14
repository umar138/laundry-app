import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react'; // Removed useEffect as we are removing the auto-redirect logic
import { Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Not needed for this behavior

export default function RoleSelectionScreen() {
  const router = useRouter();

  // Updated Function: This function now unconditionally pushes the user to the Sign Up screen
  // with the selected role parameter. 
  // It completely removes the complex AsyncStorage check and auto-redirect logic, 
  // ensuring the user always hits the Sign Up screen first.
  const handleRoleSelection = (role) => {
    // Both roles now lead directly to the Sign Up screen.
    router.push({ pathname: '/signup', params: { role } });
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Image 
          source={{ uri: 'https://img.freepik.com/free-vector/laundry-service-concept-illustration_114360-6497.jpg' }} 
          style={styles.heroImage} 
        />

        <Text style={styles.title}>Laundry Made Easy</Text>
        <Text style={styles.subtitle}>Choose how you want to use the app</Text>

        {/* Option 1: Customer -> Leads to Sign Up */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => handleRoleSelection('client')}
        >
          <View style={styles.iconBox}>
            <Ionicons name="person" size={32} color="#4B39EF" />
          </View>
          <View style={styles.textArea}>
            <Text style={styles.cardTitle}>I am a Customer</Text>
            <Text style={styles.cardDesc}>I want to book a laundry service</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        {/* Option 2: Service Provider -> Leads to Sign Up */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => handleRoleSelection('owner')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#FFF4E3' }]}>
            <Ionicons name="business" size={32} color="#FF6F00" />
          </View>
          <View style={styles.textArea}>
            <Text style={styles.cardTitle}>I am a Laundry Owner</Text>
            <Text style={styles.cardDesc}>I want to list my shop & services</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  content: { padding: 24, flex: 1, justifyContent: 'center' },
  heroImage: { width: '100%', height: 200, resizeMode: 'contain', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#101213', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#57636C', textAlign: 'center', marginBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F4F8', elevation: 2 },
  iconBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  textArea: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#101213' },
  cardDesc: { color: '#57636C', fontSize: 13, marginTop: 4 }
});