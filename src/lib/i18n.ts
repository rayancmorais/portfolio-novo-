import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBrHome from '@/translations/pt-br/home.json';
import ptBrNavbar from '@/translations/pt-br/navbar.json';
import enHome from '@/translations/en/home.json';
import enNavbar from '@/translations/en/navbar.json';

i18n.use(initReactI18next).init({
  resources: {
    ptBR: {
      home: ptBrHome,
      navbar: ptBrNavbar,
    },
    en: {
      home: enHome,
      navbar: enNavbar,
    },
  },
  lng: 'ptBR',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
