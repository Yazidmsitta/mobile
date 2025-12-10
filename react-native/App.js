import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer, useNavigationContainerRef, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MeasureScreen from './src/screens/MeasureScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import GoldPriceScreen from './src/screens/GoldPriceScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CameraMeasureScreen from './src/screens/CameraMeasureScreen';
import ManualMeasureScreen from './src/screens/ManualMeasureScreen';
import VendorProductsScreen from './src/screens/VendorProductsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Services
import { getAuthToken } from './src/services/storage';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const navigation = useNavigation();
  
  // Check authentication when MainTabs is mounted
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken();
      if (!token) {
        // Redirect to login if not authenticated
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    };
    checkAuth();
  }, [navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Measure') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'GoldPrice') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Marketplace') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Measure" options={{ title: 'Mesure' }} component={MeasureScreen} />
      <Tab.Screen name="History" options={{ title: 'Historique' }} component={HistoryScreen} />
      <Tab.Screen name="GoldPrice" options={{ title: 'Prix de l\'Or' }} component={GoldPriceScreen} />
      <Tab.Screen name="Marketplace" options={{ title: 'Boutique' }} component={MarketplaceScreen} />
      <Tab.Screen name="Settings" options={{ title: 'Paramètres' }} component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigationRef = useNavigationContainerRef();

  const checkAuth = useCallback(async () => {
    try {
      const token = await getAuthToken();
      const authenticated = !!token;
      setIsAuthenticated(authenticated);
      
      // If authenticated and navigation is ready, navigate to MainTabs
      if (authenticated && navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [navigationRef]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for navigation state changes to check auth when needed
  useEffect(() => {
    if (navigationRef.isReady()) {
      const unsubscribe = navigationRef.addListener('state', () => {
        // Check auth when navigation state changes
        checkAuth();
      });
      return unsubscribe;
    }
  }, [navigationRef, checkAuth]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen 
          name="CameraMeasure" 
          component={CameraMeasureScreen}
          options={{ title: 'Mesure par Caméra', headerShown: true }}
        />
        <Stack.Screen 
          name="ManualMeasure" 
          component={ManualMeasureScreen}
          options={{ title: 'Mesure Manuelle', headerShown: true }}
        />
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen}
          options={{ title: 'Détails du Produit', headerShown: true }}
        />
        <Stack.Screen 
          name="VendorProducts" 
          component={VendorProductsScreen}
          options={{ title: 'Mes Produits', headerShown: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


