import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrutalistBadge, BrutalistCard } from '@/components/brutalist-ui';

const topics = [
  {
    id: 'p1',
    subject: 'PHYSICS',
    code: 'PHY-102',
    title: 'Rotational Motion & Rigid Body Dynamics',
    questions: 45,
    tag: 'JEE ADVANCED',
    highYield: true,
  },
  {
    id: 'c1',
    subject: 'CHEMISTRY',
    code: 'CHE-204',
    title: 'Organic Mechanisms & Reaction Pathways',
    questions: 60,
    tag: 'JEE MAIN + ADV',
    highYield: true,
  },
  {
    id: 'm1',
    subject: 'MATHEMATICS',
    code: 'MAT-301',
    title: 'Definite Integration & Differential Equations',
    questions: 50,
    tag: 'JEE ADVANCED',
    highYield: false,
  },
  {
    id: 'p2',
    subject: 'PHYSICS',
    code: 'PHY-201',
    title: 'Electromagnetic Induction & AC Circuits',
    questions: 40,
    tag: 'JEE MAIN',
    highYield: false,
  },
  {
    id: 'c2',
    subject: 'CHEMISTRY',
    code: 'CHE-105',
    title: 'Chemical Equilibrium & Thermodynamics',
    questions: 35,
    tag: 'JEE MAIN',
    highYield: true,
  },
];

export default function PracticeBrowserScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredTopics = topics.filter((t) => {
    const matchesFilter = filter === 'ALL' || t.subject === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.code.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Text style={styles.title}>PRACTICE BROWSER // MATRIX</Text>
        <Text style={styles.subTitle}>5 MODULES</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="SEARCH TOPIC OR SPEC CODE (e.g. PHY-102)..."
            placeholderTextColor="#969083"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Subject Filter Bar */}
        <View style={styles.filterRow}>
          {['ALL', 'PHYSICS', 'CHEMISTRY', 'MATHEMATICS'].map((subj) => (
            <TouchableOpacity
              key={subj}
              onPress={() => setFilter(subj)}
              style={[
                styles.filterTab,
                filter === subj && styles.filterTabActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === subj && styles.filterTextActive,
                ]}
              >
                {subj}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Topic Matrix Grid */}
        <View style={styles.topicsGrid}>
          {filteredTopics.map((topic) => (
            <BrutalistCard key={topic.id} highlight={topic.highYield}>
              <View style={styles.cardTop}>
                <BrutalistBadge label={topic.code} variant="code" />
                <View style={styles.tagRow}>
                  {topic.highYield && (
                    <BrutalistBadge label="HIGH YIELD" variant="gold" />
                  )}
                  <BrutalistBadge label={topic.tag} variant="live" />
                </View>
              </View>

              <Text style={styles.topicSubject}>{topic.subject}</Text>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.questionCount}>{topic.questions} PRACTICE PROBLEMS</Text>

              <TouchableOpacity
                style={styles.solveBtn}
                onPress={() => router.push('/test')}
              >
                <Text style={styles.solveBtnText}>START SOLVING MODULE →</Text>
              </TouchableOpacity>
            </BrutalistCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#310004',
  },
  topBar: {
    height: 48,
    borderBottomWidth: 1,
    borderColor: '#4b463b',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#310004',
  },
  title: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#ffdad8',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  subTitle: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  searchBox: {
    marginBottom: 12,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#4b463b',
    backgroundColor: '#270003',
    paddingHorizontal: 12,
    color: '#ffdad8',
    fontFamily: 'Lexend, monospace',
    fontSize: 12,
  },
  filterRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#4b463b',
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#270003',
    borderRightWidth: 1,
    borderColor: '#4b463b',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#ffffff',
  },
  filterText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 9,
    color: '#cdc6b7',
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#130f16',
  },
  topicsGrid: {
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 4,
  },
  topicSubject: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#f2bf4b',
    marginTop: 8,
    fontWeight: '700',
  },
  topicTitle: {
    fontFamily: 'Epilogue, sans-serif',
    fontSize: 16,
    fontWeight: '800',
    color: '#ffdad8',
    marginVertical: 4,
  },
  questionCount: {
    fontFamily: 'Lexend, monospace',
    fontSize: 10,
    color: '#cdc6b7',
    marginBottom: 12,
  },
  solveBtn: {
    height: 40,
    backgroundColor: '#480009',
    borderWidth: 1,
    borderColor: '#4b463b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  solveBtnText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 1,
  },
});
