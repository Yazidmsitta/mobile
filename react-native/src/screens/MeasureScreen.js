import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function MeasureScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#6200ee', '#3700b3']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Mesure de Bague</Text>
        <Text style={styles.headerSubtitle}>
          Choisissez votre méthode de mesure
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('CameraMeasure', { type: 'ring' })}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="camera" size={40} color="#6200ee" />
          </View>
          <Text style={styles.optionTitle}>Caméra avec Cercle</Text>
          <Text style={styles.optionDescription}>
            Prenez une photo et ajustez un cercle pour mesurer la bague
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('ManualMeasure', { type: 'ring' })}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="create-outline" size={40} color="#6200ee" />
          </View>
          <Text style={styles.optionTitle}>Entrée Manuelle</Text>
          <Text style={styles.optionDescription}>
            Entrez les dimensions manuellement
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('CameraMeasure', { type: 'bracelet' })}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="camera" size={40} color="#6200ee" />
          </View>
          <Text style={styles.optionTitle}>Bracelet (Caméra)</Text>
          <Text style={styles.optionDescription}>
            Mesurez un bracelet avec la caméra
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('ManualMeasure', { type: 'bracelet' })}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="create-outline" size={40} color="#6200ee" />
          </View>
          <Text style={styles.optionTitle}>Bracelet (Manuel)</Text>
          <Text style={styles.optionDescription}>
            Entrez les dimensions du bracelet manuellement
          </Text>
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
  header: {
    padding: 30,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});


