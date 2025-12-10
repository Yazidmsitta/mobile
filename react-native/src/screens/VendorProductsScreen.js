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
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { vendorProductsAPI, API_BASE_URL } from '../services/api';
import { getAuthToken } from '../services/storage';
import * as ImagePicker from 'expo-image-picker';

export default function VendorProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    karat: '18K',
    category: 'RING',
    main_image_url: '',
    is_available: true,
    // Measurement fields
    diameter_mm: '',
    circumference_mm: '',
    size_eu: '',
    size_us: '',
    weight: '', // Weight in grams
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await vendorProductsAPI.getAll();
      setProducts(response.data || response || []);
    } catch (error) {
      console.error('Error loading products:', error);
      if (error.response?.status === 403) {
        Alert.alert('Erreur', 'Vous devez être un vendeur pour accéder à cette fonctionnalité');
      } else {
        Alert.alert('Erreur', 'Impossible de charger les produits');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      karat: '18K',
      category: 'RING',
      main_image_url: '',
      is_available: true,
      diameter_mm: '',
      circumference_mm: '',
      size_eu: '',
      size_us: '',
      weight: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      karat: product.karat || '18K',
      category: product.category || 'RING',
      main_image_url: product.main_image_url || '',
      is_available: product.is_available !== false,
      diameter_mm: product.diameter_mm?.toString() || '',
      circumference_mm: product.circumference_mm?.toString() || '',
      size_eu: product.size_eu?.toString() || '',
      size_us: product.size_us?.toString() || '',
      weight: product.weight?.toString() || '',
    });
    setModalVisible(true);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const localUri = result.assets[0].uri;
        
        // Upload image to server
        await uploadImage(localUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const uploadImage = async (uri) => {
    setUploadingImage(true);
    try {
      // Create form data
      const formData = new FormData();
      
      // Get filename from URI
      const filename = uri.split('/').pop() || 'image.jpg';
      
      // Determine file type from extension
      let fileType = 'image/jpeg';
      if (filename.toLowerCase().endsWith('.png')) {
        fileType = 'image/png';
      } else if (filename.toLowerCase().endsWith('.gif')) {
        fileType = 'image/gif';
      }
      
      // Append file to form data
      // For React Native, we need to create a file-like object
      // On iOS, we need to remove 'file://' prefix, on Android we keep it
      const fileUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
      
      const file = {
        uri: fileUri,
        name: filename,
        type: fileType,
      };
      
      console.log('Uploading image:', {
        uri: fileUri,
        name: filename,
        type: fileType,
        platform: Platform.OS,
      });
      
      formData.append('image', file);

      // Get auth token
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      // Upload to server
      const response = await fetch(`${API_BASE_URL}images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type, let fetch set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: Upload failed`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          if (errorData.errors) {
            const errors = Object.values(errorData.errors).flat();
            errorMessage = errors.join(', ');
          }
        } catch (e) {
          const text = await response.text();
          console.error('Error response text:', text);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Image uploaded successfully:', data);
      
      // Update form data with uploaded image URL
      setFormData({ ...formData, main_image_url: data.url });
      Alert.alert('Succès', 'Image téléchargée avec succès');
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        uri: uri,
      });
      Alert.alert('Erreur', 'Impossible de télécharger l\'image: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      // Helper function to convert empty string to null
      const toNumberOrNull = (value) => {
        if (!value || value === '') return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      };

      // Prepare data for API
      const data = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        price: parseFloat(formData.price),
        currency: 'EUR',
        karat: formData.karat || null,
        category: formData.category,
        is_available: formData.is_available !== false,
        // Include main_image_url if it exists (should be a server URL after upload)
        main_image_url: formData.main_image_url || null,
        // Convert measurement fields to numbers or null
        diameter_mm: toNumberOrNull(formData.diameter_mm),
        circumference_mm: toNumberOrNull(formData.circumference_mm),
        size_eu: toNumberOrNull(formData.size_eu),
        size_us: toNumberOrNull(formData.size_us),
        weight: toNumberOrNull(formData.weight),
      };

      console.log('Sending product data:', data);

      if (editingProduct) {
        await vendorProductsAPI.update(editingProduct.id, data);
        Alert.alert('Succès', 'Produit modifié avec succès');
      } else {
        await vendorProductsAPI.create(data);
        Alert.alert('Succès', 'Produit créé avec succès');
      }

      setModalVisible(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        Alert.alert('Erreur de validation', errorMessages);
      } else if (error.response?.data?.message) {
        Alert.alert('Erreur', error.response.data.message);
      } else {
        Alert.alert('Erreur', error.message || 'Impossible d\'enregistrer le produit');
      }
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Supprimer',
      'Êtes-vous sûr de vouloir supprimer ce produit ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await vendorProductsAPI.delete(id);
              Alert.alert('Succès', 'Produit supprimé avec succès');
              loadProducts();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le produit');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.productCard}>
        {item.main_image_url ? (
          <Image source={{ uri: item.main_image_url }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>
            {parseFloat(item.price || 0).toFixed(2)} €
          </Text>
          <View style={styles.productBadges}>
            <Text style={styles.badge}>{item.category}</Text>
            {item.karat && <Text style={styles.badge}>{item.karat}</Text>}
            <Text style={[styles.badge, !item.is_available && styles.badgeInactive]}>
              {item.is_available ? 'Disponible' : 'Indisponible'}
            </Text>
          </View>
          
          <View style={styles.productActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => openEditModal(item)}
            >
              <Ionicons name="pencil" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Aucun produit</Text>
            <Text style={styles.emptySubtext}>
              Ajoutez votre premier produit en or
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={openAddModal}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Nom du produit *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ex: Bague en or 18K"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Description du produit"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Prix (€) *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Carat</Text>
              <View style={styles.pickerContainer}>
                {['9K', '14K', '18K', '22K', '24K'].map((k) => (
                  <TouchableOpacity
                    key={k}
                    style={[
                      styles.pickerOption,
                      formData.karat === k && styles.pickerOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, karat: k })}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formData.karat === k && styles.pickerOptionTextActive,
                      ]}
                    >
                      {k}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Catégorie *</Text>
              <View style={styles.pickerContainer}>
                {[
                  { value: 'RING', label: 'Bague' },
                  { value: 'BRACELET', label: 'Bracelet' },
                  { value: 'NECKLACE', label: 'Collier' },
                  { value: 'OTHER', label: 'Autre' },
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.pickerOption,
                      formData.category === cat.value && styles.pickerOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat.value })}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formData.category === cat.value && styles.pickerOptionTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Image</Text>
              <TouchableOpacity 
                style={styles.imagePicker} 
                onPress={pickImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <View style={styles.imagePlaceholder}>
                    <ActivityIndicator size="large" color="#6200ee" />
                    <Text style={styles.imagePlaceholderText}>Téléchargement...</Text>
                  </View>
                ) : formData.main_image_url ? (
                  <Image
                    source={{ uri: formData.main_image_url }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={30} color="#6200ee" />
                    <Text style={styles.imagePlaceholderText}>Ajouter une image</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Mesures (optionnel)</Text>
              
              <Text style={styles.label}>Diamètre (mm)</Text>
              <TextInput
                style={styles.input}
                value={formData.diameter_mm}
                onChangeText={(text) => setFormData({ ...formData, diameter_mm: text })}
                placeholder="Ex: 18.5"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Circonférence (mm)</Text>
              <TextInput
                style={styles.input}
                value={formData.circumference_mm}
                onChangeText={(text) => setFormData({ ...formData, circumference_mm: text })}
                placeholder="Ex: 58.1"
                keyboardType="decimal-pad"
              />

              <View style={styles.measureRow}>
                <View style={styles.measureHalf}>
                  <Text style={styles.label}>Taille EU</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.size_eu}
                    onChangeText={(text) => setFormData({ ...formData, size_eu: text })}
                    placeholder="Ex: 58"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.measureHalf}>
                  <Text style={styles.label}>Taille US</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.size_us}
                    onChangeText={(text) => setFormData({ ...formData, size_us: text })}
                    placeholder="Ex: 8"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Text style={styles.label}>Poids (grammes)</Text>
              <TextInput
                style={styles.input}
                value={formData.weight}
                onChangeText={(text) => setFormData({ ...formData, weight: text })}
                placeholder="Ex: 5.2"
                keyboardType="decimal-pad"
              />

              <View style={styles.switchContainer}>
                <Text style={styles.label}>Disponible</Text>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    formData.is_available && styles.switchActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, is_available: !formData.is_available })
                  }
                >
                  <View
                    style={[
                      styles.switchThumb,
                      formData.is_available && styles.switchThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {editingProduct ? 'Modifier' : 'Créer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 80,
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
    height: 120,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 8,
  },
  productBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  badge: {
    fontSize: 10,
    backgroundColor: '#f3e5f5',
    color: '#6200ee',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  badgeInactive: {
    backgroundColor: '#ffebee',
    color: '#f44336',
  },
  productActions: {
    flexDirection: 'row',
    gap: 5,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 6,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#6200ee',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerOptionActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#666',
  },
  pickerOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  imagePicker: {
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6200ee',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: '#6200ee',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  switchThumbActive: {
    marginLeft: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6200ee',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

