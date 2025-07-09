// src/composables/useCookies.ts
import { ref, computed, watch } from "vue";

export interface CookieOptions {
  expires?: number | Date | string;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  httpOnly?: boolean;
}

export interface CookieConfig {
  name: string;
  defaultValue?: any;
  expires?: number; // dias
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  path?: string;
}

export interface CookieSettings {
  consent?: any;
  preferences?: Record<string, any>;
  timestamp?: string;
}

export const COOKIE_CONFIGS = {
  // Preferências de interface
  SIDEBAR_COLLAPSED: {
    name: "barbearia_sidebar_collapsed",
    defaultValue: false,
    expires: 365,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },
  APP_THEME: {
    name: "barbearia_theme",
    defaultValue: "light",
    expires: 365,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },
  LANGUAGE: {
    name: "barbearia_language",
    defaultValue: "pt-BR",
    expires: 365,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },

  // Autenticação
  AUTH_TOKEN: {
    name: "barbearia_auth_token",
    defaultValue: null,
    expires: 30,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },
  USER_DATA: {
    name: "barbearia_user_data",
    defaultValue: null,
    expires: 30,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },
  REMEMBER_USER: {
    name: "barbearia_remember_user",
    defaultValue: false,
    expires: 365,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },
  LAST_ROUTE: {
    name: "barbearia_last_route",
    defaultValue: "/",
    expires: 7,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },

  // Dashboard
  DASHBOARD_CONFIG: {
    name: "barbearia_dashboard_config",
    defaultValue: null,
    expires: 90,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },
  DASHBOARD_DATE_FILTER: {
    name: "barbearia_dashboard_date_filter",
    defaultValue: "today",
    expires: 30,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },
  DASHBOARD_WIDGETS: {
    name: "barbearia_dashboard_widgets",
    defaultValue: {
      agendamentos: true,
      faturamento: true,
      clientes: true,
      servicos: true,
    },
    expires: 365,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },

  // Filtros e consultas
  SAVED_FILTERS: {
    name: "barbearia_saved_filters",
    defaultValue: {} as Record<string, any>,
    expires: 90,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },
  PAGINATION_CONFIG: {
    name: "barbearia_pagination_config",
    defaultValue: { itemsPerPage: 10, sortBy: "id", sortOrder: "desc" },
    expires: 365,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },
  TABLE_COLUMNS: {
    name: "barbearia_table_columns",
    defaultValue: {} as Record<string, any>,
    expires: 365,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },

  // Notificações
  NOTIFICATION_PREFS: {
    name: "barbearia_notification_prefs",
    defaultValue: {
      showToasts: true,
      showAlerts: true,
      showWarnings: true,
      autoHideToasts: true,
      toastDuration: 5000,
      soundEnabled: false,
    },
    expires: 365,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },
  DISMISSED_ALERTS: {
    name: "barbearia_dismissed_alerts",
    defaultValue: [] as any[],
    expires: 30,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },

  // Formulários
  FORM_DRAFTS: {
    name: "barbearia_form_drafts",
    defaultValue: {} as Record<string, any>,
    expires: 7,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },
  FORM_PREFERENCES: {
    name: "barbearia_form_preferences",
    defaultValue: {
      autoSave: true,
      autoSaveInterval: 30000,
      confirmBeforeLeave: true,
      rememberLastValues: true,
    },
    expires: 365,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },

  // Consentimento LGPD
  COOKIE_CONSENT: {
    name: "barbearia_cookie_consent",
    defaultValue: null,
    expires: 365,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },

  // Performance e Cache
  CACHE_PREFERENCES: {
    name: "barbearia_cache_preferences",
    defaultValue: {
      enableCache: true,
      cacheTimeout: 300000, // 5 minutos
      preloadData: false,
    },
    expires: 365,
    secure: true,
    sameSite: "Strict" as const,
    path: "/",
  },
} as const;

// Tipo para as chaves do COOKIE_CONFIGS
export type CookieConfigKey = keyof typeof COOKIE_CONFIGS;

export function useCookies() {
  // Estado reativo para consentimento
  const consentState = ref<any>(null);

  /**
   * Define um cookie
   */
  const setCookie = (
    name: string,
    value: any,
    options: CookieOptions = {}
  ): void => {
    try {
      // Verificar se estamos no ambiente do navegador
      if (typeof document === "undefined") {
        console.warn("Cookies não disponíveis no ambiente servidor");
        return;
      }

      let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
        typeof value === "object" ? JSON.stringify(value) : String(value)
      )}`;

      // Configurar expiração
      if (options.expires) {
        let expires: string;
        if (typeof options.expires === "number") {
          const date = new Date();
          date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
          expires = date.toUTCString();
        } else if (options.expires instanceof Date) {
          expires = options.expires.toUTCString();
        } else {
          expires = options.expires;
        }
        cookieString += `; expires=${expires}`;
      }

      // Outras opções
      if (options.path) cookieString += `; path=${options.path}`;
      if (options.domain) cookieString += `; domain=${options.domain}`;
      if (options.secure) cookieString += `; secure`;
      if (options.sameSite) cookieString += `; samesite=${options.sameSite}`;
      // Nota: httpOnly não pode ser definido via JavaScript no navegador

      document.cookie = cookieString;
    } catch (error) {
      console.error("Erro ao definir cookie:", error);
    }
  };

  /**
   * Obtém um cookie
   */
  const getCookie = (name: string): string | null => {
    try {
      if (typeof document === "undefined") {
        return null;
      }

      const nameEQ = encodeURIComponent(name) + "=";
      const cookies = document.cookie.split(";");

      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
          const value = cookie.substring(nameEQ.length);
          return decodeURIComponent(value);
        }
      }
      return null;
    } catch (error) {
      console.error("Erro ao obter cookie:", error);
      return null;
    }
  };

  /**
   * Remove um cookie
   */
  const deleteCookie = (
    name: string,
    path: string = "/",
    domain?: string
  ): void => {
    try {
      if (typeof document === "undefined") {
        return;
      }

      let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
      if (domain) cookieString += `; domain=${domain}`;
      document.cookie = cookieString;
    } catch (error) {
      console.error("Erro ao deletar cookie:", error);
    }
  };

  /**
   * Obtém todos os cookies
   */
  const getAllCookies = (): Record<string, string> => {
    try {
      if (typeof document === "undefined") {
        return {};
      }

      const cookies: Record<string, string> = {};
      const cookieArray = document.cookie.split(";");

      for (let cookie of cookieArray) {
        cookie = cookie.trim();
        const [name, ...valueParts] = cookie.split("=");
        const value = valueParts.join("="); // Reconstrói o valor caso contenha '='
        if (name && value) {
          cookies[decodeURIComponent(name)] = decodeURIComponent(value);
        }
      }
      return cookies;
    } catch (error) {
      console.error("Erro ao obter todos os cookies:", error);
      return {};
    }
  };

  /**
   * Verifica se cookies estão habilitados
   */
  const areCookiesEnabled = (): boolean => {
    try {
      if (typeof document === "undefined") {
        return false;
      }

      const testCookie = "test_cookie_" + Date.now();
      setCookie(testCookie, "test", { expires: 1 });
      const enabled = getCookie(testCookie) === "test";
      deleteCookie(testCookie);
      return enabled;
    } catch {
      return false;
    }
  };

  /**
   * Define um cookie usando configuração predefinida
   */
  const setConfiguredCookie = (config: CookieConfig, value: any): void => {
    const options: CookieOptions = {
      expires: config.expires,
      secure: config.secure,
      sameSite: config.sameSite,
      path: config.path || "/",
    };
    setCookie(config.name, value, options);
  };

  /**
   * Obtém um cookie usando configuração predefinida
   */
  const getConfiguredCookie = (config: CookieConfig): any => {
    const value = getCookie(config.name);
    if (value === null) return config.defaultValue;

    try {
      // Tentar fazer parse como JSON
      return JSON.parse(value);
    } catch {
      // Se não for JSON, retornar como string
      return value;
    }
  };

  /**
   * Hook reativo para um cookie específico
   */
  const useCookieState = (config: CookieConfig) => {
    const cookieValue = ref(getConfiguredCookie(config));

    const setValue = (newValue: any) => {
      cookieValue.value = newValue;
      setConfiguredCookie(config, newValue);
    };

    const deleteValue = () => {
      cookieValue.value = config.defaultValue;
      deleteCookie(config.name);
    };

    // Watch para sincronizar mudanças externas
    const syncFromCookie = () => {
      const currentValue = getConfiguredCookie(config);
      if (JSON.stringify(currentValue) !== JSON.stringify(cookieValue.value)) {
        cookieValue.value = currentValue;
      }
    };

    return {
      value: cookieValue,
      setValue,
      deleteValue,
      syncFromCookie,
    };
  };

  /**
   * Limpa todos os cookies da aplicação
   */
  const clearAllAppCookies = (): void => {
    Object.values(COOKIE_CONFIGS).forEach((config) => {
      deleteCookie(config.name, config.path);
    });
  };

  /**
   * Carrega estado de consentimento
   */
  const loadConsentState = () => {
    const consent = getConfiguredCookie(COOKIE_CONFIGS.COOKIE_CONSENT);
    consentState.value = consent;
    return consent;
  };

  /**
   * Verifica consentimento LGPD
   */
  const hasConsent = computed(() => {
    if (consentState.value === null) {
      loadConsentState();
    }
    return consentState.value?.accepted === true;
  });

  /**
   * Verifica consentimento para categoria específica
   */
  const hasConsentForCategory = (
    category: "essential" | "preferences" | "functionality" | "analytics"
  ): boolean => {
    if (!hasConsent.value) return false;
    if (category === "essential") return true; // Essenciais sempre permitidos

    const consent = consentState.value || loadConsentState();
    return consent?.preferences?.[category] === true;
  };

  /**
   * Define consentimento LGPD
   */
  const setConsent = (accepted: boolean, preferences: any = {}) => {
    const consentData = {
      accepted,
      timestamp: new Date().toISOString(),
      preferences: {
        essential: true, // Sempre true
        preferences: preferences.preferences ?? false,
        functionality: preferences.functionality ?? false,
        analytics: preferences.analytics ?? false,
        ...preferences,
      },
      version: "1.0",
    };

    setConfiguredCookie(COOKIE_CONFIGS.COOKIE_CONSENT, consentData);
    consentState.value = consentData;

    // Se não aceitou, limpar cookies não essenciais
    if (!accepted) {
      clearNonEssentialCookies();
    }
  };

  /**
   * Limpa cookies não essenciais baseado no consentimento
   */
  const clearNonEssentialCookies = () => {
    const consent = consentState.value || loadConsentState();

    if (!consent?.preferences?.preferences) {
      // Limpar cookies de preferências
      deleteCookie(COOKIE_CONFIGS.APP_THEME.name);
      deleteCookie(COOKIE_CONFIGS.LANGUAGE.name);
      deleteCookie(COOKIE_CONFIGS.NOTIFICATION_PREFS.name);
    }

    if (!consent?.preferences?.functionality) {
      // Limpar cookies de funcionalidade
      deleteCookie(COOKIE_CONFIGS.FORM_DRAFTS.name);
      deleteCookie(COOKIE_CONFIGS.SAVED_FILTERS.name);
      deleteCookie(COOKIE_CONFIGS.DASHBOARD_CONFIG.name);
    }

    if (!consent?.preferences?.analytics) {
      // Limpar cookies de análise (se houver)
      deleteCookie(COOKIE_CONFIGS.CACHE_PREFERENCES.name);
    }
  };

  /**
   * Obtém informações sobre cookies armazenados
   */
  const getCookieInfo = () => {
    const allCookies = getAllCookies();
    const appCookies = Object.values(COOKIE_CONFIGS).filter((config) =>
      Object.prototype.hasOwnProperty.call(allCookies, config.name)
    );

    // Função auxiliar para encontrar chave de configuração
    const findConfigKey = (config: any): string => {
      return (
        Object.keys(COOKIE_CONFIGS).find(
          (key) => COOKIE_CONFIGS[key as CookieConfigKey] === config
        ) || ""
      );
    };

    return {
      total: Object.keys(allCookies).length,
      appCookies: appCookies.length,
      essential: appCookies.filter((config) =>
        ["AUTH_TOKEN", "USER_DATA", "COOKIE_CONSENT"].includes(
          findConfigKey(config)
        )
      ).length,
      preferences: appCookies.filter((config) =>
        ["APP_THEME", "LANGUAGE", "NOTIFICATION_PREFS"].includes(
          findConfigKey(config)
        )
      ).length,
      functionality: appCookies.filter((config) =>
        ["FORM_DRAFTS", "SAVED_FILTERS", "DASHBOARD_CONFIG"].includes(
          findConfigKey(config)
        )
      ).length,
    };
  };

  /**
   * Exporta configurações de cookies
   */
  const exportCookieSettings = (): CookieSettings => {
    const settings: CookieSettings = {
      consent: consentState.value,
      preferences: {},
      timestamp: new Date().toISOString(),
    };

    // Exportar apenas cookies de preferências
    const preferenceCookies: CookieConfigKey[] = [
      "APP_THEME",
      "LANGUAGE",
      "NOTIFICATION_PREFS",
      "FORM_PREFERENCES",
    ];

    preferenceCookies.forEach((key) => {
      const config = COOKIE_CONFIGS[key];
      const value = getConfiguredCookie(config);
      if (value !== config.defaultValue && settings.preferences) {
        settings.preferences[key] = value;
      }
    });

    return settings;
  };

  /**
   * Importa configurações de cookies
   */
  const importCookieSettings = (settings: CookieSettings): boolean => {
    if (!settings || !hasConsent.value) return false;

    try {
      // Importar consentimento se válido
      if (settings.consent && settings.consent.accepted) {
        setConsent(settings.consent.accepted, settings.consent.preferences);
      }

      // Importar preferências
      if (settings.preferences) {
        Object.entries(settings.preferences).forEach(([key, value]) => {
          // Verificar se a chave é válida
          if (key in COOKIE_CONFIGS) {
            const config = COOKIE_CONFIGS[key as CookieConfigKey];
            if (config && hasConsentForCategory("preferences")) {
              setConfiguredCookie(config, value);
            }
          }
        });
      }

      return true;
    } catch (error) {
      console.error("Erro ao importar configurações:", error);
      return false;
    }
  };

  // Inicializar estado de consentimento
  loadConsentState();

  // Watch para mudanças no consentimento
  watch(
    consentState,
    (newConsent) => {
      if (newConsent && !newConsent.accepted) {
        clearNonEssentialCookies();
      }
    },
    { deep: true }
  );

  return {
    // Funções básicas
    setCookie,
    getCookie,
    deleteCookie,
    getAllCookies,
    areCookiesEnabled,

    // Funções com configuração
    setConfiguredCookie,
    getConfiguredCookie,
    useCookieState,

    // Consentimento
    hasConsent,
    hasConsentForCategory,
    setConsent,
    loadConsentState,

    // Utilitários
    clearAllAppCookies,
    clearNonEssentialCookies,
    getCookieInfo,
    exportCookieSettings,
    importCookieSettings,

    // Estados reativos
    consentState,

    // Configurações
    COOKIE_CONFIGS,
  };
}
