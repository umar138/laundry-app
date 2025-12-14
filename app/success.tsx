import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SuccessScreen() {
  const router = useRouter();

  const handleDone = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Ionicons name="checkmark-circle-outline" size={150} color="#4CAF50" />
        
        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>
          Your laundry request has been submitted. You can track its status in the "My Orders" section.
        </Text>

        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#101213', marginTop: 30, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#57636C', textAlign: 'center', marginBottom: 50 },
  doneBtn: { backgroundColor: '#4B39EF', borderRadius: 30, height: 50, width: '100%', justifyContent: 'center', alignItems: 'center' },
  doneText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});