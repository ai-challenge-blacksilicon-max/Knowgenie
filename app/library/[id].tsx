import { ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useMemo } from 'react';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { useAppStore } from '@/store/useAppStore';
import { getDomainInfo } from '@/constants/Domains';
import type { MediaType } from '@/store/types';

const MEDIA_LABELS: Record<MediaType, string> = {
  text: 'Texte',
  audio: 'Audio',
  video: 'Vidéo',
  photo: 'Photo',
  mixed: 'Mixte',
};

export default function KnowledgeDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const knowledgeItems = useAppStore((s) => s.knowledgeItems);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const deleteKnowledge = useAppStore((s) => s.deleteKnowledge);
  const updateKnowledge = useAppStore((s) => s.updateKnowledge);

  const item = useMemo(() => knowledgeItems.find((k) => k.id === id), [knowledgeItems, id]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFavorite = useCallback(() => {
    if (id) {
      toggleFavorite(id);
    }
  }, [id, toggleFavorite]);

  const handleDelete = useCallback(() => {
    if (!id) return;
    Alert.alert(
      'Supprimer ce savoir',
      'Cette action est irréversible. Voulez-vous continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteKnowledge(id);
            router.back();
          },
        },
      ]
    );
  }, [id, deleteKnowledge, router]);

  const handleShare = useCallback(() => {
    Alert.alert('Partager', 'Fonctionnalité de partage disponible prochainement.');
  }, []);

  const handleStatusUpdate = useCallback(() => {
    if (!id) return;
    const currentItem = knowledgeItems.find((k) => k.id === id);
    if (!currentItem) return;
    const nextStatus = currentItem.status === 'published' ? 'reviewed' : 'published';
    updateKnowledge(id, { status: nextStatus });
    const label = nextStatus === 'published' ? 'publié' : 'révisé';
    Alert.alert('Statut mis à jour', `Le savoir est maintenant "${label}".`);
  }, [id, knowledgeItems, updateKnowledge]);

  if (!item) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <Ionicons name="alert-circle" size={48} color={Colors.textMuted} />
        <Text style={{ fontFamily: Fonts.medium, fontSize: 15, color: Colors.textMuted, marginTop: 12 }}>
          Savoir non trouvé
        </Text>
        <Pressable onPress={handleBack} style={{ marginTop: 16, padding: 12 }}>
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.primary }}>
            Retour
          </Text>
        </Pressable>
      </View>
    );
  }

  const domainInfo = getDomainInfo(item.domain);
  const date = new Date(item.createdAt);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 40, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Navigation Bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <Pressable onPress={handleBack} style={{ padding: 6 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={handleFavorite} style={{ padding: 8 }}>
            <Ionicons
              name={item.isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={item.isFavorite ? Colors.secondary : Colors.text}
            />
          </Pressable>
          <Pressable onPress={handleShare} style={{ padding: 8 }}>
            <Ionicons name="share-outline" size={22} color={Colors.text} />
          </Pressable>
          <Pressable onPress={handleDelete} style={{ padding: 8 }}>
            <Ionicons name="trash-outline" size={22} color={Colors.error} />
          </Pressable>
        </View>
      </View>

      {/* Domain Badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: `${domainInfo.color}15`,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 10,
          borderCurve: 'continuous',
        }}>
          <Ionicons name={domainInfo.icon as keyof typeof Ionicons.glyphMap} size={15} color={domainInfo.color} />
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 12, color: domainInfo.color }}>
            {domainInfo.label}
          </Text>
        </View>
        <View style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 8,
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.border,
        }}>
          <Text style={{ fontFamily: Fonts.medium, fontSize: 11, color: Colors.textMuted }}>
            {MEDIA_LABELS[item.mediaType]}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text selectable style={{ fontFamily: Fonts.bold, fontSize: 22, color: Colors.text, marginBottom: 12, lineHeight: 30 }}>
        {item.title}
      </Text>

      {/* Metadata */}
      <View style={{
        backgroundColor: Colors.surface,
        borderRadius: 14,
        borderCurve: 'continuous',
        padding: 16,
        gap: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="people" size={16} color={Colors.textMuted} />
          <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary }}>
            Communauté: <Text style={{ fontFamily: Fonts.semiBold }}>{item.community}</Text>
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="location" size={16} color={Colors.textMuted} />
          <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary }}>
            Région: <Text style={{ fontFamily: Fonts.semiBold }}>{item.region}</Text>
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="calendar" size={16} color={Colors.textMuted} />
          <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary }}>
            Collecté le {formattedDate}
          </Text>
        </View>
        {item.aiCategory && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="sparkles" size={16} color={Colors.textMuted} />
            <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary }}>
              {item.aiCategory}
            </Text>
          </View>
        )}
      </View>

      {/* Audio/Video Player Placeholder */}
      {(item.mediaType === 'audio' || item.mediaType === 'video') && (
        <View style={{
          backgroundColor: Colors.surface,
          borderRadius: 14,
          borderCurve: 'continuous',
          padding: 20,
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: Colors.border,
        }}>
          <View style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: `${Colors.primary}15`,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons
              name={item.mediaType === 'audio' ? 'play' : 'videocam'}
              size={24}
              color={Colors.primary}
            />
          </View>
          <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: Colors.textMuted }}>
            {item.mediaType === 'audio' ? 'Lecture audio' : 'Lecture vidéo'}
          </Text>
        </View>
      )}

      {/* Summary */}
      {item.summary && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.text, marginBottom: 8 }}>
            Résumé
          </Text>
          <View style={{
            backgroundColor: `${Colors.primary}08`,
            borderRadius: 12,
            borderCurve: 'continuous',
            padding: 14,
            borderLeftWidth: 3,
            borderLeftColor: Colors.primary,
          }}>
            <Text selectable style={{ fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary, lineHeight: 21 }}>
              {item.summary}
            </Text>
          </View>
        </View>
      )}

      {/* Content */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.text, marginBottom: 8 }}>
          Contenu
        </Text>
        <Text selectable style={{ fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary, lineHeight: 22 }}>
          {item.content}
        </Text>
      </View>

      {/* Transcription */}
      {item.transcription && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.text, marginBottom: 8 }}>
            Transcription
          </Text>
          <Text selectable style={{ fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary, lineHeight: 22, fontStyle: 'italic' }}>
            {item.transcription}
          </Text>
        </View>
      )}

      {/* Keywords */}
      {item.keywords.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.text, marginBottom: 10 }}>
            Mots-clés
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {item.keywords.map((kw) => (
              <View key={`kw-${kw}`} style={{
                backgroundColor: `${Colors.primary}10`,
                borderRadius: 8,
                borderCurve: 'continuous',
                paddingVertical: 6,
                paddingHorizontal: 12,
              }}>
                <Text style={{ fontFamily: Fonts.medium, fontSize: 12, color: Colors.primary }}>
                  {kw}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Status Action */}
      {item.status !== 'draft' && (
        <Pressable
          onPress={handleStatusUpdate}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            backgroundColor: Colors.surface,
            borderRadius: 14,
            borderCurve: 'continuous',
            paddingVertical: 14,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: Colors.border,
          })}
        >
          <Ionicons name="checkmark-done" size={18} color={Colors.primary} />
          <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.primary }}>
            {item.status === 'published' ? 'Marquer comme révisé' : 'Republier'}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
