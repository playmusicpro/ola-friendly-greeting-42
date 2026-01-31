import { useState, useEffect } from 'react';
import { Badge, Challenge, PresskitData, FlyerData, AIGeneratedContent } from '@/types/challenges';

const BADGES_KEY = 'playPro_badges';
const CHALLENGES_KEY = 'playPro_challenges';
const PRESSKIT_DATA_KEY = 'playPro_presskitData';
const FLYER_DATA_KEY = 'playPro_flyerData';
const AI_CONTENT_KEY = 'playPro_aiContent';

const DEFAULT_BADGES: Badge[] = [
  {
    id: 'presskit-master',
    name: 'Presskit Master',
    description: 'Completou o desafio de criação de Presskit profissional',
    icon: 'FileText',
    category: 'presskit'
  },
  {
    id: 'flyer-creator',
    name: 'Designer de Flyers',
    description: 'Criou seu primeiro flyer profissional',
    icon: 'Image',
    category: 'flyer'
  },
  {
    id: 'social-ready',
    name: 'Pronto para Redes',
    description: 'Gerou legendas profissionais para redes sociais',
    icon: 'Share2',
    category: 'presskit'
  },
  {
    id: 'repertorio-pro',
    name: 'Repertório Completo',
    description: 'Cadastrou mais de 50 músicas no repertório',
    icon: 'Music',
    category: 'repertorio'
  },
  {
    id: 'shows-veteran',
    name: 'Veterano de Palco',
    description: 'Registrou mais de 10 shows realizados',
    icon: 'Trophy',
    category: 'shows'
  }
];

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'create-presskit',
    name: 'Crie seu Presskit',
    description: 'Complete todos os campos e gere uma bio profissional',
    type: 'presskit',
    completed: false,
    badgeId: 'presskit-master'
  },
  {
    id: 'create-flyer',
    name: 'Crie seu Flyer',
    description: 'Gere um flyer profissional para seu próximo show',
    type: 'flyer',
    completed: false,
    badgeId: 'flyer-creator'
  }
];

export const useChallenges = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [presskitData, setPresskitDataState] = useState<PresskitData | null>(null);
  const [flyerData, setFlyerDataState] = useState<FlyerData | null>(null);
  const [aiContent, setAiContent] = useState<AIGeneratedContent[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedBadges = localStorage.getItem(BADGES_KEY);
    const savedChallenges = localStorage.getItem(CHALLENGES_KEY);
    const savedPresskit = localStorage.getItem(PRESSKIT_DATA_KEY);
    const savedFlyer = localStorage.getItem(FLYER_DATA_KEY);
    const savedAiContent = localStorage.getItem(AI_CONTENT_KEY);

    setBadges(savedBadges ? JSON.parse(savedBadges) : DEFAULT_BADGES);
    setChallenges(savedChallenges ? JSON.parse(savedChallenges) : DEFAULT_CHALLENGES);
    setPresskitDataState(savedPresskit ? JSON.parse(savedPresskit) : null);
    setFlyerDataState(savedFlyer ? JSON.parse(savedFlyer) : null);
    setAiContent(savedAiContent ? JSON.parse(savedAiContent) : []);
  }, []);

  // Save functions
  const savePresskitData = (data: PresskitData) => {
    setPresskitDataState(data);
    localStorage.setItem(PRESSKIT_DATA_KEY, JSON.stringify(data));
  };

  const saveFlyerData = (data: FlyerData) => {
    setFlyerDataState(data);
    localStorage.setItem(FLYER_DATA_KEY, JSON.stringify(data));
  };

  const saveAiContent = (content: AIGeneratedContent) => {
    const updated = [...aiContent, content];
    setAiContent(updated);
    localStorage.setItem(AI_CONTENT_KEY, JSON.stringify(updated));
  };

  const completeChallenge = (challengeId: string) => {
    const updated = challenges.map(c => {
      if (c.id === challengeId && !c.completed) {
        return { ...c, completed: true, completedAt: new Date().toISOString() };
      }
      return c;
    });
    setChallenges(updated);
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(updated));

    // Unlock badge
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      unlockBadge(challenge.badgeId);
    }
  };

  const unlockBadge = (badgeId: string) => {
    const updated = badges.map(b => {
      if (b.id === badgeId && !b.unlockedAt) {
        return { ...b, unlockedAt: new Date().toISOString() };
      }
      return b;
    });
    setBadges(updated);
    localStorage.setItem(BADGES_KEY, JSON.stringify(updated));
  };

  const getUnlockedBadges = () => badges.filter(b => b.unlockedAt);
  const getLockedBadges = () => badges.filter(b => !b.unlockedAt);
  const getCompletedChallenges = () => challenges.filter(c => c.completed);
  const getPendingChallenges = () => challenges.filter(c => !c.completed);

  return {
    badges,
    challenges,
    presskitData,
    flyerData,
    aiContent,
    savePresskitData,
    saveFlyerData,
    saveAiContent,
    completeChallenge,
    unlockBadge,
    getUnlockedBadges,
    getLockedBadges,
    getCompletedChallenges,
    getPendingChallenges
  };
};
