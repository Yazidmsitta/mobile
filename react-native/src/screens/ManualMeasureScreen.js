import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { calculateFromDiameter, calculateFromCircumference, calculateFromUsSize, calculateFromEuSize } from '../utils/measurementCalculator';
import { measurementsAPI, productsAPI } from '../services/api';

export default function ManualMeasureScreen({ route, navigation }) {
  const { type = 'ring' } = route.params || {};
  const [inputMethod, setInputMethod] = useState('diameter'); // 'diameter', 'circumference', 'usSize', 'euSize'
  const [diameter, setDiameter] = useState('');
  const [circumference, setCircumference] = useState('');
  const [usSize, setUsSize] = useState('');
  const [euSize, setEuSize] = useState('');
  const [result, setResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const calculate = () => {
    let measurement;
    
    try {
      switch (inputMethod) {
        case 'diameter':
          if (!diameter || parseFloat(diameter) <= 0) {
            Alert.alert('Erreur', 'Veuillez entrer un diamètre valide');
            return;
          }
          measurement = calculateFromDiameter(parseFloat(diameter));
          break;
        case 'circumference':
          if (!circumference || parseFloat(circumference) <= 0) {
            Alert.alert('Erreur', 'Veuillez entrer une circonférence valide');
            return;
          }
          measurement = calculateFromCircumference(parseFloat(circumference));
          break;
        case 'usSize':
          if (!usSize || parseFloat(usSize) <= 0) {
            Alert.alert('Erreur', 'Veuillez entrer une taille US valide');
            return;
          }
          measurement = calculateFromUsSize(parseFloat(usSize));
          break;
        case 'euSize':
          if (!euSize || parseFloat(euSize) <= 0) {
            Alert.alert('Erreur', 'Veuillez entrer une taille EU valide');
            return;
          }
          measurement = calculateFromEuSize(parseFloat(euSize));
          break;
        default:
          return;
      }
      
      setResult(measurement);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const saveMeasurement = async () => {
    if (!result) {
      Alert.alert('Erreur', 'Veuillez d\'abord calculer la mesure');
      return;
    }

    setIsSaving(true);
    try {
      // Convert type to uppercase and map to valid values
      const typeMapping = {
        'ring': 'RING',
        'bracelet': 'BRACELET',
        'finger': 'FINGER',
      };
      const apiType = typeMapping[type.toLowerCase()] || 'RING';
      
      await measurementsAPI.create({
        name: `${type === 'ring' ? 'Bague' : 'Bracelet'} - ${new Date().toLocaleDateString()}`,
        type: apiType,
        diameter_mm: result.diameterMm,
        circumference_mm: result.circumferenceMm,
        size_eu: result.sizeEu,
        size_us: result.sizeUs,
      });
      
      Alert.alert(
        'Succès', 
        'Mesure enregistrée !',
        [
          { 
            text: 'Comparer avec les produits', 
            onPress: () => compareWithProducts(result, apiType)
          },
          { 
            text: 'OK', 
            onPress: () => navigation.goBack() 
          },
        ]
      );
    } catch (error) {
      console.error('Error saving measurement:', error);
      
      // Handle validation errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        Alert.alert('Erreur de validation', errorMessages);
      } else {
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Impossible d\'enregistrer la mesure';
        Alert.alert('Erreur', errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const compareWithProducts = async (measurement, measurementType) => {
    try {
      // Load all products
      const response = await productsAPI.getAll();
      const products = response.data || response || [];
      
      // Find matching products based on size
      const matchingProducts = products.filter(product => {
        if (!product.is_available) return false;
        
        // Match by diameter (within 2mm tolerance)
        if (measurement.diameterMm && product.diameter_mm) {
          const diff = Math.abs(measurement.diameterMm - parseFloat(product.diameter_mm));
          if (diff <= 2) return true;
        }
        
        // Match by circumference (within 5mm tolerance)
        if (measurement.circumferenceMm && product.circumference_mm) {
          const diff = Math.abs(measurement.circumferenceMm - parseFloat(product.circumference_mm));
          if (diff <= 5) return true;
        }
        
        // Match by EU size (within 1 size tolerance)
        if (measurement.sizeEu && product.size_eu) {
          const diff = Math.abs(measurement.sizeEu - parseFloat(product.size_eu));
          if (diff <= 1) return true;
        }
        
        // Match by US size (within 0.5 size tolerance)
        if (measurement.sizeUs && product.size_us) {
          const diff = Math.abs(measurement.sizeUs - parseFloat(product.size_us));
          if (diff <= 0.5) return true;
        }
        
        return false;
      });
      
      if (matchingProducts.length === 0) {
        Alert.alert(
          'Aucun produit correspondant',
          'Aucun produit disponible ne correspond à cette mesure.'
        );
      } else {
        // Navigate to marketplace with matching products
        navigation.navigate('Marketplace', { 
          matchingProducts: matchingProducts,
          measurement: {
            diameter_mm: measurement.diameterMm,
            circumference_mm: measurement.circumferenceMm,
            size_eu: measurement.sizeEu,
            size_us: measurement.sizeUs,
            type: measurementType,
          }
        });
      }
    } catch (error) {
      console.error('Error comparing with products:', error);
      Alert.alert('Erreur', 'Impossible de comparer avec les produits');
    }
  };

  const renderInput = () => {
    switch (inputMethod) {
      case 'diameter':
        return (
          <View>
            <Text style={styles.label}>Diamètre (mm)</Text>
            <TextInput
              style={styles.input}
              value={diameter}
              onChangeText={setDiameter}
              keyboardType="numeric"
              placeholder="Ex: 18.5"
            />
          </View>
        );
      case 'circumference':
        return (
          <View>
            <Text style={styles.label}>Circonférence (mm)</Text>
            <TextInput
              style={styles.input}
              value={circumference}
              onChangeText={setCircumference}
              keyboardType="numeric"
              placeholder="Ex: 58.12"
            />
          </View>
        );
      case 'usSize':
        return (
          <View>
            <Text style={styles.label}>Taille US</Text>
            <TextInput
              style={styles.input}
              value={usSize}
              onChangeText={setUsSize}
              keyboardType="numeric"
              placeholder="Ex: 7.5"
            />
          </View>
        );
      case 'euSize':
        return (
          <View>
            <Text style={styles.label}>Taille EU</Text>
            <TextInput
              style={styles.input}
              value={euSize}
              onChangeText={setEuSize}
              keyboardType="numeric"
              placeholder="Ex: 18"
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Méthode de mesure</Text>
        
        <View style={styles.methodContainer}>
          <TouchableOpacity
            style={[styles.methodButton, inputMethod === 'diameter' && styles.methodButtonActive]}
            onPress={() => setInputMethod('diameter')}
          >
            <Text style={[styles.methodButtonText, inputMethod === 'diameter' && styles.methodButtonTextActive]}>
              Diamètre
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.methodButton, inputMethod === 'circumference' && styles.methodButtonActive]}
            onPress={() => setInputMethod('circumference')}
          >
            <Text style={[styles.methodButtonText, inputMethod === 'circumference' && styles.methodButtonTextActive]}>
              Circonférence
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.methodButton, inputMethod === 'usSize' && styles.methodButtonActive]}
            onPress={() => setInputMethod('usSize')}
          >
            <Text style={[styles.methodButtonText, inputMethod === 'usSize' && styles.methodButtonTextActive]}>
              Taille US
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.methodButton, inputMethod === 'euSize' && styles.methodButtonActive]}
            onPress={() => setInputMethod('euSize')}
          >
            <Text style={[styles.methodButtonText, inputMethod === 'euSize' && styles.methodButtonTextActive]}>
              Taille EU
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          {renderInput()}
        </View>

        <TouchableOpacity
          style={styles.calculateButton}
          onPress={calculate}
        >
          <Text style={styles.calculateButtonText}>Calculer</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Résultats:</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Diamètre:</Text>
              <Text style={styles.resultValue}>{result.diameterMm.toFixed(2)} mm</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Circonférence:</Text>
              <Text style={styles.resultValue}>{result.circumferenceMm.toFixed(2)} mm</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Taille EU:</Text>
              <Text style={styles.resultValue}>{result.sizeEu.toFixed(1)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Taille US:</Text>
              <Text style={styles.resultValue}>{result.sizeUs.toFixed(1)}</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.compareButton}
                onPress={() => {
                  const typeMapping = {
                    'ring': 'RING',
                    'bracelet': 'BRACELET',
                    'finger': 'FINGER',
                  };
                  compareWithProducts(result, typeMapping[type.toLowerCase()] || 'RING');
                }}
              >
                <Text style={styles.compareButtonText}>Comparer avec les produits</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.buttonDisabled]}
                onPress={saveMeasurement}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  methodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  methodButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  methodButtonActive: {
    borderColor: '#6200ee',
    backgroundColor: '#f3e5f5',
  },
  methodButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  methodButtonTextActive: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  calculateButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  buttonContainer: {
    gap: 10,
    marginTop: 20,
  },
  compareButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});


