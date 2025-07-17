import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

const STORAGE_KEY = 'drinks_data';

export default function TotalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [drinks, setDrinks] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (params.data) {
      const data = JSON.parse(params.data as string);
      const filtered = data.filter((d: any) => d.count > 0);
      setDrinks(filtered);
      const totalSum = filtered.reduce((acc: number, d: any) => acc + d.count * d.price, 0);
      setTotal(totalSum);
    }
  }, [params.data]);

  const resetCountsAndGoBack = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (!saved) {
        router.back();
        return;
      }
      const allDrinks = JSON.parse(saved);
      const resetDrinks = allDrinks.map((d: any) => ({ ...d, count: 0 }));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resetDrinks));
      router.back();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de réinitialiser les compteurs');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Résumé de la commande</Text>
      {drinks.length === 0 ? (
        <Text style={styles.empty}>Aucune boisson sélectionnée.</Text>
      ) : (
        <FlatList
          data={drinks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.detail}>
                {item.count} × {item.price.toFixed(2).replace('.', ',')} €
              </Text>
              <Text style={styles.subtotal}>
                {(item.count * item.price).toFixed(2).replace('.', ',')} €
              </Text>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.totalText}>Total : {total.toFixed(2).replace('.', ',')} €</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.button} onPress={resetCountsAndGoBack}>
        <Text style={styles.buttonText}>Revenir et réinitialiser</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  empty: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  name: {
    flex: 2,
    fontSize: 16,
  },
  detail: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
  },
  subtotal: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  footer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 15,
  },
  totalText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 25,
    marginHorizontal: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  
});
