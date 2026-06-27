import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback, useRef, useMemo } from 'react';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { useAppStore } from '@/store/useAppStore';
import { useTextGeneration } from '@fastshot/ai';
import type { ChatMessage } from '@/store/types';

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <View style={{
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '82%',
      marginBottom: 12,
    }}>
      {!isUser && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <View style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="sparkles" size={12} color="#fff" />
          </View>
          <Text style={{ fontFamily: Fonts.medium, fontSize: 11, color: Colors.textMuted }}>
            Assistant IA
          </Text>
        </View>
      )}
      <View style={{
        backgroundColor: isUser ? Colors.primary : Colors.surface,
        borderRadius: 16,
        borderCurve: 'continuous',
        padding: 14,
        borderBottomRightRadius: isUser ? 4 : 16,
        borderBottomLeftRadius: isUser ? 16 : 4,
        boxShadow: isUser ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
        borderWidth: isUser ? 0 : 1,
        borderColor: Colors.borderLight,
      }}>
        <Text selectable style={{
          fontFamily: Fonts.regular,
          fontSize: 14,
          color: isUser ? '#fff' : Colors.text,
          lineHeight: 20,
        }}>
          {message.content}
        </Text>
      </View>
      <Text style={{
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: Colors.textMuted,
        marginTop: 4,
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        marginHorizontal: 4,
      }}>
        {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const SUGGESTIONS = [
  'Quels remèdes traditionnels contre la fièvre ?',
  'Parle-moi des techniques agricoles sahéliennes',
  'Quels sont les artisanats textiles africains ?',
];

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const chatMessages = useAppStore((s) => s.chatMessages);
  const addChatMessage = useAppStore((s) => s.addChatMessage);
  const clearChat = useAppStore((s) => s.clearChat);
  const knowledgeItems = useAppStore((s) => s.knowledgeItems);
  const flatListRef = useRef<FlatList>(null);

  const [inputText, setInputText] = useState('');
  const { generateText, isLoading } = useTextGeneration();

  const sortedMessages = useMemo(() =>
    [...chatMessages].sort((a, b) => a.timestamp - b.timestamp),
    [chatMessages]
  );

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessageId = `msg-${Date.now()}-u`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
      relatedKnowledgeIds: [],
    };
    addChatMessage(userMessage);
    setInputText('');

    try {
      const knowledgeContext = knowledgeItems
        .filter((k) => k.status === 'published')
        .slice(0, 10)
        .map((k) => `- ${k.title} (${k.domain}, ${k.community}): ${k.summary || k.content.substring(0, 100)}`)
        .join('\n');

      const prompt = `Tu es un assistant IA spécialisé dans les savoirs traditionnels africains. Tu réponds en français de manière informative et respectueuse des cultures.

Base de connaissances disponible:
${knowledgeContext}

Question de l'utilisateur: ${trimmed}

Réponds de manière concise et utile, en te basant sur la base de connaissances quand c'est pertinent. Si tu ne trouves pas l'information exacte, donne une réponse informative générale sur le sujet.`;

      const result = await generateText(prompt);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: result || 'Je suis désolé, je n\'ai pas pu générer une réponse. Veuillez réessayer.',
        timestamp: Date.now(),
        relatedKnowledgeIds: [],
      };
      addChatMessage(assistantMessage);
    } catch (_err) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-e`,
        role: 'assistant',
        content: 'Une erreur est survenue. Veuillez vérifier votre connexion et réessayer.',
        timestamp: Date.now(),
        relatedKnowledgeIds: [],
      };
      addChatMessage(errorMessage);
    }

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [isLoading, addChatMessage, knowledgeItems, generateText]);

  const handleSend = useCallback(() => {
    sendMessage(inputText);
  }, [inputText, sendMessage]);

  const handleClearChat = useCallback(() => {
    if (chatMessages.length === 0) return;
    Alert.alert(
      'Effacer la conversation',
      'Voulez-vous supprimer tout l\'historique de chat ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Effacer', style: 'destructive', onPress: () => clearChat() },
      ]
    );
  }, [chatMessages.length, clearChat]);

  const handleSuggestion = useCallback((suggestion: string) => {
    sendMessage(suggestion);
  }, [sendMessage]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} />
  ), []);

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 20,
        paddingBottom: 12,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            borderCurve: 'continuous',
            backgroundColor: `${Colors.primary}15`,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="sparkles" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 17, color: Colors.text }}>
              Assistant IA
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.textMuted }}>
              Posez vos questions sur les savoirs traditionnels
            </Text>
          </View>
          {chatMessages.length > 0 && (
            <Pressable onPress={handleClearChat} style={{ padding: 8 }}>
              <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={sortedMessages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 20, paddingBottom: 10, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              borderCurve: 'continuous',
              backgroundColor: `${Colors.primary}12`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="chatbubbles" size={30} color={Colors.primary} />
            </View>
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.text, textAlign: 'center', marginBottom: 6 }}>
              Bienvenue !
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textMuted, textAlign: 'center', maxWidth: 280, lineHeight: 19, marginBottom: 24 }}>
              Posez vos questions sur les savoirs traditionnels africains. L'IA consultera la base de connaissances pour vous répondre.
            </Text>
            <View style={{ gap: 8, width: '100%' }}>
              {SUGGESTIONS.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => handleSuggestion(suggestion)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: Colors.surface,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    padding: 14,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  })}
                >
                  <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />
                  <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.text, flex: 1 }}>
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
      />

      {/* Loading indicator */}
      {isLoading && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: Colors.textMuted }}>
            L'IA réfléchit...
          </Text>
        </View>
      )}

      {/* Input */}
      <View style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 12 + insets.bottom,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
      }}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Votre question..."
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={500}
          style={{
            flex: 1,
            fontFamily: Fonts.regular,
            fontSize: 15,
            color: Colors.text,
            backgroundColor: Colors.background,
            borderRadius: 20,
            borderCurve: 'continuous',
            paddingHorizontal: 18,
            paddingVertical: 10,
            maxHeight: 100,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
          onSubmitEditing={handleSend}
        />
        <Pressable
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          style={({ pressed }) => ({
            opacity: (!inputText.trim() || isLoading) ? 0.4 : pressed ? 0.7 : 1,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
