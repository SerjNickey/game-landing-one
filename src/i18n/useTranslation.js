import { useSelector } from "../hooks/useSelector.js";

export function useTranslation(messages) {
  const lang = useSelector((state) => state.lang);

  return function t(key, params) {
    let text = messages[lang]?.[key] ?? messages.en?.[key] ?? key;

    if (params) {
      Object.entries(params).forEach(([name, value]) => {
        text = text.replaceAll(`{${name}}`, String(value));
      });
    }

    return text;
  };
}
