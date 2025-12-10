import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { calculateFromReference, MeasurementType } from '../utils/measurementCalculator';
import { measurementsAPI, productsAPI } from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CameraMeasureScreen({ route, navigation }) {
  const { type = 'ring' } = route.params || {};
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState(null);
  const [ringCircle, setRingCircle] = useState({ cx: SCREEN_WIDTH / 2, cy: SCREEN_HEIGHT / 2, r: 100 });
  const [referenceCircle, setReferenceCircle] = useState({ cx: SCREEN_WIDTH / 2, cy: SCREEN_HEIGHT / 2 + 200, r: 50 });
  const [selectedCircle, setSelectedCircle] = useState(null); // 'ring' or 'reference'
  const [referenceDiameter, setReferenceDiameter] = useState(24); // Default: 24mm for 2 euro coin
  const [result, setResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const cameraRef = useRef(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        if (photo && photo.uri) {
          setImage(photo.uri);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Erreur', 'Impossible de prendre la photo');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const handleTouch = (event) => {
    if (!image) return;
    
    const { locationX, locationY } = event.nativeEvent;
    
    if (selectedCircle === 'ring') {
      // Calculate distance from touch to ring circle center
      const dx = locationX - ringCircle.cx;
      const dy = locationY - ringCircle.cy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Update radius
      setRingCircle({ ...ringCircle, r: Math.max(20, distance) });
    } else if (selectedCircle === 'reference') {
      const dx = locationX - referenceCircle.cx;
      const dy = locationY - referenceCircle.cy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      setReferenceCircle({ ...referenceCircle, r: Math.max(10, distance) });
    } else {
      // Check which circle is closer
      const distToRing = Math.sqrt(
        Math.pow(locationX - ringCircle.cx, 2) + 
        Math.pow(locationY - ringCircle.cy, 2)
      );
      const distToRef = Math.sqrt(
        Math.pow(locationX - referenceCircle.cx, 2) + 
        Math.pow(locationY - referenceCircle.cy, 2)
      );
      
      if (distToRing < distToRef) {
        setSelectedCircle('ring');
      } else {
        setSelectedCircle('reference');
      }
    }
  };

  const calculateMeasurement = () => {
    try {
      const measurement = calculateFromReference(
        ringCircle.r,
        referenceCircle.r,
        referenceDiameter
      );
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

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Accès à la caméra refusé</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Demander la permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { marginTop: 10 }]}
          onPress={pickImage}
        >
          <Text style={styles.buttonText}>Choisir une image</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!image ? (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          />
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <Ionicons name="camera" size={40} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={pickImage}
            >
              <Ionicons name="images" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          
          <Svg
            style={StyleSheet.absoluteFill}
            onTouchStart={handleTouch}
            onTouchMove={handleTouch}
          >
            <Circle
              cx={ringCircle.cx}
              cy={ringCircle.cy}
              r={ringCircle.r}
              stroke={selectedCircle === 'ring' ? '#03dac6' : '#6200ee'}
              strokeWidth="3"
              fill="none"
            />
            <Circle
              cx={referenceCircle.cx}
              cy={referenceCircle.cy}
              r={referenceCircle.r}
              stroke={selectedCircle === 'reference' ? '#03dac6' : '#ff6b6b'}
              strokeWidth="3"
              fill="none"
            />
          </Svg>

          <View style={styles.controls}>
            <View style={styles.controlRow}>
              <TouchableOpacity
                style={[styles.controlButton, selectedCircle === 'ring' && styles.controlButtonActive]}
                onPress={() => setSelectedCircle('ring')}
              >
                <Text style={styles.controlButtonText}>Bague</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, selectedCircle === 'reference' && styles.controlButtonActive]}
                onPress={() => setSelectedCircle('reference')}
              >
                <Text style={styles.controlButtonText}>Référence</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.calculateButton}
              onPress={calculateMeasurement}
            >
              <Text style={styles.calculateButtonText}>Calculer</Text>
            </TouchableOpacity>

            {result && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>Résultats:</Text>
                <Text style={styles.resultText}>
                  Diamètre: {result.diameterMm.toFixed(2)} mm
                </Text>
                <Text style={styles.resultText}>
                  Circonférence: {result.circumferenceMm.toFixed(2)} mm
                </Text>
                <Text style={styles.resultText}>
                  Taille EU: {result.sizeEu.toFixed(1)}
                </Text>
                <Text style={styles.resultText}>
                  Taille US: {result.sizeUs.toFixed(1)}
                </Text>
                
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

            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => {
                setImage(null);
                setResult(null);
                setSelectedCircle(null);
              }}
            >
              <Text style={styles.retakeButtonText}>Reprendre</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  controlButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  controlButtonActive: {
    backgroundColor: '#6200ee',
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  calculateButton: {
    backgroundColor: '#03dac6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  calculateButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
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
  retakeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

