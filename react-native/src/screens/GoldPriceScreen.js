import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';
import { Ionicons } from '@expo/vector-icons';
import { goldPriceAPI } from '../services/api';
import { format, subDays } from 'date-fns';

export default function GoldPriceScreen() {
  const [prices, setPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('7days'); // '7days', '30days', '90days', 'all'

  useEffect(() => {
    loadPrices();
  }, [filter]);

  const loadPrices = async () => {
    try {
      let period = 'month'; // default
      let startDate = null;
      let endDate = null;
      
      if (filter === '7days') {
        period = 'week';
        startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
        endDate = format(new Date(), 'yyyy-MM-dd');
      } else if (filter === '30days') {
        period = 'month';
        startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        endDate = format(new Date(), 'yyyy-MM-dd');
      } else if (filter === '90days') {
        period = 'year';
        startDate = format(subDays(new Date(), 90), 'yyyy-MM-dd');
        endDate = format(new Date(), 'yyyy-MM-dd');
      } else {
        // 'all' - no date filter
        period = 'all';
      }
      
      const response = await goldPriceAPI.getAll({
        period: period,
        start_date: startDate,
        end_date: endDate,
      });
      
      // Handle response format
      const data = response.data || response || [];
      
      // Sort by date
      const sortedData = data.sort((a, b) => {
        const dateA = a.date_recorded || a.date || a.created_at;
        const dateB = b.date_recorded || b.date || b.created_at;
        return new Date(dateA) - new Date(dateB);
      });
      
      setPrices(sortedData);
    } catch (error) {
      console.error('Error loading gold prices:', error);
      Alert.alert('Erreur', 'Impossible de charger les prix de l\'or');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPrices();
  };

  const getCurrentPrice = () => {
    if (prices.length === 0) return null;
    return prices[prices.length - 1];
  };

  const getPriceChange = () => {
    if (prices.length < 2) return null;
    const current = prices[prices.length - 1];
    const previous = prices[prices.length - 2];
    const currentPrice = parseFloat(current.price_per_gram || 0);
    const previousPrice = parseFloat(previous.price_per_gram || 0);
    const change = currentPrice - previousPrice;
    const percentChange = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
    return { change, percentChange };
  };

  const currentPrice = getCurrentPrice();
  const priceChange = getPriceChange();

  // Prepare chart data
  const chartData = prices.map((item, index) => ({
    x: index + 1,
    y: parseFloat(item.price_per_gram) || 0,
    date: item.date_recorded || item.date || item.created_at,
  }));

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#6200ee']}
        />
      }
    >
      {/* Current Price Card */}
      {currentPrice && (
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Prix actuel</Text>
          <Text style={styles.priceValue}>
            {parseFloat(currentPrice.price_per_gram || 0).toFixed(2)} €/g
          </Text>
          {priceChange && (
            <View style={styles.changeContainer}>
              <Ionicons
                name={priceChange.change >= 0 ? 'trending-up' : 'trending-down'}
                size={20}
                color={priceChange.change >= 0 ? '#4caf50' : '#f44336'}
              />
              <Text
                style={[
                  styles.changeText,
                  { color: priceChange.change >= 0 ? '#4caf50' : '#f44336' },
                ]}
              >
                {priceChange.change >= 0 ? '+' : ''}
                {priceChange.change.toFixed(2)} € (
                {priceChange.percentChange >= 0 ? '+' : ''}
                {priceChange.percentChange.toFixed(2)}%)
              </Text>
            </View>
          )}
          <Text style={styles.priceDate}>
            {format(
              new Date(currentPrice.date_recorded || currentPrice.date || currentPrice.created_at),
              'dd MMMM yyyy'
            )}
          </Text>
        </View>
      )}

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === '7days' && styles.filterButtonActive]}
          onPress={() => setFilter('7days')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === '7days' && styles.filterButtonTextActive,
            ]}
          >
            7 jours
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === '30days' && styles.filterButtonActive]}
          onPress={() => setFilter('30days')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === '30days' && styles.filterButtonTextActive,
            ]}
          >
            30 jours
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === '90days' && styles.filterButtonActive]}
          onPress={() => setFilter('90days')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === '90days' && styles.filterButtonTextActive,
            ]}
          >
            90 jours
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            Tout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart */}
      {chartData.length > 0 ? (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Évolution du prix</Text>
          <VictoryChart
            theme={VictoryTheme.material}
            height={250}
            padding={{ left: 50, right: 20, top: 20, bottom: 40 }}
          >
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: '#6200ee' },
                tickLabels: { fill: '#666', fontSize: 10 },
              }}
            />
            <VictoryAxis
              style={{
                axis: { stroke: '#6200ee' },
                tickLabels: { fill: '#666', fontSize: 10 },
              }}
            />
            <VictoryLine
              data={chartData}
              style={{
                data: { stroke: '#6200ee', strokeWidth: 2 },
              }}
              interpolation="natural"
            />
          </VictoryChart>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="trending-up-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Aucune donnée disponible</Text>
        </View>
      )}

      {/* Price List */}
      {prices.length > 0 && (
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Historique</Text>
          {prices.slice().reverse().map((item, index) => (
            <View key={index} style={styles.listItem}>
              <View>
                <Text style={styles.listItemDate}>
                  {format(
                    new Date(item.date_recorded || item.date || item.created_at),
                    'dd MMM yyyy'
                  )}
                </Text>
                {item.karat && (
                  <Text style={styles.listItemKarat}>{item.karat}</Text>
                )}
              </View>
              <Text style={styles.listItemPrice}>
                {parseFloat(item.price_per_gram || 0).toFixed(2)} €/g
              </Text>
            </View>
          ))}
        </View>
      )}
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
  priceCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 10,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  priceDate: {
    fontSize: 12,
    color: '#999',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  listContainer: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemDate: {
    fontSize: 14,
    color: '#666',
  },
  listItemKarat: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  listItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});

