import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useMemo } from 'react';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { useAppStore } from '@/store/useAppStore';
import { DOMAINS, getDomainInfo } from '@/constants/Domains';
import type { Knowledge } from '@/store/types';

function StatCard({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: Colors.surface,
      borderRadius: 16,
      borderCurve: 'continuous',
      padding: 16,
      gap: 8,
      boxShadow: '0 2px 8px rgba(27, 94, 32, 0.06)',
    }}>
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        borderCurve: 'continuous',
        backgroundColor: `${color}15`,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={color} />
      </View>
      <Text style={{ fontFamily: Fonts.bold, fontSize: 22, color: Colors.text, fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
      <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.textMuted }}>
        {label}
      </Text>
    </View>
  );
}

function RecentItem({ item, onPress }: { item: Knowledge; onPress: () => void }) {
  const domainInfo = getDomainInfo(item.domain);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({
      opacity: pressed ? 0.7 : 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      backgroundColor: Colors.surface,
      borderRadius: 14,
      borderCurve: 'continuous',
      gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    })}>
      <View style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        borderCurve: 'continuous',
        backgroundColor: `${domainInfo.color}12`,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons name={domainInfo.icon as keyof typeof Ionicons.glyphMap} size={20} color={domainInfo.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>
          {domainInfo.label} — {item.community}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const knowledgeItems = useAppStore((s) => s.knowledgeItems);
  const profile = useAppStore((s) => s.profile);

  const stats = useMemo(() => ({
    total: knowledgeItems.length,
    domains: new Set(knowledgeItems.map((k) => k.domain)).size,
    favorites: knowledgeItems.filter((k) => k.isFavorite).length,
  }), [knowledgeItems]);

  const recentItems = useMemo(() =>
    [...knowledgeItems]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5),
    [knowledgeItems]
  );

  const handleItemPress = useCallback((id: string) => {
    router.push(`/library/${id}`);
  }, [router]);

  const handleCollectPress = useCallback(() => {
    router.push('/(tabs)/collect');
  }, [router]);

  if (!knowledgeItems) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 24, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <View>
          <Text style={{ fontFamily: Fonts.bold, fontSize: 22, color: Colors.primary }}>
            AfriKnowledge
          </Text>
          <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textMuted, marginTop: 2 }}>
            Savoirs traditionnels africains
          </Text>
        </View>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons name="notifications" size={18} color="#fff" />
        </View>
      </View>

      {/* Welcome Card */}
      <View style={{
        backgroundColor: Colors.primary,
        borderRadius: 20,
        borderCurve: 'continuous',
        padding: 22,
        marginBottom: 20,
        boxShadow: '0 6px 20px rgba(27, 94, 32, 0.25)',
      }}>
        <Text style={{ fontFamily: Fonts.bold, fontSize: 18, color: '#fff' }}>
          Bienvenue, {profile.name.split(' ')[0]}
        </Text>
        <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6, lineHeight: 19 }}>
          Collectez et partagez les savoirs traditionnels de votre communauté pour les préserver.
        </Text>
        <Pressable
          onPress={handleCollectPress}
          style={({ pressed }) => ({
            opacity: pressed ? 0.85 : 1,
            backgroundColor: Colors.secondary,
            borderRadius: 12,
            borderCurve: 'continuous',
            paddingVertical: 12,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: 8,
            marginTop: 16,
          })}
        >
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: '#fff' }}>
            Collecter un savoir
          </Text>
        </Pressable>
      </View>

      {/* Stats Row */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <StatCard icon="book" value={stats.total} label="Savoirs collectés" color={Colors.primary} />
        <StatCard icon="grid" value={stats.domains} label="Domaines couverts" color={Colors.secondary} />
        <StatCard icon="heart" value={stats.favorites} label="Favoris" color={Colors.accent} />
      </View>

      {/* Quick Access */}
      <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: Colors.text, marginBottom: 14 }}>
        Explorer par domaine
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginBottom: 24 }}
        contentContainerStyle={{ gap: 10 }}
      >
        {DOMAINS.map((domain) => (
          <Pressable
            key={domain.key}
            onPress={() => router.push(`/(tabs)/library?domain=${domain.key}`)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              backgroundColor: `${domain.color}12`,
              borderRadius: 14,
              borderCurve: 'continuous',
              paddingVertical: 14,
              paddingHorizontal: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderWidth: 1,
              borderColor: `${domain.color}25`,
            })}
          >
            <Ionicons name={domain.icon as keyof typeof Ionicons.glyphMap} size={20} color={domain.color} />
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13, color: domain.color }}>
              {domain.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Recent Activity */}
      <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: Colors.text, marginBottom: 14 }}>
        Activité récente
      </Text>
      <View style={{ gap: 10 }}>
        {recentItems.map((item) => (
          <RecentItem
            key={item.id}
            item={item}
            onPress={() => handleItemPress(item.id)}
          />
        ))}
      </View>

      {recentItems.length === 0 && (
        <View style={{
          padding: 32,
          alignItems: 'center',
          backgroundColor: Colors.surface,
          borderRadius: 16,
          borderCurve: 'continuous',
        }}>
          <Ionicons name="book-outline" size={40} color={Colors.textMuted} />
          <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.textMuted, marginTop: 12, textAlign: 'center' }}>
            Aucun savoir collecté. Commencez par ajouter votre premier savoir traditionnel.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
