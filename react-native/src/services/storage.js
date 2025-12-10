import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

export const storage = {
  // Auth Token
  async setAuthToken(token) {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving auth token:', error);
      throw error;
    }
  },

  async getAuthToken() {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error removing auth token:', error);
      throw error;
    }
  },

  // User Data
  async setUserData(userData) {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  async getUserData() {
    try {
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  async removeUserData() {
    try {
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Error removing user data:', error);
      throw error;
    }
  },

  // Clear all
  async clearAll() {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};

// Export convenience functions
export const setAuthToken = storage.setAuthToken;
export const getAuthToken = storage.getAuthToken;
export const removeAuthToken = storage.removeAuthToken;
export const setUserData = storage.setUserData;
export const getUserData = storage.getUserData;
export const removeUserData = storage.removeUserData;
export const clearAll = storage.clearAll;


