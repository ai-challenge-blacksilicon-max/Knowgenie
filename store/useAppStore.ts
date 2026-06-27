import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Knowledge, UserProfile, ChatMessage, Preferences } from './types';

interface KnowledgeSlice {
  knowledgeItems: Knowledge[];
  addKnowledge: (item: Knowledge) => void;
  updateKnowledge: (id: string, updates: Partial<Knowledge>) => void;
  deleteKnowledge: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

interface ChatSlice {
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
}

interface ProfileSlice {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

interface PreferencesSlice {
  preferences: Preferences;
  updatePreferences: (updates: Partial<Preferences>) => void;
}

interface DraftSlice {
  draftKnowledge: Partial<Knowledge> | null;
  setDraftKnowledge: (draft: Partial<Knowledge> | null) => void;
  updateDraft: (updates: Partial<Knowledge>) => void;
}

export type AppStore = KnowledgeSlice & ChatSlice & ProfileSlice & PreferencesSlice & DraftSlice;

const generateId = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const SAMPLE_KNOWLEDGE: Knowledge[] = [
  {
    id: generateId(),
    title: 'Remède traditionnel contre la fièvre',
    content: 'Préparation à base de feuilles de neem et de citron, utilisée depuis des générations dans les communautés ouest-africaines pour combattre la fièvre et renforcer le système immunitaire.',
    domain: 'medicine',
    community: 'Yoruba',
    region: 'Nigeria - Oyo State',
    mediaType: 'text',
    mediaUri: '',
    transcription: '',
    keywords: ['neem', 'fièvre', 'remède naturel', 'immunité'],
    summary: 'Remède traditionnel yoruba utilisant le neem et le citron pour traiter la fièvre.',
    aiCategory: 'Médecine traditionnelle - Phytothérapie',
    status: 'published',
    createdAt: 1719400000000,
    isFavorite: true,
  },
  {
    id: generateId(),
    title: 'Techniques de culture du mil en zone sahélienne',
    content: 'Méthode ancestrale de culture du mil adaptée aux conditions arides, incluant la rotation des cultures et les techniques de conservation de l\'eau transmises de père en fils.',
    domain: 'agriculture',
    community: 'Peul',
    region: 'Sénégal - Ferlo',
    mediaType: 'text',
    mediaUri: '',
    transcription: '',
    keywords: ['mil', 'zone sahélienne', 'rotation cultures', 'conservation eau'],
    summary: 'Techniques agricoles peules pour cultiver le mil en conditions arides.',
    aiCategory: 'Agriculture - Cultures céréalières',
    status: 'published',
    createdAt: 1719300000000,
    isFavorite: false,
  },
  {
    id: generateId(),
    title: 'Chants rituels de la cérémonie d\'initiation',
    content: 'Documentation des chants sacrés accompagnant les cérémonies d\'initiation des jeunes dans la tradition Bamiléké, transmis oralement depuis des siècles.',
    domain: 'culture',
    community: 'Bamiléké',
    region: 'Cameroun - Ouest',
    mediaType: 'audio',
    mediaUri: '',
    transcription: 'Paroles sacrées des chants d\'initiation...',
    keywords: ['initiation', 'chants sacrés', 'tradition orale', 'cérémonie'],
    summary: 'Chants rituels bamiléké pour les cérémonies d\'initiation des jeunes.',
    aiCategory: 'Culture - Traditions orales',
    status: 'published',
    createdAt: 1719200000000,
    isFavorite: true,
  },
  {
    id: generateId(),
    title: 'Tissage du pagne Kente',
    content: 'Art du tissage traditionnel kente avec ses motifs symboliques, chaque couleur et forme racontant une histoire de la communauté Ashanti.',
    domain: 'craft',
    community: 'Ashanti',
    region: 'Ghana - Kumasi',
    mediaType: 'photo',
    mediaUri: '',
    transcription: '',
    keywords: ['kente', 'tissage', 'motifs symboliques', 'artisanat'],
    summary: 'Art du tissage kente ashanti avec symbolisme des couleurs et motifs.',
    aiCategory: 'Artisanat - Textile',
    status: 'published',
    createdAt: 1719100000000,
    isFavorite: false,
  },
  {
    id: generateId(),
    title: 'Préparation du beurre de karité',
    content: 'Processus complet de transformation des noix de karité en beurre, depuis la collecte jusqu\'au conditionnement, selon la méthode transmise par les femmes de la communauté.',
    domain: 'craft',
    community: 'Mossi',
    region: 'Burkina Faso - Centre',
    mediaType: 'video',
    mediaUri: '',
    transcription: '',
    keywords: ['karité', 'beurre', 'transformation', 'savoir-faire féminin'],
    summary: 'Processus traditionnel mossi de fabrication du beurre de karité.',
    aiCategory: 'Artisanat - Cosmétique naturelle',
    status: 'published',
    createdAt: 1719000000000,
    isFavorite: false,
  },
  {
    id: generateId(),
    title: 'Usage médicinal de l\'arbre Moringa',
    content: 'Les feuilles, graines et racines du Moringa oleifera sont utilisées dans la médecine traditionnelle pour traiter plus de 300 maladies selon les guérisseurs locaux.',
    domain: 'medicine',
    community: 'Mandingue',
    region: 'Mali - Bamako',
    mediaType: 'text',
    mediaUri: '',
    transcription: '',
    keywords: ['moringa', 'plante médicinale', 'nutrition', 'guérison'],
    summary: 'Usages médicinaux multiples du Moringa dans la tradition mandingue.',
    aiCategory: 'Médecine traditionnelle - Phytothérapie',
    status: 'published',
    createdAt: 1718900000000,
    isFavorite: true,
  },
];

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      knowledgeItems: SAMPLE_KNOWLEDGE,
      addKnowledge: (item) => set((state) => ({
        knowledgeItems: [item, ...state.knowledgeItems],
        profile: { ...state.profile, contributionsCount: state.profile.contributionsCount + 1 },
      })),
      updateKnowledge: (id, updates) => set((state) => ({
        knowledgeItems: state.knowledgeItems.map((k) =>
          k.id === id ? { ...k, ...updates } : k
        ),
      })),
      deleteKnowledge: (id) => set((state) => ({
        knowledgeItems: state.knowledgeItems.filter((k) => k.id !== id),
      })),
      toggleFavorite: (id) => set((state) => ({
        knowledgeItems: state.knowledgeItems.map((k) =>
          k.id === id ? { ...k, isFavorite: !k.isFavorite } : k
        ),
      })),

      chatMessages: [],
      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, message],
      })),
      clearChat: () => set({ chatMessages: [] }),

      profile: {
        id: 'user-001',
        name: 'Amara Diallo',
        community: 'Mandingue',
        region: 'Sénégal - Casamance',
        preferredLanguage: 'fr',
        contributionsCount: 6,
      },
      updateProfile: (updates) => set((state) => ({
        profile: { ...state.profile, ...updates },
      })),

      preferences: {
        language: 'fr',
        notifications: true,
      },
      updatePreferences: (updates) => set((state) => ({
        preferences: { ...state.preferences, ...updates },
      })),

      draftKnowledge: null,
      setDraftKnowledge: (draft) => set({ draftKnowledge: draft }),
      updateDraft: (updates) => set((state) => ({
        draftKnowledge: state.draftKnowledge
          ? { ...state.draftKnowledge, ...updates }
          : updates,
      })),
    }),
    {
      name: 'afriknowledge-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        knowledgeItems: state.knowledgeItems,
        chatMessages: state.chatMessages,
        profile: state.profile,
        preferences: state.preferences,
      }),
    }
  )
);
