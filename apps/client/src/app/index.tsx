import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { BrutalistBadge } from '@/components/brutalist-ui';

export default function IndexGateScreen() {
  return (
    <View style={styles.container}>
      <BrutalistBadge label="JWT AUTH // GATEWAY" variant="gold" />
      <Text style={styles.title}>CONCLAVE</Text>
      <ActivityIndicator size="large" color="#f2bf4b" style={{ marginVertical: 16 }} />
      <Text style={styles.loadingText}>VERIFYING AUTHENTICATION MATRIX...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#310004',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 36,
    fontWeight: '900',
    color: '#ffdad8',
    letterSpacing: 2,
    marginVertical: 12,
  },
  loadingText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#cdc6b7',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
});
