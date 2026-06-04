import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

import type { Language } from "../../i18n/translations";

type LangContextValue = {
  lang: Language;
  setLang: (language: Language) => void;
};

const LangContext = createContext<LangContextValue | undefined>(undefined);

export function LangProvider({ children }: PropsWithChildren) {
  const [lang, setLang] = useState<Language>("pt-BR");
  const value = useMemo(() => ({ lang, setLang }), [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const context = useContext(LangContext);

  if (!context) {
    throw new Error("useLang must be used within LangProvider");
  }

  return context;
}
