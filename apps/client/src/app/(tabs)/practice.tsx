import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BrutalistBadge, BrutalistCard, BrutalistButton } from '@/components/brutalist-ui';
import { api } from '@/services/api';

export default function PracticeBrowserScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [chaptersList, setChaptersList] = useState<any[]>([]);

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      setLoading(true);
      const data = await api.getSubjectsMetadata();
      setChaptersList(data.chapters || []);
    } catch (err) {
      console.warn('Metadata error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = chaptersList.filter((c) => {
    const matchesSubj = filter === 'ALL' || c.subject?.toUpperCase() === filter;
    const matchesSearch = (c.chapter || '').toLowerCase().includes(search.toLowerCase());
    return matchesSubj && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Text style={styles.title}>PRACTICE BROWSER // PYQ MATRIX</Text>
        <Text style={styles.subTitle}>{filtered.length} MODULES</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quick Launch Header Buttons */}
        <View style={styles.quickLaunchBox}>
          <BrutalistButton
            title="🔥 LAUNCH SPEED DRILL (RAPID FIRE)"
            variant="primary"
            onPress={() => router.push('/rapid-fire')}
          />
          <BrutalistButton
            title="📝 GENERATE CUSTOM EXAM PAPER"
            variant="secondary"
            onPress={() => router.push('/paper-exam')}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="SEARCH CHAPTER OR TOPIC (e.g. Rotational, Optics)..."
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
              style={[styles.filterTab, filter === subj && styles.filterTabActive]}
            >
              <Text style={[styles.filterText, filter === subj && styles.filterTextActive]}>{subj}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Topic Matrix Grid */}
        {loading ? (
          <ActivityIndicator color="#f2bf4b" style={{ marginVertical: 20 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No matching PYQ chapters found.</Text>
          </View>
        ) : (
          <View style={styles.topicsGrid}>
            {filtered.map((item, idx) => (
              <BrutalistCard key={`${item.subject}-${item.chapter}-${idx}`}>
                <View style={styles.cardTop}>
                  <BrutalistBadge label={item.subject?.toUpperCase()} variant="gold" />
                  <BrutalistBadge label={`${item.count} PYQs`} variant="live" />
                </View>

                <Text style={styles.topicSubject}>{item.subject}</Text>
                <Text style={styles.topicTitle}>{item.chapter || 'General Practice Set'}</Text>
                <Text style={styles.questionCount}>{item.count} Questions in Vector Database</Text>

                <TouchableOpacity
                  style={styles.solveBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/rapid-fire',
                      params: { mode: 'RAPID_FIRE', subject: item.subject, topic: item.chapter },
                    })
                  }
                >
                  <Text style={styles.solveBtnText}>SOLVE THIS MODULE →</Text>
                </TouchableOpacity>
              </BrutalistCard>
            ))}
          </View>
        )}
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
  quickLaunchBox: {
    gap: 8,
    marginBottom: 16,
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
  emptyCard: {
    padding: 24,
    backgroundColor: '#270003',
    borderWidth: 1,
    borderColor: '#4b463b',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Lexend, monospace',
    fontSize: 11,
    color: '#cdc6b7',
  },
});
