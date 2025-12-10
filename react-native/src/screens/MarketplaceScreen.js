import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productsAPI } from '../services/api';
import { getUserData } from '../services/storage';

export default function MarketplaceScreen({ navigation }) {
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    checkVendorStatus();
  }, []);

  const checkVendorStatus = async () => {
    const userData = await getUserData();
    setIsVendor(userData?.user_type === 'VENDEUR');
  };
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: null,
    minPrice: null,
    maxPrice: null,
  });

  useEffect(() => {
    loadProducts();
  }, [filters, searchQuery]);

  useEffect(() => {
    // Check navigation params for matching products
    const unsubscribe = navigation.addListener('focus', () => {
      const params = navigation.getState()?.routes?.find(r => r.name === 'Marketplace')?.params;
      if (params?.matchingProducts) {
        setProducts(params.matchingProducts);
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const loadProducts = async () => {
    try {
      const apiFilters = { ...filters };
      if (searchQuery) {
        apiFilters.search = searchQuery;
      }
      
      const response = await productsAPI.getAll(apiFilters);
      const data = response.data || response || [];
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Erreur', 'Impossible de charger les produits');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const renderItem = ({ item }) => {
    // Try main_image_url first, then images array, then null
    const imageUrl = item.main_image_url 
      || (item.images && item.images.length > 0 ? item.images[0].image_url : null)
      || null;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.productImage}
            resizeMode="cover"
            onError={(error) => {
              console.error('Error loading image:', imageUrl, error);
            }}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name || 'Produit sans nom'}
          </Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description || 'Aucune description'}
          </Text>
          
          <View style={styles.productFooter}>
            <View>
              <Text style={styles.productPrice}>
                {item.price ? parseFloat(item.price).toFixed(2) : '0.00'} €
              </Text>
              {item.weight && (
                <Text style={styles.productWeight}>
                  {item.weight} g
                </Text>
              )}
            </View>
            <View style={styles.productBadge}>
              <Ionicons name="star" size={16} color="#ffc107" />
              <Text style={styles.productRating}>
                {item.rating || 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
      {/* Vendor Button */}
      {isVendor && (
        <TouchableOpacity
          style={styles.vendorButton}
          onPress={() => navigation.navigate('VendorProducts')}
        >
          <Ionicons name="storefront" size={20} color="#fff" />
          <Text style={styles.vendorButtonText}>Gérer mes produits</Text>
        </TouchableOpacity>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Products List */}
      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Aucun produit trouvé</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.row}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 10,
  },
  list: {
    padding: 15,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '48%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  productWeight: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  productBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9c4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productRating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
  },
  vendorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  vendorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


