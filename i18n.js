// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      welcome: "Welcome to Collegely!",
      predict: "Predict",
      gpa: "GPA",
      sat: "SAT Score",
      activities: "Extracurriculars",
      add: "Add Activity",
      download: "Download Resume",
      // Add all other labels used in your app
    },
  },
  es: {
    translation: {
      welcome: "¡Bienvenido a Collegely!",
      predict: "Predecir",
      gpa: "Promedio (GPA)",
      sat: "Puntaje SAT",
      activities: "Actividades extracurriculares",
      add: "Agregar Actividad",
      download: "Descargar Currículum",
    },
  },
  // Add more languages here
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;