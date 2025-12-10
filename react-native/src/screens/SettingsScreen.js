import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../services/api';
import { getUserData, clearAll } from '../services/storage';

export default function SettingsScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await getUserData();
    setUserData(data);
    setIsVendor(data?.user_type === 'VENDEUR');
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              // Try to logout from server (ignore errors)
              try {
                await authAPI.logout();
              } catch (error) {
                // Ignore API errors - token might be expired or invalid
                console.log('Logout API call failed (expected if token expired):', error.message);
              }
            } catch (error) {
              console.error('Unexpected logout error:', error);
            } finally {
              // Always clear local storage
              try {
                await clearAll();
              } catch (error) {
                console.error('Error clearing storage:', error);
              }
              
              // Navigate to Login screen
              // Use navigation container ref or navigate to root
              try {
                // Try multiple navigation methods to ensure it works
                const rootNavigator = navigation.getParent()?.getParent();
                if (rootNavigator) {
                  rootNavigator.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                } else {
                  // Fallback: navigate to root
                  navigation.getParent()?.navigate('Login');
                }
              } catch (navError) {
                console.error('Navigation error:', navError);
                // Last resort: show message
                Alert.alert('Déconnexion', 'Vous avez été déconnecté. Veuillez redémarrer l\'application.');
              }
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info Card */}
      {userData && (
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#6200ee" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <View style={styles.userTypeBadge}>
              <Text style={styles.userTypeText}>
                {userData.user_type === 'VENDEUR' ? 'Vendeur' : 'Client'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Settings Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        
        {isVendor && (
          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('VendorProducts')}
          >
            <Ionicons name="storefront" size={24} color="#6200ee" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Mes Produits</Text>
              <Text style={styles.optionSubtitle}>Gérer mes produits en or</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.option}>
          <Ionicons name="person-outline" size={24} color="#6200ee" />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Profil</Text>
            <Text style={styles.optionSubtitle}>Modifier mes informations</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Ionicons name="lock-closed-outline" size={24} color="#6200ee" />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Mot de passe</Text>
            <Text style={styles.optionSubtitle}>Changer mon mot de passe</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application</Text>
        
        <TouchableOpacity style={styles.option}>
          <Ionicons name="notifications-outline" size={24} color="#6200ee" />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Notifications</Text>
            <Text style={styles.optionSubtitle}>Gérer les notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Ionicons name="language-outline" size={24} color="#6200ee" />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Langue</Text>
            <Text style={styles.optionSubtitle}>Français</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Ionicons name="help-circle-outline" size={24} color="#6200ee" />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Aide</Text>
            <Text style={styles.optionSubtitle}>Centre d'aide et support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Ionicons name="information-circle-outline" size={24} color="#6200ee" />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>À propos</Text>
            <Text style={styles.optionSubtitle}>Version 1.0.0</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3e5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#6200ee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginLeft: 15,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  option: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 1,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  optionContent: {
    flex: 1,
    marginLeft: 15,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  logoutSection: {
    margin: 15,
    marginTop: 30,
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

