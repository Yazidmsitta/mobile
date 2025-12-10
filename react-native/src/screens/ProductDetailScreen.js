import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productsAPI } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const response = await productsAPI.getById(productId);
      setProduct(response.data || response);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Erreur', 'Impossible de charger le produit');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!product) {
    return null;
  }

  // Use main_image_url if available, otherwise use images array
  const images = product.main_image_url 
    ? [{ image_url: product.main_image_url }]
    : (product.images || []);
  const currentImage = images[currentImageIndex];

  return (
    <ScrollView style={styles.container}>
      {/* Image Carousel */}
      {images.length > 0 ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentImage?.image_url }}
            style={styles.productImage}
            resizeMode="cover"
            onError={(error) => {
              console.error('Error loading product image:', currentImage?.image_url, error);
            }}
          />
          {images.length > 1 && (
            <View style={styles.imageIndicators}>
              {images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.indicatorActive,
                  ]}
                  onPress={() => setCurrentImageIndex(index)}
                />
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="image-outline" size={64} color="#ccc" />
        </View>
      )}

      {/* Product Info */}
      <View style={styles.content}>
        <Text style={styles.productName}>{product.name}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>
            {product.price ? parseFloat(product.price).toFixed(2) : '0.00'} €
          </Text>
          {product.weight && product.price && (
            <Text style={styles.productWeight}>
              ({parseFloat(product.weight).toFixed(2)} g - {(parseFloat(product.price) / parseFloat(product.weight)).toFixed(2)} €/g)
            </Text>
          )}
        </View>

        {product.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionText}>{product.description}</Text>
          </View>
        )}

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          {product.category && (
            <View style={styles.detailRow}>
              <Ionicons name="pricetag-outline" size={20} color="#6200ee" />
              <Text style={styles.detailLabel}>Catégorie:</Text>
              <Text style={styles.detailValue}>{product.category}</Text>
            </View>
          )}
          
          {product.karat && (
            <View style={styles.detailRow}>
              <Ionicons name="diamond-outline" size={20} color="#6200ee" />
              <Text style={styles.detailLabel}>Carat:</Text>
              <Text style={styles.detailValue}>{product.karat}</Text>
            </View>
          )}
          
          {product.vendor && (
            <View style={styles.detailRow}>
              <Ionicons name="storefront-outline" size={20} color="#6200ee" />
              <Text style={styles.detailLabel}>Vendeur:</Text>
              <Text style={styles.detailValue}>
                {product.vendor.shop_name || product.vendor.name || product.vendor}
              </Text>
            </View>
          )}

          {(product.diameter_mm || product.circumference_mm || product.size_eu || product.size_us) && (
            <View style={styles.measurementsSection}>
              <Text style={styles.sectionTitle}>Mesures</Text>
              {product.diameter_mm && (
                <View style={styles.detailRow}>
                  <Ionicons name="resize-outline" size={20} color="#6200ee" />
                  <Text style={styles.detailLabel}>Diamètre:</Text>
                  <Text style={styles.detailValue}>{parseFloat(product.diameter_mm).toFixed(1)} mm</Text>
                </View>
              )}
              {product.circumference_mm && (
                <View style={styles.detailRow}>
                  <Ionicons name="ellipse-outline" size={20} color="#6200ee" />
                  <Text style={styles.detailLabel}>Circonférence:</Text>
                  <Text style={styles.detailValue}>{parseFloat(product.circumference_mm).toFixed(1)} mm</Text>
                </View>
              )}
              {product.size_eu && (
                <View style={styles.detailRow}>
                  <Ionicons name="flag-outline" size={20} color="#6200ee" />
                  <Text style={styles.detailLabel}>Taille EU:</Text>
                  <Text style={styles.detailValue}>{parseFloat(product.size_eu).toFixed(0)}</Text>
                </View>
              )}
              {product.size_us && (
                <View style={styles.detailRow}>
                  <Ionicons name="flag-outline" size={20} color="#6200ee" />
                  <Text style={styles.detailLabel}>Taille US:</Text>
                  <Text style={styles.detailValue}>{parseFloat(product.size_us).toFixed(0)}</Text>
                </View>
              )}
            </View>
          )}

          {product.weight && (
            <View style={styles.detailRow}>
              <Ionicons name="scale-outline" size={20} color="#6200ee" />
              <Text style={styles.detailLabel}>Poids:</Text>
              <Text style={styles.detailValue}>{parseFloat(product.weight).toFixed(2)} g</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Contacter le vendeur</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyButton}>
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.buyButtonText}>Acheter maintenant</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  placeholderImage: {
    width: SCREEN_WIDTH,
    height: 300,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  content: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  priceContainer: {
    marginBottom: 20,
  },
  productPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  productWeight: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginRight: 10,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  measurementsSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButtonsContainer: {
    gap: 10,
    marginTop: 10,
  },
  contactButton: {
    backgroundColor: '#6200ee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buyButton: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});


