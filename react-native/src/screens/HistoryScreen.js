import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { measurementsAPI, productsAPI } from '../services/api';
import { format } from 'date-fns';

export default function HistoryScreen() {
  const [measurements, setMeasurements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      const response = await measurementsAPI.getAll();
      setMeasurements(response.data || response || []);
    } catch (error) {
      console.error('Error loading measurements:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'historique');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMeasurements();
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Supprimer',
      'Êtes-vous sûr de vouloir supprimer cette mesure ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await measurementsAPI.delete(id);
              loadMeasurements();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la mesure');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const date = item.created_at 
      ? format(new Date(item.created_at), 'dd MMM yyyy à HH:mm')
      : 'Date inconnue';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons
              name={item.type?.toLowerCase() === 'bracelet' ? 'watch-outline' : 'radio-button-on'}
              size={24}
              color="#6200ee"
            />
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                {item.name || (item.type?.toLowerCase() === 'bracelet' ? 'Bracelet' : 'Bague')}
              </Text>
              <Text style={styles.cardDate}>{date}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Diamètre:</Text>
            <Text style={styles.measurementValue}>
              {item.diameter_mm ? parseFloat(item.diameter_mm).toFixed(2) : 'N/A'} mm
            </Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Circonférence:</Text>
            <Text style={styles.measurementValue}>
              {item.circumference_mm ? parseFloat(item.circumference_mm).toFixed(2) : 'N/A'} mm
            </Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Taille EU:</Text>
            <Text style={styles.measurementValue}>
              {item.size_eu ? parseFloat(item.size_eu).toFixed(1) : 'N/A'}
            </Text>
          </View>
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Taille US:</Text>
            <Text style={styles.measurementValue}>
              {item.size_us ? parseFloat(item.size_us).toFixed(1) : 'N/A'}
            </Text>
          </View>
          {item.method && (
            <View style={styles.methodBadge}>
              <Text style={styles.methodText}>
                {item.method === 'camera' ? '📷 Caméra' : '✏️ Manuel'}
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.compareButton}
          onPress={() => handleCompareWithProducts(item)}
        >
          <Ionicons name="search" size={16} color="#fff" />
          <Text style={styles.compareButtonText}>Comparer avec les produits</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleCompareWithProducts = async (measurement) => {
    try {
      // Load all products
      const response = await productsAPI.getAll();
      const products = response.data || response || [];
      
      // Find matching products based on size
      const matchingProducts = products.filter(product => {
        if (!product.is_available) return false;
        
        // Match by diameter (within 2mm tolerance)
        if (measurement.diameter_mm && product.diameter_mm) {
          const diff = Math.abs(parseFloat(measurement.diameter_mm) - parseFloat(product.diameter_mm));
          if (diff <= 2) return true;
        }
        
        // Match by circumference (within 5mm tolerance)
        if (measurement.circumference_mm && product.circumference_mm) {
          const diff = Math.abs(parseFloat(measurement.circumference_mm) - parseFloat(product.circumference_mm));
          if (diff <= 5) return true;
        }
        
        // Match by EU size (within 1 size tolerance)
        if (measurement.size_eu && product.size_eu) {
          const diff = Math.abs(parseFloat(measurement.size_eu) - parseFloat(product.size_eu));
          if (diff <= 1) return true;
        }
        
        // Match by US size (within 0.5 size tolerance)
        if (measurement.size_us && product.size_us) {
          const diff = Math.abs(parseFloat(measurement.size_us) - parseFloat(product.size_us));
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
        // Navigate to marketplace with filter or show products
        navigation.navigate('Marketplace', { 
          matchingProducts: matchingProducts,
          measurement: measurement 
        });
      }
    } catch (error) {
      console.error('Error comparing with products:', error);
      Alert.alert('Erreur', 'Impossible de comparer avec les produits');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {measurements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Aucune mesure enregistrée</Text>
          <Text style={styles.emptySubtext}>
            Commencez par effectuer une mesure
          </Text>
        </View>
      ) : (
        <FlatList
          data={measurements}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#6200ee']}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardHeaderText: {
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 5,
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  measurementLabel: {
    fontSize: 14,
    color: '#666',
  },
  measurementValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  methodBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
  },
  methodText: {
    fontSize: 12,
    color: '#6200ee',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 10,
    textAlign: 'center',
  },
  compareButton: {
    backgroundColor: '#6200ee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

