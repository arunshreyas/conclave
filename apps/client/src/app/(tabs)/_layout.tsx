import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#130f16',
          borderTopColor: '#4b463b',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#f2bf4b',
        tabBarInactiveTintColor: '#cdc6b7',
        tabBarLabelStyle: {
          fontFamily: 'Lexend, monospace',
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16, fontFamily: 'Lexend, monospace' }}>[H]</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16, fontFamily: 'Lexend, monospace' }}>[P]</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Metrics',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16, fontFamily: 'Lexend, monospace' }}>[M]</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="accessibility"
        options={{
          title: 'Read Spec',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16, fontFamily: 'Lexend, monospace' }}>[A]</Text>
          ),
        }}
      />
    </Tabs>
  );
}
