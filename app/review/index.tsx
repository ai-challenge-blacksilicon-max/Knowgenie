import { ScrollView, View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { useAppStore } from '@/store/useAppStore';
import { useTextGeneration } from '@fastshot/ai';
import { getDomainInfo } from '@/constants/Domains';

function parseAIResponse(text: string, fallbackContent: string, fallbackDomain: string) {
  const lines = text.split('\n').filter((l) => l.trim());
  const summaryLine = lines.find((l) => l.startsWith('RESUME:'));
  const keywordsLine = lines.find((l) => l.startsWith('MOTS-CLES:'));
  const categoryLine = lines.find((l) => l.startsWith('CATEGORIE:'));

  const parsedSummary = summaryLine
    ? summaryLine.replace('RESUME:', '').trim()
    : fallbackContent.substring(0, 150);

  const parsedKeywords = keywordsLine
    ? keywordsLine.replace('MOTS-CLES:', '').trim().split(',').map((k) => k.trim())
    : ['savoir traditionnel', fallbackDomain];

  const parsedCategory = categoryLine
    ? categoryLine.replace('CATEGORIE:', '').trim()
    : `${fallbackDomain} - Savoir local`;

  return { parsedSummary, parsedKeywords, parsedCategory };
}

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const draftKnowledge = useAppStore((s) => s.draftKnowledge);
  const setDraftKnowledge = useAppStore((s) => s.setDraftKnowledge);
  const addKnowledge = useAppStore((s) => s.addKnowledge);

  const { generateText, isLoading: isGenerating } = useTextGeneration();

  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [aiCategory, setAiCategory] = useState('');
  const [isProcessed, setIsProcessed] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (!draftKnowledge?.content || hasProcessed.current) return;
    hasProcessed.current = true;

    const runAI = async () => {
      const fallbackContent = draftKnowledge.content || '';
      const fallbackDomain = draftKnowledge.domain || 'culture';

      try {
        const prompt = `Analyse ce savoir traditionnel africain et fournis:
1. Un résumé en 2 phrases maximum
2. 4-6 mots-clés pertinents séparés par des virgules
3. Une catégorie précise

Titre: ${draftKnowledge.title}
Domaine: ${draftKnowledge.domain}
Communauté: ${draftKnowledge.community}
Contenu: ${draftKnowledge.content}

Réponds en format:
RESUME: [résumé]
MOTS-CLES: [mot1, mot2, mot3, ...]
CATEGORIE: [catégorie]`;

        const result = await generateText(prompt);
        if (result) {
          const { parsedSummary, parsedKeywords, parsedCategory } = parseAIResponse(
            result, fallbackContent, fallbackDomain
          );
          setSummary(parsedSummary);
          setKeywords(parsedKeywords);
          setAiCategory(parsedCategory);
        } else {
          setSummary(fallbackContent.substring(0, 150));
          setKeywords(['savoir traditionnel', fallbackDomain]);
          setAiCategory(`${fallbackDomain} - Savoir local`);
        }
      } catch (_err) {
        setSummary(fallbackContent.substring(0, 150));
        setKeywords(['savoir traditionnel', fallbackDomain]);
        setAiCategory(`${fallbackDomain} - Savoir local`);
      }
      setIsProcessed(true);
    };

    runAI();
  }, [draftKnowledge, generateText]);

  const handlePublish = useCallback(() => {
    if (!draftKnowledge) return;

    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 20; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    addKnowledge({
      id,
      title: draftKnowledge.title || '',
      content: draftKnowledge.content || '',
      domain: draftKnowledge.domain || 'culture',
      community: draftKnowledge.community || 'Non spécifié',
      region: draftKnowledge.region || 'Non spécifié',
      mediaType: draftKnowledge.mediaType || 'text',
      mediaUri: draftKnowledge.mediaUri || '',
      transcription: '',
      keywords,
      summary,
      aiCategory,
      status: 'published',
      createdAt: Date.now(),
      isFavorite: false,
    });

    setDraftKnowledge(null);
    Alert.alert('Savoir publié', 'Votre savoir a été ajouté à la bibliothèque.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [draftKnowledge, keywords, summary, aiCategory, addKnowledge, setDraftKnowledge, router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (!draftKnowledge) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <Ionicons name="alert-circle" size={48} color={Colors.textMuted} />
        <Text style={{ fontFamily: Fonts.medium, fontSize: 15, color: Colors.textMuted, marginTop: 12 }}>
          Aucun brouillon trouvé
        </Text>
        <Pressable onPress={handleBack} style={{ marginTop: 16, padding: 12 }}>
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.primary }}>
            Retour
          </Text>
        </Pressable>
      </View>
    );
  }

  const domainInfo = draftKnowledge.domain ? getDomainInfo(draftKnowledge.domain) : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Pressable onPress={handleBack} style={{ padding: 6 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: Fonts.bold, fontSize: 20, color: Colors.text }}>
            Revue par l'IA
          </Text>
          <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.textMuted }}>
            Vérifiez les suggestions avant de publier
          </Text>
        </View>
      </View>

      {/* AI Processing Indicator */}
      {isGenerating && (
        <View style={{
          backgroundColor: `${Colors.primary}10`,
          borderRadius: 14,
          borderCurve: 'continuous',
          padding: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: `${Colors.primary}25`,
        }}>
          <ActivityIndicator color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.primary }}>
              Analyse en cours...
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>
              L'IA structure votre savoir
            </Text>
          </View>
        </View>
      )}

      {/* Draft Preview */}
      <View style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderCurve: 'continuous',
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
      }}>
        <Text style={{ fontFamily: Fonts.bold, fontSize: 16, color: Colors.text, marginBottom: 8 }}>
          {draftKnowledge.title}
        </Text>
        {domainInfo && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <View style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              backgroundColor: `${domainInfo.color}15`,
            }}>
              <Text style={{ fontFamily: Fonts.medium, fontSize: 11, color: domainInfo.color }}>
                {domainInfo.label}
              </Text>
            </View>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.textMuted }}>
              {draftKnowledge.community} — {draftKnowledge.region}
            </Text>
          </View>
        )}
        <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }} numberOfLines={4}>
          {draftKnowledge.content}
        </Text>
      </View>

      {/* AI Suggestions */}
      {isProcessed && (
        <>
          {/* Summary */}
          <View style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            borderCurve: 'continuous',
            padding: 18,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: Colors.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="sparkles" size={16} color={Colors.secondary} />
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text }}>
                  Résumé généré
                </Text>
              </View>
              <Pressable onPress={() => setEditingSummary(!editingSummary)} style={{ padding: 4 }}>
                <Ionicons name={editingSummary ? 'checkmark' : 'create'} size={18} color={Colors.primary} />
              </Pressable>
            </View>
            {editingSummary ? (
              <TextInput
                value={summary}
                onChangeText={setSummary}
                multiline
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 13,
                  color: Colors.text,
                  backgroundColor: Colors.background,
                  borderRadius: 10,
                  padding: 12,
                  minHeight: 60,
                }}
              />
            ) : (
              <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>
                {summary}
              </Text>
            )}
          </View>

          {/* Keywords */}
          <View style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            borderCurve: 'continuous',
            padding: 18,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: Colors.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Ionicons name="pricetags" size={16} color={Colors.secondary} />
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text }}>
                Mots-clés extraits
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {keywords.map((kw) => (
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

          {/* Category */}
          <View style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            borderCurve: 'continuous',
            padding: 18,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: Colors.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Ionicons name="folder" size={16} color={Colors.secondary} />
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.text }}>
                Catégorie suggérée
              </Text>
            </View>
            <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: Colors.textSecondary }}>
              {aiCategory}
            </Text>
          </View>

          {/* Actions */}
          <View style={{ gap: 12 }}>
            <Pressable
              onPress={handlePublish}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
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
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={{ fontFamily: Fonts.bold, fontSize: 15, color: '#fff' }}>
                Valider et Publier
              </Text>
            </Pressable>
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                backgroundColor: Colors.surface,
                borderRadius: 14,
                borderCurve: 'continuous',
                paddingVertical: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: Colors.border,
              })}
            >
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.text }}>
                Modifier
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}
