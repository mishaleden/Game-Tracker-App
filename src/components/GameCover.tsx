import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/lib/theme';

/** Box-art image with a placeholder when there is no cover. Keeps the 3:4 game-box shape. */
export function GameCover({ uri, name, width }: { uri?: string; name: string; width: number }) {
  const height = Math.round(width * (4 / 3));
  if (!uri) {
    return (
      <View style={[styles.placeholder, { width, height }]}>
        <Text style={styles.placeholderText} numberOfLines={4}>
          {name}
        </Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={{ width, height, borderRadius: 6, backgroundColor: colors.card }}
      contentFit="cover"
      transition={150}
      cachePolicy="disk"
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  placeholderText: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
});
