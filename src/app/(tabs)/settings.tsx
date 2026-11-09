// Settings screen. For now: the IGDB login details needed for search.
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function SettingsScreen() {
  const { data, updateSettings } = useStore();
  const [clientId, setClientId] = useState(data.settings.igdbClientId);
  const [secret, setSecret] = useState(data.settings.igdbClientSecret);
  const [saved, setSaved] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.heading}>IGDB (game search)</Text>
        <Text style={styles.help}>
          Search uses the free IGDB database. Create a Twitch developer app to get a Client ID and
          Client Secret, then paste them here. They are stored only on this phone.
        </Text>
        <Pressable onPress={() => Linking.openURL('https://api-docs.igdb.com/#account-creation')}>
          <Text style={styles.link}>How to get IGDB keys →</Text>
        </Pressable>

        <Text style={styles.label}>Client ID</Text>
        <TextInput
          style={styles.input}
          value={clientId}
          onChangeText={(t) => {
            setClientId(t);
            setSaved(false);
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.label}>Client Secret</Text>
        <TextInput
          style={styles.input}
          value={secret}
          onChangeText={(t) => {
            setSecret(t);
            setSaved(false);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <Pressable
          style={styles.button}
          onPress={() => {
            updateSettings({ igdbClientId: clientId.trim(), igdbClientSecret: secret.trim() });
            setSaved(true);
          }}>
          <Text style={styles.buttonText}>{saved ? 'Saved ✓' : 'Save'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, maxWidth: 700, width: '100%', alignSelf: 'center' },
  section: { backgroundColor: colors.card, borderRadius: 12, padding: 16, gap: 8 },
  heading: { color: colors.text, fontSize: 18, fontWeight: '700' },
  help: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  link: { color: colors.accent, fontSize: 14, marginVertical: 4 },
  label: { color: colors.textMuted, fontSize: 13, marginTop: 8 },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: { color: colors.accentText, fontWeight: '600', fontSize: 15 },
});
