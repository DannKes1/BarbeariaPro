import { ref, watch, onMounted } from "vue";
import { useCookies } from "@/composables/useCookies";

export interface FormCookieOptions {
  formKey: string;
  rememberFields?: string[]; 
  rememberFilters?: boolean; 
  rememberPagination?: boolean; 
  expirationDays?: number;
}

export function useFormCookies(formData: any, options: FormCookieOptions) {
  const {
    setCookie,
    getCookie,
    hasConsent,
    hasConsentForCategory,
  } = useCookies();

  const canUseCookies = ref(false);
  const lastValues = ref<Record<string, any>>({});
  const savedFilters = ref<Record<string, any>>({});
  const savedPagination = ref<Record<string, any>>({});

  const checkCookieConsent = () => {
    canUseCookies.value = hasConsent.value && hasConsentForCategory("functionality");
  };

  const getCookieKey = (type: string) => {
    return `form_${options.formKey}_${type}`;
  };

  const saveLastValues = () => {
    if (!canUseCookies.value || !options.rememberFields) return;

    const valuesToSave: Record<string, any> = {};
    
    options.rememberFields.forEach(field => {
      if (formData[field] !== undefined && formData[field] !== "") {
        valuesToSave[field] = formData[field];
      }
    });

    if (Object.keys(valuesToSave).length > 0) {
      setCookie(
        getCookieKey("last_values"),
        JSON.stringify(valuesToSave),
        {
          expires: options.expirationDays || 30,
          path: "/",
          secure: true,
          sameSite: "Strict"
        }
      );
      lastValues.value = valuesToSave;
    }
  };

  const loadLastValues = () => {
    if (!canUseCookies.value || !options.rememberFields) return;

    const savedData = getCookie(getCookieKey("last_values"));
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        lastValues.value = parsedData;
        
        options.rememberFields.forEach(field => {
          if (parsedData[field] && (!formData[field] || formData[field] === "")) {
            formData[field] = parsedData[field];
          }
        });
      } catch (error) {
        console.warn("Erro ao carregar valores salvos:", error);
      }
    }
  };

  const saveFilters = (filters: Record<string, any>) => {
    if (!canUseCookies.value || !options.rememberFilters) return;

    setCookie(
      getCookieKey("filters"),
      JSON.stringify(filters),
      {
        expires: options.expirationDays || 30,
        path: "/",
        secure: true,
        sameSite: "Strict"
      }
    );
    savedFilters.value = filters;
  };

  const loadFilters = (): Record<string, any> => {
    if (!canUseCookies.value || !options.rememberFilters) return {};

    const savedData = getCookie(getCookieKey("filters"));
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        savedFilters.value = parsedData;
        return parsedData;
      } catch (error) {
        console.warn("Erro ao carregar filtros salvos:", error);
      }
    }
    return {};
  };

  const savePagination = (pagination: Record<string, any>) => {
    if (!canUseCookies.value || !options.rememberPagination) return;

    setCookie(
      getCookieKey("pagination"),
      JSON.stringify(pagination),
      {
        expires: options.expirationDays || 30,
        path: "/",
        secure: true,
        sameSite: "Strict"
      }
    );
    savedPagination.value = pagination;
  };

  const loadPagination = (): Record<string, any> => {
    if (!canUseCookies.value || !options.rememberPagination) return {};

    const savedData = getCookie(getCookieKey("pagination"));
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        savedPagination.value = parsedData;
        return parsedData;
      } catch (error) {
        console.warn("Erro ao carregar paginação salva:", error);
      }
    }
    return {};
  };

  const clearFormCookies = () => {
    if (!canUseCookies.value) return;

    const expiredDate = new Date(0).toUTCString();
    
    document.cookie = `${getCookieKey("last_values")}=; expires=${expiredDate}; path=/`;
    document.cookie = `${getCookieKey("filters")}=; expires=${expiredDate}; path=/`;
    document.cookie = `${getCookieKey("pagination")}=; expires=${expiredDate}; path=/`;

    lastValues.value = {};
    savedFilters.value = {};
    savedPagination.value = {};
  };

  const getCookieInfo = () => {
    return {
      hasLastValues: Object.keys(lastValues.value).length > 0,
      hasFilters: Object.keys(savedFilters.value).length > 0,
      hasPagination: Object.keys(savedPagination.value).length > 0,
      canUseCookies: canUseCookies.value,
      lastValues: lastValues.value,
      savedFilters: savedFilters.value,
      savedPagination: savedPagination.value
    };
  };

  const setupWatchers = () => {
    if (!options.rememberFields) return;

    options.rememberFields.forEach(field => {
      watch(
        () => formData[field],
        (newValue) => {
          if (newValue && newValue !== "") {
            setTimeout(() => {
              saveLastValues();
            }, 1000);
          }
        }
      );
    });
  };

  onMounted(() => {
    checkCookieConsent();
    
    if (canUseCookies.value) {
      loadLastValues();
      setupWatchers();
    }
  });

  watch([hasConsent, () => hasConsentForCategory("functionality")], () => {
    checkCookieConsent();
    
    if (canUseCookies.value) {
      loadLastValues();
      setupWatchers();
    } else {
      clearFormCookies();
    }
  });

  return {
    // Estados
    canUseCookies,
    lastValues,
    savedFilters,
    savedPagination,

    // Métodos para valores de campos
    saveLastValues,
    loadLastValues,

    // Métodos para filtros
    saveFilters,
    loadFilters,

    // Métodos para paginação
    savePagination,
    loadPagination,

    // Utilitários
    clearFormCookies,
    getCookieInfo,

    // Métodos de conveniência
    rememberValue: (field: string, value: any) => {
      if (canUseCookies.value && options.rememberFields?.includes(field)) {
        lastValues.value[field] = value;
        saveLastValues();
      }
    },

    getRememberedValue: (field: string) => {
      return lastValues.value[field] || "";
    },

    hasRememberedValue: (field: string) => {
      return !!lastValues.value[field];
    }
  };
}