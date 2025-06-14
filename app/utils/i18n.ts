import {language$} from "@/app/store/language";
import i18n from "i18next";
import {initReactI18next} from "react-i18next";

import en from "@/app/locales/en.json";
import lv from "@/app/locales/lv.json";

const resources = {
	en: {
		translation: en,
	},
	lv: {
		translation: lv,
	},
};

i18n.use(initReactI18next).init({
	resources,
	lng: language$.currentLanguage.get(),
	fallbackLng: "lv",
	interpolation: {
		escapeValue: false,
	},
	compatibilityJSON: "v4",
});

language$.currentLanguage.onChange((newLanguage) => {
	i18n.changeLanguage(newLanguage.value);
});

export default i18n;
