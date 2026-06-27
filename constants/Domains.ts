import { Colors } from './Colors';
import type { KnowledgeDomain } from '@/store/types';

export interface DomainInfo {
  key: KnowledgeDomain;
  label: string;
  icon: string;
  color: string;
}

export const DOMAINS: DomainInfo[] = [
  { key: 'medicine', label: 'Médecine', icon: 'leaf', color: Colors.domainMedicine },
  { key: 'agriculture', label: 'Agriculture', icon: 'nutrition', color: Colors.domainAgriculture },
  { key: 'culture', label: 'Culture', icon: 'musical-notes', color: Colors.domainCulture },
  { key: 'craft', label: 'Artisanat', icon: 'color-palette', color: Colors.domainCraft },
];

export const getDomainInfo = (domain: KnowledgeDomain): DomainInfo => {
  return DOMAINS.find((d) => d.key === domain) || DOMAINS[0];
};

export const REGIONS = [
  'Sénégal',
  'Mali',
  'Nigeria',
  'Ghana',
  'Cameroun',
  'Burkina Faso',
  'Côte d\'Ivoire',
  'Guinée',
  'Bénin',
  'Togo',
];

export const COMMUNITIES = [
  'Yoruba',
  'Peul',
  'Mandingue',
  'Bamiléké',
  'Ashanti',
  'Mossi',
  'Wolof',
  'Igbo',
  'Haoussa',
  'Bambara',
];
