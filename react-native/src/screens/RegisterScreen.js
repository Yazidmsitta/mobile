import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../services/api';
import { setAuthToken, setUserData } from '../services/storage';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [userType, setUserType] = useState('CLIENT'); // 'CLIENT' or 'VENDEUR'
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirmation) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.register(name, email, password, passwordConfirmation, userType);
      
      if (response.token && response.user) {
        await setAuthToken(response.token);
        await setUserData(response.user);
        
        // Navigate to MainTabs after successful registration
        Alert.alert('Succès', 'Compte créé avec succès !', [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            },
          },
        ]);
      } else {
        Alert.alert('Erreur', 'Réponse invalide du serveur');
      }
    } catch (error) {
      console.error('Register error:', error);
      
      // Handle network errors specifically
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        Alert.alert(
          'Erreur de connexion',
          'Impossible de se connecter au serveur. Vérifiez que:\n\n' +
          '1. Le serveur Laravel est démarré\n' +
          '2. Votre téléphone/émulateur est sur le même réseau WiFi\n' +
          '3. L\'adresse IP est correcte dans la configuration'
        );
        return;
      }
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        Alert.alert('Erreur de validation', errorMessages);
        return;
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erreur lors de l\'inscription';
      Alert.alert('Erreur d\'inscription', 
        typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#6200ee', '#3700b3']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Créer un compte</Text>

            {/* User Type Selection */}
            <View style={styles.userTypeContainer}>
              <Text style={styles.userTypeLabel}>Je suis :</Text>
              <View style={styles.userTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === 'CLIENT' && styles.userTypeButtonActive,
                  ]}
                  onPress={() => setUserType('CLIENT')}
                >
                  <Ionicons
                    name="person"
                    size={24}
                    color={userType === 'CLIENT' ? '#fff' : '#6200ee'}
                  />
                  <Text
                    style={[
                      styles.userTypeButtonText,
                      userType === 'CLIENT' && styles.userTypeButtonTextActive,
                    ]}
                  >
                    Client
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === 'VENDEUR' && styles.userTypeButtonActive,
                  ]}
                  onPress={() => setUserType('VENDEUR')}
                >
                  <Ionicons
                    name="storefront"
                    size={24}
                    color={userType === 'VENDEUR' ? '#fff' : '#6200ee'}
                  />
                  <Text
                    style={[
                      styles.userTypeButtonText,
                      userType === 'VENDEUR' && styles.userTypeButtonTextActive,
                    ]}
                  >
                    Vendeur
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Nom"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#999"
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                secureTextEntry
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>S'inscrire</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.linkText}>
                  Déjà un compte ? Se connecter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#03dac6',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  userTypeContainer: {
    marginBottom: 20,
  },
  userTypeLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 8,
  },
  userTypeButtonActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  userTypeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userTypeButtonTextActive: {
    color: '#fff',
  },
});


