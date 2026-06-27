import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useMemo, useCallback } from 'react';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { useAppStore } from '@/store/useAppStore';
import { DOMAINS, getDomainInfo } from '@/constants/Domains';
import type { Knowledge, KnowledgeDomain, MediaType } from '@/store/types';

const MEDIA_ICONS: Record<MediaType, string> = {
  text: 'document-text',
  audio: 'musical-note',
  video: 'videocam',
  photo: 'image',
  mixed: 'layers',
};

function KnowledgeCard({ item, onPress }: { item: Knowledge; onPress: () => void }) {
  const domainInfo = getDomainInfo(item.domain);

  return (
    <View style={{
      backgroundColor: Colors.surface,
      borderRadius: 16,
      borderCurve: 'continuous',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      marginBottom: 12,
    }}>
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
        <View style={{ padding: 16, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: `${domainInfo.color}12`,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}>
              <Ionicons name={domainInfo.icon as keyof typeof Ionicons.glyphMap} size={13} color={domainInfo.color} />
              <Text style={{ fontFamily: Fonts.medium, fontSize: 11, color: domainInfo.color }}>
                {domainInfo.label}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons
                name={MEDIA_ICONS[item.mediaType] as keyof typeof Ionicons.glyphMap}
                size={14}
                color={Colors.textMuted}
              />
              {item.isFavorite && (
                <Ionicons name="heart" size={14} color={Colors.secondary} />
              )}
            </View>
          </View>
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.text }} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 }} numberOfLines={2}>
            {item.summary || item.content}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <Ionicons name="people" size={12} color={Colors.textMuted} />
            <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: Colors.textMuted }}>
              {item.community} — {item.region}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ domain?: string }>();
  const knowledgeItems = useAppStore((s) => s.knowledgeItems);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<KnowledgeDomain | 'all'>(
    (params.domain as KnowledgeDomain) || 'all'
  );

  const filteredItems = useMemo(() => {
    let items = knowledgeItems.filter((k) => k.status === 'published');

    if (selectedDomain !== 'all') {
      items = items.filter((k) => k.domain === selectedDomain);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((k) =>
        k.title.toLowerCase().includes(q) ||
        k.content.toLowerCase().includes(q) ||
        k.community.toLowerCase().includes(q) ||
        k.keywords.some((kw) => kw.toLowerCase().includes(q))
      );
    }

    return items.sort((a, b) => b.createdAt - a.createdAt);
  }, [knowledgeItems, selectedDomain, searchQuery]);

  const handleItemPress = useCallback((id: string) => {
    router.push(`/library/${id}`);
  }, [router]);

  const handleDomainPress = useCallback((domain: KnowledgeDomain | 'all') => {
    setSelectedDomain(domain);
  }, []);

  const renderItem = useCallback(({ item }: { item: Knowledge }) => (
    <KnowledgeCard item={item} onPress={() => handleItemPress(item.id)} />
  ), [handleItemPress]);

  const keyExtractor = useCallback((item: Knowledge) => item.id, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 12 }}>
        <Text style={{ fontFamily: Fonts.bold, fontSize: 22, color: Colors.text, marginBottom: 14 }}>
          Bibliothèque des savoirs
        </Text>

        {/* Search */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.surface,
          borderRadius: 12,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: Colors.border,
          paddingHorizontal: 14,
          gap: 10,
          marginBottom: 14,
        }}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher un savoir..."
            placeholderTextColor={Colors.textMuted}
            style={{
              flex: 1,
              fontFamily: Fonts.regular,
              fontSize: 14,
              color: Colors.text,
              paddingVertical: 12,
            }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Domain Filters */}
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Pressable
            onPress={() => handleDomainPress('all')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 10,
              borderCurve: 'continuous',
              backgroundColor: selectedDomain === 'all' ? Colors.primary : Colors.surface,
              borderWidth: 1,
              borderColor: selectedDomain === 'all' ? Colors.primary : Colors.border,
            })}
          >
            <Text style={{
              fontFamily: Fonts.medium,
              fontSize: 12,
              color: selectedDomain === 'all' ? '#fff' : Colors.text,
            }}>
              Tous
            </Text>
          </Pressable>
          {DOMAINS.map((d) => (
            <Pressable
              key={d.key}
              onPress={() => handleDomainPress(d.key)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 10,
                borderCurve: 'continuous',
                backgroundColor: selectedDomain === d.key ? d.color : Colors.surface,
                borderWidth: 1,
                borderColor: selectedDomain === d.key ? d.color : Colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              })}
            >
              <Ionicons
                name={d.icon as keyof typeof Ionicons.glyphMap}
                size={13}
                color={selectedDomain === d.key ? '#fff' : d.color}
              />
              <Text style={{
                fontFamily: Fonts.medium,
                fontSize: 12,
                color: selectedDomain === d.key ? '#fff' : Colors.text,
              }}>
                {d.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{
            padding: 40,
            alignItems: 'center',
            backgroundColor: Colors.surface,
            borderRadius: 16,
            borderCurve: 'continuous',
            marginTop: 20,
          }}>
            <Ionicons name="search" size={40} color={Colors.textMuted} />
            <Text style={{ fontFamily: Fonts.medium, fontSize: 15, color: Colors.textMuted, marginTop: 12, textAlign: 'center' }}>
              Aucun savoir trouvé
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textMuted, marginTop: 4, textAlign: 'center' }}>
              Essayez avec d'autres critères de recherche.
            </Text>
          </View>
        }
      />
    </View>
  );
}
