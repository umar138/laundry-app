import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProviderSetupScreen() {
  const router = useRouter();

  const handleFinish = () => {
    // Save details to database (later)
    router.push('/provider/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.title}>Setup Your Shop</Text>
        <Text style={styles.subtitle}>Enter details so customers can find you.</Text>

        <Text style={styles.label}>Shop Name</Text>
        <TextInput placeholder="e.g. Karachi Dry Cleaners" style={styles.input} />

        <Text style={styles.label}>Shop Address</Text>
        <TextInput placeholder="e.g. Shop 12, G-11 Markaz, Islamabad" style={styles.input} />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput placeholder="e.g. 0300-1234567" keyboardType="phone-pad" style={styles.input} />

        <Text style={styles.label}>Opening Hours</Text>
        <View style={styles.row}>
            <TextInput placeholder="9:00 AM" style={[styles.input, {flex:1, marginRight:10}]} />
            <TextInput placeholder="10:00 PM" style={[styles.input, {flex:1}]} />
        </View>

        <Text style={styles.label}>Select Services Offered</Text>
        <View style={styles.chipContainer}>
            <TouchableOpacity style={[styles.chip, styles.chipActive]}><Text style={styles.chipTextActive}>Washing</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>Ironing</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>Dry Clean</Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleFinish}>
            <Text style={styles.btnText}>Launch Shop 🚀</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#57636C', marginBottom: 30 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#F1F4F8', padding: 15, borderRadius: 10, marginBottom: 10 },
  row: { flexDirection: 'row' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 30 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0', marginRight: 10, marginBottom: 10 },
  chipActive: { backgroundColor: '#4B39EF', borderColor: '#4B39EF' },
  chipText: { color: '#57636C' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  btn: { backgroundColor: '#101213', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});