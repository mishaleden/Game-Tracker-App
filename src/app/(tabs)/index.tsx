// Library screen: your games, filtered by list (Playing, Completed, ...).
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { GameCover } from '@/components/GameCover';
import { StatusPicker } from '@/components/StatusPicker';
import { useGridColumns } from '@/lib/layout';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { STATUSES, type GameStatus, type TrackedGame } from '@/lib/types';

type Filter = GameStatus | 'favourites';

const FILTERS: { key: Filter; label: string }[] = [
  ...STATUSES,
  { key: 'favourites', label: 'Favourites' },
];

export default function LibraryScreen() {
  const { data, loaded, updateGame, removeGame } = useStore();
  const [filter, setFilter] = useState<Filter>('playing');
  const [editing, setEditing] = useState<TrackedGame | null>(null);
  const columns = useGridColumns();
  const { width } = useWindowDimensions();
  const gap = 10;
  const itemWidth = Math.floor((width - 16 - gap * (columns - 1)) / columns);

  const all = useMemo(() => Object.values(data.games), [data.games]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { favourites: 0 };
    for (const g of all) {
      c[g.status] = (c[g.status] ?? 0) + 1;
      if (g.favourite) c.favourites++;
    }
    return c;
  }, [all]);

  const games = useMemo(
    () =>
      all
        .filter((g) => (filter === 'favourites' ? g.favourite : g.status === filter))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [all, filter],
  );

  return (
    <View style={styles.container}>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, filter === f.key && styles.chipActive]}>
              <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
                {f.label} {counts[f.key] ? `(${counts[f.key]})` : ''}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        key={columns} // FlatList needs a fresh key when the column count changes (folding/unfolding)
        data={games}
        numColumns={columns}
        keyExtractor={(g) => g.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap }}
        ListEmptyComponent={
          loaded ? (
            <Text style={styles.empty}>
              Nothing here yet.{'\n'}Use the Search tab to add games.
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <Pressable style={{ width: itemWidth, marginBottom: 14 }} onPress={() => setEditing(item)}>
            <GameCover uri={item.coverUrl} name={item.name} width={itemWidth} />
            <Text style={styles.name} numberOfLines={2}>
              {item.favourite ? '★ ' : ''}
              {item.name}
            </Text>
          </Pressable>
        )}
      />

      <StatusPicker
        visible={!!editing}
        title={editing?.name ?? ''}
        current={editing?.status}
        onPick={(status) => {
          if (editing) updateGame(editing.id, { status });
          setEditing(null);
        }}
        favourite={editing?.favourite}
        onToggleFavourite={() => {
          if (editing) updateGame(editing.id, { favourite: !editing.favourite });
          setEditing(null);
        }}
        onRemove={() => {
          if (editing) removeGame(editing.id);
          setEditing(null);
        }}
        onClose={() => setEditing(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  chips: { paddingHorizontal: 8, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textMuted, fontSize: 14 },
  chipTextActive: { color: colors.accentText, fontWeight: '600' },
  grid: { paddingHorizontal: 8, paddingBottom: 24 },
  name: { color: colors.text, fontSize: 13, marginTop: 6 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, lineHeight: 22 },
});
