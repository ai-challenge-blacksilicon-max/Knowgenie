import { ScrollView, View, Text, Pressable, TextInput, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { useAppStore } from '@/store/useAppStore';

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 14,
      })}
    >
      <View style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        borderCurve: 'continuous',
        backgroundColor: `${Colors.primary}10`,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={17} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: Colors.text }}>
          {label}
        </Text>
        {value && (
          <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.textMuted, marginTop: 1 }}>
            {value}
          </Text>
        )}
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const preferences = useAppStore((s) => s.preferences);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const knowledgeItems = useAppStore((s) => s.knowledgeItems);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editCommunity, setEditCommunity] = useState(profile.community);
  const [editRegion, setEditRegion] = useState(profile.region);

  const myContributions = knowledgeItems.filter((k) => k.status === 'published').length;
  const myFavorites = knowledgeItems.filter((k) => k.isFavorite).length;

  const handleSaveProfile = useCallback(() => {
    if (!editName.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide.');
      return;
    }
    updateProfile({
      name: editName.trim(),
      community: editCommunity.trim(),
      region: editRegion.trim(),
    });
    setIsEditing(false);
  }, [editName, editCommunity, editRegion, updateProfile]);

  const handleToggleNotifications = useCallback((value: boolean) => {
    updatePreferences({ notifications: value });
  }, [updatePreferences]);

  const handleLanguagePress = useCallback(() => {
    Alert.alert(
      'Langue',
      'Sélectionnez votre langue préférée',
      [
        { text: 'Français', onPress: () => updatePreferences({ language: 'fr' }) },
        { text: 'English', onPress: () => updatePreferences({ language: 'en' }) },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  }, [updatePreferences]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <Text style={{ fontFamily: Fonts.bold, fontSize: 22, color: Colors.text }}>
          Profil
        </Text>
      </View>

      {/* Profile Card */}
      <View style={{
        marginHorizontal: 20,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        borderCurve: 'continuous',
        padding: 22,
        marginBottom: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 22, color: '#fff' }}>
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            {isEditing ? (
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={{
                  fontFamily: Fonts.bold,
                  fontSize: 18,
                  color: Colors.text,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.primary,
                  paddingVertical: 2,
                }}
              />
            ) : (
              <Text style={{ fontFamily: Fonts.bold, fontSize: 18, color: Colors.text }}>
                {profile.name}
              </Text>
            )}
            <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textMuted, marginTop: 2 }}>
              {profile.community} — {profile.region}
            </Text>
          </View>
          <Pressable
            onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
            style={{ padding: 8 }}
          >
            <Ionicons
              name={isEditing ? 'checkmark' : 'create'}
              size={20}
              color={Colors.primary}
            />
          </Pressable>
        </View>

        {isEditing && (
          <View style={{ gap: 12, marginBottom: 12 }}>
            <TextInput
              value={editCommunity}
              onChangeText={setEditCommunity}
              placeholder="Communauté"
              placeholderTextColor={Colors.textMuted}
              style={{
                fontFamily: Fonts.regular,
                fontSize: 14,
                color: Colors.text,
                backgroundColor: Colors.background,
                borderRadius: 10,
                padding: 12,
              }}
            />
            <TextInput
              value={editRegion}
              onChangeText={setEditRegion}
              placeholder="Région"
              placeholderTextColor={Colors.textMuted}
              style={{
                fontFamily: Fonts.regular,
                fontSize: 14,
                color: Colors.text,
                backgroundColor: Colors.background,
                borderRadius: 10,
                padding: 12,
              }}
            />
          </View>
        )}

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{
            flex: 1,
            backgroundColor: Colors.background,
            borderRadius: 12,
            borderCurve: 'continuous',
            padding: 14,
            alignItems: 'center',
          }}>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 20, color: Colors.primary, fontVariant: ['tabular-nums'] }}>
              {myContributions}
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>
              Contributions
            </Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: Colors.background,
            borderRadius: 12,
            borderCurve: 'continuous',
            padding: 14,
            alignItems: 'center',
          }}>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 20, color: Colors.secondary, fontVariant: ['tabular-nums'] }}>
              {myFavorites}
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>
              Favoris
            </Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={{
        marginHorizontal: 20,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderCurve: 'continuous',
        overflow: 'hidden',
        marginBottom: 20,
        boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
      }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Paramètres
          </Text>
        </View>
        <SettingsRow
          icon="language"
          label="Langue"
          value={preferences.language === 'fr' ? 'Français' : 'English'}
          onPress={handleLanguagePress}
        />
        <View style={{ height: 1, backgroundColor: Colors.borderLight, marginHorizontal: 16 }} />
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 16,
          gap: 14,
        }}>
          <View style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            borderCurve: 'continuous',
            backgroundColor: `${Colors.primary}10`,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="notifications" size={17} color={Colors.primary} />
          </View>
          <Text style={{ flex: 1, fontFamily: Fonts.medium, fontSize: 14, color: Colors.text }}>
            Notifications
          </Text>
          <Switch
            value={preferences.notifications}
            onValueChange={handleToggleNotifications}
            trackColor={{ true: Colors.primary, false: Colors.border }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* About */}
      <View style={{
        marginHorizontal: 20,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderCurve: 'continuous',
        overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
      }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            À propos
          </Text>
        </View>
        <SettingsRow
          icon="information-circle"
          label="À propos d'AfriKnowledge"
          value="Version 1.0.0"
          showArrow={false}
        />
        <View style={{ height: 1, backgroundColor: Colors.borderLight, marginHorizontal: 16 }} />
        <SettingsRow
          icon="shield-checkmark"
          label="Politique de confidentialité"
          onPress={() => Alert.alert('Politique de confidentialité', 'Vos données sont stockées localement sur votre appareil.')}
        />
      </View>
    </ScrollView>
  );
}
