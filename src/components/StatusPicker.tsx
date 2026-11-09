import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/lib/theme';
import { STATUSES, type GameStatus } from '@/lib/types';

/** Pop-up that asks "which list?" and calls onPick with the chosen list. */
export function StatusPicker({
  visible,
  title,
  current,
  onPick,
  onRemove,
  favourite,
  onToggleFavourite,
  onClose,
}: {
  visible: boolean;
  title: string;
  current?: GameStatus;
  onPick: (status: GameStatus) => void;
  onRemove?: () => void;
  favourite?: boolean;
  onToggleFavourite?: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {STATUSES.map((s) => (
            <Pressable
              key={s.key}
              style={[styles.option, current === s.key && styles.optionActive]}
              onPress={() => onPick(s.key)}>
              <Text style={styles.optionText}>
                {s.label}
                {current === s.key ? '  ✓' : ''}
              </Text>
            </Pressable>
          ))}
          {onToggleFavourite && (
            <Pressable style={styles.option} onPress={onToggleFavourite}>
              <Text style={[styles.optionText, { color: colors.favourite }]}>
                {favourite ? '★ Remove from Favourites' : '☆ Add to Favourites'}
              </Text>
            </Pressable>
          )}
          {onRemove && (
            <Pressable style={styles.option} onPress={onRemove}>
              <Text style={[styles.optionText, { color: colors.danger }]}>Remove from library</Text>
            </Pressable>
          )}
          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  title: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  option: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8 },
  optionActive: { backgroundColor: colors.cardBorder },
  optionText: { color: colors.text, fontSize: 16 },
  cancel: { paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  cancelText: { color: colors.textMuted, fontSize: 15 },
});
