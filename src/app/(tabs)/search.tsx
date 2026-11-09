// Search screen: find games on IGDB and add them to a list.
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GameCover } from '@/components/GameCover';
import { StatusPicker } from '@/components/StatusPicker';
import { searchGames } from '@/lib/igdb';
import { useIsWide } from '@/lib/layout';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { STATUSES, type SearchResult } from '@/lib/types';

export default function SearchScreen() {
  const { data, addFromSearch } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState<SearchResult | null>(null);
  const wide = useIsWide();

  // Each search gets a number, so a slow old answer can't overwrite a newer one.
  const latestSearch = useRef(0);

  const runSearch = useCallback(
    async (text: string) => {
      const q = text.trim();
      const searchNumber = ++latestSearch.current;
      if (q.length < 2) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const found = await searchGames(q, data.settings);
        if (searchNumber === latestSearch.current) setResults(found);
      } catch (e) {
        if (searchNumber === latestSearch.current) {
          setError(e instanceof Error ? e.message : 'Search failed.');
          setResults([]);
        }
      } finally {
        if (searchNumber === latestSearch.current) setLoading(false);
      }
    },
    [data.settings],
  );

  // Search as you type: wait until typing pauses for a moment, then search.
  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const statusLabel = (r: SearchResult) => {
    const g = data.games[`igdb-${r.igdbId}`];
    return g ? STATUSES.find((s) => s.key === g.status)?.label : undefined;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search games…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => runSearch(query)}
          returnKeyType="search"
          autoCorrect={false}
        />
        <Pressable style={styles.button} onPress={() => runSearch(query)}>
          <Text style={styles.buttonText}>Search</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator color={colors.accent} style={{ marginTop: 30 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        key={wide ? 'wide' : 'narrow'}
        data={results}
        numColumns={wide ? 2 : 1}
        keyExtractor={(r) => String(r.igdbId)}
        contentContainerStyle={{ padding: 8, paddingBottom: 24 }}
        columnWrapperStyle={wide ? { gap: 8 } : undefined}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const inList = statusLabel(item);
          return (
            <View style={[styles.row, wide && { flex: 1 }]}>
              <GameCover uri={item.coverUrl} name={item.name} width={60} />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {item.releaseYear ?? 'TBA'}
                </Text>
                <Text style={styles.meta} numberOfLines={2}>
                  {item.platforms.join(' · ')}
                </Text>
              </View>
              <Pressable
                style={[styles.addButton, inList && styles.addedButton]}
                onPress={() => setPicking(item)}>
                <Text style={styles.addText}>{inList ?? '+ Add'}</Text>
              </Pressable>
            </View>
          );
        }}
      />

      <StatusPicker
        visible={!!picking}
        title={picking ? `Add "${picking.name}" to…` : ''}
        current={picking ? data.games[`igdb-${picking.igdbId}`]?.status : undefined}
        onPick={(status) => {
          if (picking) addFromSearch(picking, status);
          setPicking(null);
        }}
        onClose={() => setPicking(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { flexDirection: 'row', padding: 8, gap: 8 },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  buttonText: { color: colors.accentText, fontWeight: '600', fontSize: 15 },
  error: { color: colors.danger, padding: 16, fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  info: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: '600' },
  meta: { color: colors.textMuted, fontSize: 12 },
  addButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addedButton: { backgroundColor: colors.cardBorder },
  addText: { color: colors.accentText, fontSize: 13, fontWeight: '600' },
});
