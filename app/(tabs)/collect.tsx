import { ScrollView, View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { useAppStore } from '@/store/useAppStore';
import { DOMAINS } from '@/constants/Domains';
import type { KnowledgeDomain, MediaType } from '@/store/types';

const MEDIA_TYPES: { key: MediaType; label: string; icon: string }[] = [
  { key: 'text', label: 'Texte', icon: 'document-text' },
  { key: 'audio', label: 'Audio', icon: 'mic' },
  { key: 'video', label: 'Vidéo', icon: 'videocam' },
  { key: 'photo', label: 'Photo', icon: 'camera' },
];

export default function CollectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setDraftKnowledge = useAppStore((s) => s.setDraftKnowledge);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [domain, setDomain] = useState<KnowledgeDomain | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('text');
  const [community, setCommunity] = useState('');
  const [region, setRegion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingTime(0);
    const interval = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 300) {
          clearInterval(interval);
          setIsRecording(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }, []);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre pour ce savoir.');
      return;
    }
    if (!domain) {
      Alert.alert('Erreur', 'Veuillez sélectionner un domaine.');
      return;
    }
    if (!content.trim() && mediaType === 'text') {
      Alert.alert('Erreur', 'Veuillez entrer le contenu du savoir.');
      return;
    }

    setIsSubmitting(true);
    try {
      const draft = {
        title: title.trim(),
        content: content.trim(),
        domain,
        mediaType,
        community: community.trim() || 'Non spécifié',
        region: region.trim() || 'Non spécifié',
        mediaUri: '',
        status: 'draft' as const,
        createdAt: Date.now(),
      };
      setDraftKnowledge(draft);
      router.push('/review');
    } catch (_err) {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  }, [title, domain, content, mediaType, community, region, setDraftKnowledge, router]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <Text style={{ fontFamily: Fonts.bold, fontSize: 22, color: Colors.text, marginBottom: 6 }}>
        Collecter un savoir
      </Text>
      <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textMuted, marginBottom: 24 }}>
        Enregistrez un savoir traditionnel pour le préserver et le partager.
      </Text>

      {/* Media Type Selection */}
      <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text, marginBottom: 10 }}>
        Type de collecte
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        {MEDIA_TYPES.map((mt) => (
          <Pressable
            key={mt.key}
            onPress={() => setMediaType(mt.key)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              flex: 1,
              paddingVertical: 14,
              borderRadius: 14,
              borderCurve: 'continuous',
              alignItems: 'center',
              gap: 6,
              backgroundColor: mediaType === mt.key ? Colors.primary : Colors.surface,
              borderWidth: 1,
              borderColor: mediaType === mt.key ? Colors.primary : Colors.border,
            })}
          >
            <Ionicons
              name={mt.icon as keyof typeof Ionicons.glyphMap}
              size={22}
              color={mediaType === mt.key ? '#fff' : Colors.textMuted}
            />
            <Text style={{
              fontFamily: Fonts.medium,
              fontSize: 11,
              color: mediaType === mt.key ? '#fff' : Colors.textMuted,
            }}>
              {mt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Audio Recording UI */}
      {(mediaType === 'audio' || mediaType === 'video') && (
        <View style={{
          backgroundColor: Colors.surface,
          borderRadius: 16,
          borderCurve: 'continuous',
          padding: 20,
          alignItems: 'center',
          gap: 14,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: Colors.border,
        }}>
          <Text style={{ fontFamily: Fonts.bold, fontSize: 28, color: Colors.text, fontVariant: ['tabular-nums'] }}>
            {formatTime(recordingTime)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {!isRecording ? (
              <Pressable
                onPress={handleStartRecording}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: Colors.error,
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Ionicons name="mic" size={26} color="#fff" />
              </Pressable>
            ) : (
              <Pressable
                onPress={handleStopRecording}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: Colors.textMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Ionicons name="stop" size={26} color="#fff" />
              </Pressable>
            )}
          </View>
          <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.textMuted }}>
            {isRecording ? 'Enregistrement en cours...' : 'Appuyez pour enregistrer'}
          </Text>
        </View>
      )}

      {/* Title */}
      <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text, marginBottom: 8 }}>
        Titre du savoir
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Ex: Remède traditionnel contre la toux"
        placeholderTextColor={Colors.textMuted}
        style={{
          fontFamily: Fonts.regular,
          fontSize: 15,
          color: Colors.text,
          backgroundColor: Colors.surface,
          borderRadius: 12,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 14,
          marginBottom: 18,
        }}
      />

      {/* Domain Selection */}
      <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text, marginBottom: 10 }}>
        Domaine
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {DOMAINS.map((d) => (
          <Pressable
            key={d.key}
            onPress={() => setDomain(d.key)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 10,
              borderCurve: 'continuous',
              backgroundColor: domain === d.key ? d.color : Colors.surface,
              borderWidth: 1,
              borderColor: domain === d.key ? d.color : Colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            })}
          >
            <Ionicons
              name={d.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={domain === d.key ? '#fff' : d.color}
            />
            <Text style={{
              fontFamily: Fonts.medium,
              fontSize: 13,
              color: domain === d.key ? '#fff' : Colors.text,
            }}>
              {d.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Community */}
      <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text, marginBottom: 8 }}>
        Communauté d'origine
      </Text>
      <TextInput
        value={community}
        onChangeText={setCommunity}
        placeholder="Ex: Mandingue, Yoruba..."
        placeholderTextColor={Colors.textMuted}
        style={{
          fontFamily: Fonts.regular,
          fontSize: 15,
          color: Colors.text,
          backgroundColor: Colors.surface,
          borderRadius: 12,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 14,
          marginBottom: 18,
        }}
      />

      {/* Region */}
      <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text, marginBottom: 8 }}>
        Région
      </Text>
      <TextInput
        value={region}
        onChangeText={setRegion}
        placeholder="Ex: Sénégal - Casamance"
        placeholderTextColor={Colors.textMuted}
        style={{
          fontFamily: Fonts.regular,
          fontSize: 15,
          color: Colors.text,
          backgroundColor: Colors.surface,
          borderRadius: 12,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 14,
          marginBottom: 18,
        }}
      />

      {/* Content */}
      <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text, marginBottom: 8 }}>
        Description / Contenu
      </Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Décrivez le savoir en détail..."
        placeholderTextColor={Colors.textMuted}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        style={{
          fontFamily: Fonts.regular,
          fontSize: 15,
          color: Colors.text,
          backgroundColor: Colors.surface,
          borderRadius: 12,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 14,
          minHeight: 120,
          marginBottom: 24,
        }}
      />

      {/* Submit Button */}
      <Pressable
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={({ pressed }) => ({
          opacity: pressed || isSubmitting ? 0.7 : 1,
          backgroundColor: Colors.primary,
          borderRadius: 14,
          borderCurve: 'continuous',
          paddingVertical: 16,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 10,
          boxShadow: '0 4px 14px rgba(27, 94, 32, 0.2)',
        })}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={{ fontFamily: Fonts.bold, fontSize: 15, color: '#fff' }}>
              Structurer avec l'IA
            </Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}
