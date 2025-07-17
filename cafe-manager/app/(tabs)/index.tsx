import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STORAGE_KEY = 'drinks_data';

const drinkIcons = [
  'glass-wine',
  'beer',
  'cup',
  'bottle-soda-classic',
  'glass-cocktail',
  'coffee',
  'glass-mug',
  'glass-champagne',
  'glass-cider',
];

// Convertit string prix "5,50" en float 5.5
const parsePrice = (text: string) => {
  if (!text) return 0;
  const clean = text.replace(',', '.');
  const val = parseFloat(clean);
  return isNaN(val) || val < 0 ? 0 : val;
};

// Données initiales avec priceInput créé à partir de price et icône fixe (toujours glass-wine)
const defaultDrinksRaw = [
  { id: '1', name: 'Air', price: 0, count: 0 },
  { id: '2', name: 'Coca', price: 2, count: 0 },
  { id: '3', name: 'Coca 0', price: 2, count: 0 },
  { id: '4', name: 'Coca Citron', price: 2.5, count: 0 },
  { id: '5', name: 'Leffe', price: 3, count: 0 },
  { id: '6', name: 'Jupiler', price: 3, count: 0 },
  { id: '7', name: 'Bière rubis', price: 3.5, count: 0 },
  { id: '8', name: 'Orangina', price: 2.5, count: 0 },
  { id: '9', name: 'Sprite', price: 2, count: 0 },
];

const defaultDrinks = defaultDrinksRaw.map((d) => ({
  ...d,
  priceInput: d.price.toFixed(2).replace('.', ','),
  icon: 'glass-wine', // icône FIXE pour tous, même ceux existants
}));

export default function HomeScreen() {
  const [drinks, setDrinks] = useState(defaultDrinks);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Remet priceInput et icône fixe
          const fixed = parsed.map((d: any) => ({
            ...d,
            priceInput: d.priceInput ?? (d.price ? d.price.toFixed(2).replace('.', ',') : '0,00'),
            icon: 'glass-wine',
          }));
          setDrinks(fixed);
        }
      } catch (e) {
        console.log('Erreur chargement storage:', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const toSave = drinks.map(({ priceInput, ...rest }) => ({
          ...rest,
          price: parsePrice(priceInput),
        }));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (e) {
        console.log('Erreur sauvegarde storage:', e);
      }
    })();
  }, [drinks]);

  const updateDrink = (index: number, key: 'name' | 'priceInput' | 'count' | 'icon', value: any) => {
    const updated = [...drinks];
    updated[index] = { ...updated[index], [key]: value };
    setDrinks(updated);
  };

  const increment = (index: number) => updateDrink(index, 'count', drinks[index].count + 1);
  const decrement = (index: number) => updateDrink(index, 'count', Math.max(0, drinks[index].count - 1));

  const addDrink = () => {
    const newDrink = {
      id: Date.now().toString(),
      name: 'Nouvelle Boisson',
      price: 0,
      priceInput: '0,00',
      count: 0,
      icon: 'glass-wine', // TOUJOURS la même icône fixée
    };
    setDrinks([...drinks, newDrink]);
  };

  // Fonction pour réinitialiser counts et prixInput à 0
  const resetDrinks = () => {
    const reset = drinks.map((d) => ({
      ...d,
      count: 0,
      priceInput: d.price ? d.price.toFixed(2).replace('.', ',') : '0,00',
    }));
    setDrinks(reset);
  };

  const goToTotal = () => {
    router.push({
      pathname: '/total',
      params: { data: JSON.stringify(drinks) },
    });
  };

  // Gestion stricte de la saisie prix avec virgule, sans enlever la virgule
  const onPriceChange = (text: string, index: number) => {
    // Autorise chiffres, max une virgule, max 2 décimales après virgule
    // On autorise aussi chaîne vide pour effacer
    if (
      text === '' ||
      /^[0-9]{0,3}(,[0-9]{0,2})?$/.test(text)
    ) {
      updateDrink(index, 'priceInput', text);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <FlatList
          data={drinks}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <MaterialCommunityIcons
                name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={48}
                color="#007AFF"
                style={{ marginBottom: 10 }}
              />
              <TextInput
                style={styles.nameInput}
                value={item.name}
                onChangeText={(text) => updateDrink(index, 'name', text)}
                placeholder="Nom"
                maxLength={15}
                textAlign="center"
              />
              <TextInput
                style={styles.priceInput}
                value={item.priceInput}
                keyboardType="decimal-pad"
                onChangeText={(text) => onPriceChange(text, index)}
                placeholder="Prix €"
                textAlign="center"
                maxLength={6} // max "999,99"
              />
              <View style={styles.counter}>
                <TouchableOpacity style={styles.btnCircle} onPress={() => decrement(index)}>
                  <Text style={styles.btnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.count}>{item.count}</Text>
                <TouchableOpacity style={styles.btnCircle} onPress={() => increment(index)}>
                  <Text style={styles.btnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={
            <>
              <TouchableOpacity style={styles.addButton} onPress={addDrink}>
                <Text style={styles.addButtonText}>+ Ajouter un verre</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.totalButton} onPress={goToTotal}>
                <Text style={styles.totalButtonText}>Voir Résultat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetButton} onPress={resetDrinks}>
                <Text style={styles.resetButtonText}>Réinitialiser</Text>
              </TouchableOpacity>
            </>
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nameInput: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    fontSize: 16,
    marginBottom: 6,
    paddingVertical: 4,
  },
  priceInput: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    fontSize: 14,
    marginBottom: 8,
    paddingVertical: 4,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnCircle: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  count: {
    marginHorizontal: 12,
    fontSize: 18,
    minWidth: 24,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#28a745',
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 12,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  totalButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 8,
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 12,
  },
  totalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#dc3545',
    marginHorizontal: 8,
    paddingVertical: 14,
    borderRadius: 25,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
});
