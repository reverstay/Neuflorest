import type { ProductSize } from "../types/product";
import type { PlantStatusKind } from "../types/plant";

export type Language = "pt-BR" | "en" | "es";

export type TranslationDictionary = {
  nav: {
    home: string;
    shop: string;
    login: string;
    logout: string;
    dashboard: string;
    lang: string;
  };
  landing: {
    hero: string;
    heroSub: string;
    cta: string;
    ctaSecondary: string;
    feat1Title: string;
    feat1Desc: string;
    feat2Title: string;
    feat2Desc: string;
    feat3Title: string;
    feat3Desc: string;
    testimTitle: string;
    testim1: string;
    testim1Author: string;
    testim2: string;
    testim2Author: string;
    statsPlants: string;
    statsDevices: string;
    statsCities: string;
    offerTag: string;
    offerTitle: string;
  };
  shop: {
    title: string;
    productCount: string;
    filter: string;
    filterAll: string;
    filterSmall: string;
    filterMedium: string;
    filterLarge: string;
    addCart: string;
    added: string;
    price: string;
  };
  login: {
    title: string;
    sub: string;
    email: string;
    password: string;
    forgot: string;
    submit: string;
    noAccount: string;
    register: string;
    orContinue: string;
    quote: string;
  };
  dashboard: {
    title: string;
    sub: string;
    healthy: string;
    attention: string;
    critical: string;
    moisture: string;
    temp: string;
    lastRead: string;
    irrigate: string;
    orders: string;
    ordersEmpty: string;
    liveTelemetry: string;
    telemetryLoading: string;
    telemetryFallback: string;
    telemetryUnavailable: string;
    liveDevice: string;
  };
  footer: {
    tagline: string;
    links: string;
    contact: string;
    privacy: string;
    terms: string;
  };
};

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  "pt-BR": {
    nav: {
      home: "Início",
      shop: "Vitrine",
      login: "Entrar",
      logout: "Sair",
      dashboard: "Painel",
      lang: "Idioma",
    },
    landing: {
      hero: "Natureza viva,\ncuidado inteligente.",
      heroSub:
        "Vasos 3D personalizados com plantas reais e irrigação automática - controlados pelo seu celular.",
      cta: "Explorar vitrine",
      ctaSecondary: "Como funciona",
      feat1Title: "Impressão 3D sob medida",
      feat1Desc: "Cada vaso é único. Escolha forma, cor e material. Produzido em 48h.",
      feat2Title: "Plantas selecionadas",
      feat2Desc: "Espécies curadas por botânicos. Chegam prontas para viver no seu espaço.",
      feat3Title: "IoT invisível",
      feat3Desc: "Sensores monitoram umidade e temperatura. A irrigação acontece sozinha.",
      testimTitle: "O que dizem",
      testim1: "Nunca matei uma planta desde que tenho o neuflower. É quase mágico.",
      testim1Author: "- Ana Paula, São Paulo",
      testim2: "O design dos vasos é impressionante. Todo mundo pergunta onde comprei.",
      testim2Author: "- Rafael, Lisboa",
      statsPlants: "plantas entregues",
      statsDevices: "dispositivos ativos",
      statsCities: "cidades",
      offerTag: "O que oferecemos",
      offerTitle: "Cada detalhe pensado",
    },
    shop: {
      title: "Vitrine",
      productCount: "produtos",
      filter: "Filtrar",
      filterAll: "Todos",
      filterSmall: "Pequeno",
      filterMedium: "Médio",
      filterLarge: "Grande",
      addCart: "Adicionar",
      added: "Adicionado",
      price: "R$",
    },
    login: {
      title: "Bem-vindo de volta",
      sub: "Entre na sua conta neuflower",
      email: "E-mail",
      password: "Senha",
      forgot: "Esqueceu a senha?",
      submit: "Entrar",
      noAccount: "Não tem conta?",
      register: "Criar conta",
      orContinue: "ou continue com",
      quote: "A planta não precisa de você - ela precisa do sistema certo.",
    },
    dashboard: {
      title: "Meu jardim",
      sub: "Visão geral das suas plantas",
      healthy: "Saudável",
      attention: "Atenção",
      critical: "Crítico",
      moisture: "Umidade",
      temp: "Temperatura",
      lastRead: "Última leitura",
      irrigate: "Irrigar agora",
      orders: "Meus pedidos",
      ordersEmpty: "Nenhum pedido ainda.",
      liveTelemetry: "Telemetria ao vivo",
      telemetryLoading: "Buscando última leitura do dispositivo...",
      telemetryFallback: "Sem telemetria ao vivo ainda. Exibindo dados de referência.",
      telemetryUnavailable: "Não foi possível carregar telemetria agora. Exibindo dados de referência.",
      liveDevice: "Dispositivo",
    },
    footer: {
      tagline: "Natureza com tecnologia.",
      links: "Links",
      contact: "Contato",
      privacy: "Privacidade",
      terms: "Termos",
    },
  },
  en: {
    nav: {
      home: "Home",
      shop: "Shop",
      login: "Sign in",
      logout: "Sign out",
      dashboard: "Dashboard",
      lang: "Language",
    },
    landing: {
      hero: "Living nature,\nintelligent care.",
      heroSub:
        "Custom 3D-printed pots with real plants and automatic irrigation - controlled from your phone.",
      cta: "Browse shop",
      ctaSecondary: "How it works",
      feat1Title: "3D printed to order",
      feat1Desc: "Every pot is unique. Choose shape, color and material. Ready in 48h.",
      feat2Title: "Curated plants",
      feat2Desc: "Species selected by botanists. Arrive ready to thrive in your space.",
      feat3Title: "Invisible IoT",
      feat3Desc: "Sensors monitor moisture and temperature. Irrigation happens on its own.",
      testimTitle: "What people say",
      testim1: "I haven't killed a single plant since I got neuflower. It's almost magical.",
      testim1Author: "- Ana Paula, São Paulo",
      testim2: "The pot design is stunning. Everyone asks where I got it.",
      testim2Author: "- Rafael, Lisbon",
      statsPlants: "plants delivered",
      statsDevices: "active devices",
      statsCities: "cities",
      offerTag: "What we offer",
      offerTitle: "Every detail considered",
    },
    shop: {
      title: "Shop",
      productCount: "products",
      filter: "Filter",
      filterAll: "All",
      filterSmall: "Small",
      filterMedium: "Medium",
      filterLarge: "Large",
      addCart: "Add to cart",
      added: "Added",
      price: "$",
    },
    login: {
      title: "Welcome back",
      sub: "Sign in to your neuflower account",
      email: "Email",
      password: "Password",
      forgot: "Forgot password?",
      submit: "Sign in",
      noAccount: "Don't have an account?",
      register: "Create account",
      orContinue: "or continue with",
      quote: "The plant does not need you - it needs the right system.",
    },
    dashboard: {
      title: "My garden",
      sub: "Overview of your plants",
      healthy: "Healthy",
      attention: "Attention",
      critical: "Critical",
      moisture: "Moisture",
      temp: "Temperature",
      lastRead: "Last reading",
      irrigate: "Irrigate now",
      orders: "My orders",
      ordersEmpty: "No orders yet.",
      liveTelemetry: "Live telemetry",
      telemetryLoading: "Fetching latest device reading...",
      telemetryFallback: "No live telemetry yet. Showing reference data.",
      telemetryUnavailable: "Unable to load telemetry right now. Showing reference data.",
      liveDevice: "Device",
    },
    footer: {
      tagline: "Nature meets technology.",
      links: "Links",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms",
    },
  },
  es: {
    nav: {
      home: "Inicio",
      shop: "Tienda",
      login: "Entrar",
      logout: "Salir",
      dashboard: "Panel",
      lang: "Idioma",
    },
    landing: {
      hero: "Naturaleza viva,\ncuidado inteligente.",
      heroSub:
        "Macetas 3D personalizadas con plantas reales y riego automático - controladas desde tu móvil.",
      cta: "Ver tienda",
      ctaSecondary: "Cómo funciona",
      feat1Title: "Impresión 3D a medida",
      feat1Desc: "Cada maceta es única. Elige forma, color y material. Lista en 48h.",
      feat2Title: "Plantas seleccionadas",
      feat2Desc: "Especies elegidas por botánicos. Llegan listas para vivir en tu espacio.",
      feat3Title: "IoT invisible",
      feat3Desc: "Sensores monitorean humedad y temperatura. El riego ocurre solo.",
      testimTitle: "Lo que dicen",
      testim1: "No he matado ninguna planta desde que tengo neuflower. Es casi mágico.",
      testim1Author: "- Ana Paula, São Paulo",
      testim2: "El diseño de las macetas es impresionante. Todos preguntan dónde las compré.",
      testim2Author: "- Rafael, Lisboa",
      statsPlants: "plantas entregadas",
      statsDevices: "dispositivos activos",
      statsCities: "ciudades",
      offerTag: "Lo que ofrecemos",
      offerTitle: "Cada detalle pensado",
    },
    shop: {
      title: "Tienda",
      productCount: "productos",
      filter: "Filtrar",
      filterAll: "Todos",
      filterSmall: "Pequeño",
      filterMedium: "Mediano",
      filterLarge: "Grande",
      addCart: "Agregar",
      added: "Agregado",
      price: "$",
    },
    login: {
      title: "Bienvenido de nuevo",
      sub: "Entra en tu cuenta neuflower",
      email: "Correo",
      password: "Contraseña",
      forgot: "¿Olvidaste tu contraseña?",
      submit: "Entrar",
      noAccount: "¿No tienes cuenta?",
      register: "Crear cuenta",
      orContinue: "o continúa con",
      quote: "La planta no te necesita a ti - necesita el sistema correcto.",
    },
    dashboard: {
      title: "Mi jardín",
      sub: "Resumen de tus plantas",
      healthy: "Saludable",
      attention: "Atención",
      critical: "Crítico",
      moisture: "Humedad",
      temp: "Temperatura",
      lastRead: "Última lectura",
      irrigate: "Regar ahora",
      orders: "Mis pedidos",
      ordersEmpty: "Aún no hay pedidos.",
      liveTelemetry: "Telemetría en vivo",
      telemetryLoading: "Buscando última lectura del dispositivo...",
      telemetryFallback: "Aún no hay telemetría en vivo. Mostrando datos de referencia.",
      telemetryUnavailable: "No se pudo cargar telemetría ahora. Mostrando datos de referencia.",
      liveDevice: "Dispositivo",
    },
    footer: {
      tagline: "Naturaleza con tecnología.",
      links: "Enlaces",
      contact: "Contacto",
      privacy: "Privacidad",
      terms: "Términos",
    },
  },
};

export const PRODUCT_SIZE_LABEL_KEYS: Record<ProductSize, keyof TranslationDictionary["shop"]> = {
  small: "filterSmall",
  medium: "filterMedium",
  large: "filterLarge",
};

export const STATUS_LABEL_KEYS: Record<PlantStatusKind, keyof TranslationDictionary["dashboard"]> = {
  healthy: "healthy",
  attention: "attention",
  critical: "critical",
};
