import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import en from '../constants/locales/en';
import tr from '../constants/locales/tr';

export type Language = 'en' | 'tr';

const translations: Record<Language, typeof en> = {
  en,
  tr,
};

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof en) => string;
}

const getInitialLanguage = (): Language => {
  const deviceLang = Localization.getLocales()[0]?.languageCode || 'en';
  return deviceLang.startsWith('tr') ? 'tr' : 'en';
};

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      language: getInitialLanguage(),
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => {
        const lang = get().language;
        return translations[lang][key] || translations.en[key] || key;
      },
    }),
    {
      name: 'i18n-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useTranslation = () => {
  const t = useI18nStore((state) => state.t);
  return { t };
};

