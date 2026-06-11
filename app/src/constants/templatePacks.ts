import { categoryColors } from '../theme/designTokens';

export const TEMPLATE_PACKS = [
  {
    slug: 'operators',
    name: 'Operatörler',
    description: 'Turkcell, Vodafone, Türk Telekom',
    icon: 'hash',
    color: categoryColors[9],
  },
  {
    slug: 'banks',
    name: 'Bankalar',
    description: 'Ziraat, VakıfBank, Halkbank ve daha fazlası',
    icon: 'bank',
    color: categoryColors[10],
  },
  {
    slug: 'marketplaces',
    name: 'Pazaryerleri',
    description: 'Trendyol, Hepsiburada, N11 ve daha fazlası',
    icon: 'shopping-bag',
    color: categoryColors[2],
  },
  {
    slug: 'emergency-numbers',
    name: 'Acil Numaralar',
    description: 'Acil durumlarda gerekli tüm numaralar',
    icon: 'alert-circle',
    color: categoryColors[5],
  },
  {
    slug: 'social-messaging',
    name: 'Sosyal Medya & Mesajlaşma',
    description: 'Tüm popüler sosyal medya ve mesajlaşma uygulamaları',
    icon: 'share-2',
    color: categoryColors[4],
  },
];
