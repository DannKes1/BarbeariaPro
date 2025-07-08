import { ref, watch, onMounted, onUnmounted, computed, nextTick } from "vue";
import { useCookies } from "@/composables/useCookies";
import { useSweetAlert } from "@/composables/useSweetAlert";

export interface AutoSaveOptions {
  formKey: string;
  saveInterval?: number; // em milissegundos
  excludeFields?: string[];
  includeFields?: string[]; // Se especificado, apenas estes campos serão salvos
  onRestore?: (data: any) => void;
  onSave?: (data: any) => void;
  onError?: (error: Error) => void;
  maxDrafts?: number; // Máximo de rascunhos por formulário
  autoRestore?: boolean; // Restaurar automaticamente sem perguntar
  saveOnChange?: boolean; // Salvar a cada mudança (com debounce)
  compression?: boolean; // Comprimir dados antes de salvar
  encryption?: boolean; // Criptografar dados sensíveis
  validateBeforeSave?: (data: any) => boolean; // Validar antes de salvar
}

export interface SavedDraft {
  id: string;
  data: any;
  timestamp: string;
  version: string;
  checksum?: string;
  compressed?: boolean;
  encrypted?: boolean;
  metadata?: {
    userAgent: string;
    url: string;
    formVersion?: string;
  };
}

export function useFormAutoSave(formData: any, options: AutoSaveOptions) {
  const {
    getConfiguredCookie,
    setConfiguredCookie,
    COOKIE_CONFIGS,
    hasConsent,
    hasConsentForCategory,
  } = useCookies();

  const { showToast, confirmAction, showInput } = useSweetAlert();

  const isAutoSaveEnabled = ref(true);
  const lastSaveTime = ref<Date | null>(null);
  const saveInterval = options.saveInterval || 30000; // 30 segundos por padrão
  const maxDrafts = options.maxDrafts || 5;
  const isRestoring = ref(false);
  const hasUnsavedChanges = ref(false);
  const saveStatus = ref<"idle" | "saving" | "saved" | "error">("idle");

  // Usar number em vez de NodeJS.Timeout para compatibilidade com navegador
  let autoSaveTimer: number | null = null;
  let changeDebounceTimer: number | null = null;
  let lastSavedData: string = "";

  // Computed para verificar se pode usar auto-save
  const canUseAutoSave = computed(() => {
    return hasConsent.value && hasConsentForCategory("functionality");
  });

  // Computed para obter preferências de formulário
  const formPreferences = computed(() => {
    if (!canUseAutoSave.value)
      return COOKIE_CONFIGS.FORM_PREFERENCES.defaultValue;
    return getConfiguredCookie(COOKIE_CONFIGS.FORM_PREFERENCES);
  });

  /**
   * Gera checksum para verificar integridade dos dados
   */
  const generateChecksum = (data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  };

  /**
   * Comprime dados usando algoritmo simples
   */
  const compressData = (data: string): string => {
    if (!options.compression) return data;

    try {
      // Implementação simples de compressão (pode ser melhorada)
      return btoa(data);
    } catch {
      return data;
    }
  };

  /**
   * Descomprime dados
   */
  const decompressData = (data: string, compressed: boolean): string => {
    if (!compressed || !options.compression) return data;

    try {
      return atob(data);
    } catch {
      return data;
    }
  };

  /**
   * Criptografia simples para dados sensíveis (XOR)
   */
  const encryptData = (data: string): string => {
    if (!options.encryption) return data;

    const key = options.formKey;
    let encrypted = "";

    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }

    return btoa(encrypted);
  };

  /**
   * Descriptografia simples
   */
  const decryptData = (data: string, encrypted: boolean): string => {
    if (!encrypted || !options.encryption) return data;

    try {
      const decoded = atob(data);
      const key = options.formKey;
      let decrypted = "";

      for (let i = 0; i < decoded.length; i++) {
        decrypted += String.fromCharCode(
          decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }

      return decrypted;
    } catch {
      return data;
    }
  };

  /**
   * Filtra dados do formulário baseado nas opções
   */
  const filterFormData = (data: any): any => {
    const filtered = { ...data };

    // Se includeFields está especificado, usar apenas esses campos
    if (options.includeFields && options.includeFields.length > 0) {
      const included: any = {};
      options.includeFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(filtered, field)) {
          included[field] = filtered[field];
        }
      });
      return included;
    }

    // Caso contrário, excluir campos especificados
    if (options.excludeFields) {
      options.excludeFields.forEach((field) => {
        delete filtered[field];
      });
    }

    return filtered;
  };

  /**
   * Valida dados antes de salvar
   */
  const validateData = (data: any): boolean => {
    if (options.validateBeforeSave) {
      return options.validateBeforeSave(data);
    }

    // Validação básica: verificar se há dados
    return Object.keys(data).length > 0;
  };

  /**
   * Salva os dados do formulário nos cookies
   */
  const saveFormData = async (): Promise<boolean> => {
    if (!canUseAutoSave.value || !isAutoSaveEnabled.value) return false;

    try {
      saveStatus.value = "saving";

      // Filtrar dados
      const dataToSave = filterFormData(formData);

      // Validar dados
      if (!validateData(dataToSave)) {
        console.warn("Dados do formulário não passaram na validação");
        saveStatus.value = "error";
        return false;
      }

      // Verificar se houve mudanças
      const currentDataString = JSON.stringify(dataToSave);
      if (currentDataString === lastSavedData) {
        saveStatus.value = "saved";
        return true; // Não há mudanças
      }

      // Obter rascunhos existentes
      const existingDrafts =
        getConfiguredCookie(COOKIE_CONFIGS.FORM_DRAFTS) || {};
      const formDrafts: SavedDraft[] = existingDrafts[options.formKey] || [];

      // Preparar dados para salvar
      let processedData = currentDataString;
      const compressed = !!options.compression;
      const encrypted = !!options.encryption;

      if (compressed) {
        processedData = compressData(processedData);
      }

      if (encrypted) {
        processedData = encryptData(processedData);
      }

      // Criar novo rascunho
      const newDraft: SavedDraft = {
        id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        data: processedData,
        timestamp: new Date().toISOString(),
        version: "2.0",
        checksum: generateChecksum(currentDataString),
        compressed,
        encrypted,
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          formVersion: "1.0",
        },
      };

      // Adicionar novo rascunho
      formDrafts.unshift(newDraft);

      // Limitar número de rascunhos
      if (formDrafts.length > maxDrafts) {
        formDrafts.splice(maxDrafts);
      }

      // Salvar rascunhos atualizados
      existingDrafts[options.formKey] = formDrafts;
      setConfiguredCookie(COOKIE_CONFIGS.FORM_DRAFTS, existingDrafts);

      lastSaveTime.value = new Date();
      lastSavedData = currentDataString;
      hasUnsavedChanges.value = false;
      saveStatus.value = "saved";

      if (options.onSave) {
        options.onSave(dataToSave);
      }

      return true;
    } catch (error) {
      console.error("Erro ao salvar rascunho do formulário:", error);
      saveStatus.value = "error";

      if (options.onError) {
        options.onError(error as Error);
      }

      return false;
    }
  };

  /**
   * Carrega rascunhos salvos do formulário
   */
  const loadFormDrafts = (): SavedDraft[] => {
    if (!canUseAutoSave.value) return [];

    try {
      const savedDrafts = getConfiguredCookie(COOKIE_CONFIGS.FORM_DRAFTS) || {};
      return savedDrafts[options.formKey] || [];
    } catch (error) {
      console.error("Erro ao carregar rascunhos do formulário:", error);
      return [];
    }
  };

  /**
   * Carrega dados de um rascunho específico
   */
  const loadDraftData = (draft: SavedDraft): any | null => {
    try {
      let processedData = draft.data;

      // Descriptografar se necessário
      if (draft.encrypted) {
        processedData = decryptData(processedData, true);
      }

      // Descomprimir se necessário
      if (draft.compressed) {
        processedData = decompressData(processedData, true);
      }

      const parsedData = JSON.parse(processedData);

      // Verificar integridade se há checksum
      if (draft.checksum) {
        const currentChecksum = generateChecksum(JSON.stringify(parsedData));
        if (currentChecksum !== draft.checksum) {
          console.warn("Checksum não confere - dados podem estar corrompidos");
        }
      }

      return {
        ...parsedData,
        _metadata: {
          ...draft.metadata,
          age: Date.now() - new Date(draft.timestamp).getTime(),
          draftId: draft.id,
        },
      };
    } catch (error) {
      console.error("Erro ao carregar dados do rascunho:", error);
      return null;
    }
  };

  /**
   * Remove um rascunho específico
   */
  const deleteDraft = (draftId: string): boolean => {
    try {
      const existingDrafts =
        getConfiguredCookie(COOKIE_CONFIGS.FORM_DRAFTS) || {};
      const formDrafts: SavedDraft[] = existingDrafts[options.formKey] || [];

      const updatedDrafts = formDrafts.filter((draft) => draft.id !== draftId);
      existingDrafts[options.formKey] = updatedDrafts;

      setConfiguredCookie(COOKIE_CONFIGS.FORM_DRAFTS, existingDrafts);
      return true;
    } catch (error) {
      console.error("Erro ao deletar rascunho:", error);
      return false;
    }
  };

  /**
   * Remove todos os rascunhos do formulário
   */
  const clearAllDrafts = (): boolean => {
    try {
      const existingDrafts =
        getConfiguredCookie(COOKIE_CONFIGS.FORM_DRAFTS) || {};
      delete existingDrafts[options.formKey];
      setConfiguredCookie(COOKIE_CONFIGS.FORM_DRAFTS, existingDrafts);
      lastSaveTime.value = null;
      hasUnsavedChanges.value = false;
      return true;
    } catch (error) {
      console.error("Erro ao limpar rascunhos do formulário:", error);
      return false;
    }
  };

  /**
   * Restaura dados de um rascunho no formulário
   */
  const restoreFromDraft = async (draft: SavedDraft): Promise<boolean> => {
    try {
      isRestoring.value = true;

      const draftData = loadDraftData(draft);
      if (!draftData) {
        showToast.error("Erro ao carregar dados do rascunho");
        return false;
      }

      // Aplicar dados ao formulário
      await nextTick();

      Object.keys(draftData).forEach((key) => {
        if (
          key !== "_metadata" &&
          Object.prototype.hasOwnProperty.call(formData, key)
        ) {
          formData[key] = draftData[key];
        }
      });

      if (options.onRestore) {
        options.onRestore(draftData);
      }

      lastSavedData = JSON.stringify(filterFormData(formData));
      hasUnsavedChanges.value = false;

      showToast.success("Dados do rascunho restaurados!");
      return true;
    } catch (error) {
      console.error("Erro ao restaurar dados do formulário:", error);
      showToast.error("Erro ao restaurar rascunho");
      return false;
    } finally {
      isRestoring.value = false;
    }
  };

  /**
   * Verifica e oferece restauração de rascunhos
   */
  const checkForSavedDrafts = async (): Promise<void> => {
    if (!canUseAutoSave.value) return;

    const drafts = loadFormDrafts();
    if (drafts.length === 0) return;

    const latestDraft = drafts[0];
    const draftAge = Date.now() - new Date(latestDraft.timestamp).getTime();
    const ageInMinutes = Math.floor(draftAge / (1000 * 60));

    // Auto-restaurar se configurado e rascunho é recente (< 5 minutos)
    if (options.autoRestore && ageInMinutes < 5) {
      await restoreFromDraft(latestDraft);
      return;
    }

    // Mostrar opções de restauração
    const ageText =
      ageInMinutes < 60
        ? `${ageInMinutes} minuto(s)`
        : `${Math.floor(ageInMinutes / 60)} hora(s)`;

    if (drafts.length === 1) {
      const shouldRestore = await confirmAction(
        "Rascunho encontrado",
        `Encontramos um rascunho salvo há ${ageText}. Deseja restaurar os dados?`,
        "Sim, restaurar"
      );

      if (shouldRestore) {
        await restoreFromDraft(latestDraft);
      } else {
        deleteDraft(latestDraft.id);
      }
    } else {
      // Múltiplos rascunhos - mostrar lista
      await showDraftManager();
    }
  };

  /**
   * Mostra gerenciador de rascunhos
   */
  const showDraftManager = async (): Promise<void> => {
    const drafts = loadFormDrafts();
    if (drafts.length === 0) {
      showToast.info("Nenhum rascunho encontrado");
      return;
    }

    // Aqui você pode implementar um modal personalizado
    // Por enquanto, usar confirmação simples
    const draftsList = drafts
      .map((draft, index) => {
        const age = Math.floor(
          (Date.now() - new Date(draft.timestamp).getTime()) / (1000 * 60)
        );
        const ageText = age < 60 ? `${age}min` : `${Math.floor(age / 60)}h`;
        return `${index + 1}. Rascunho de ${ageText} atrás`;
      })
      .join("\n");

    const choice = await showInput(
      "Rascunhos Disponíveis",
      `Escolha um rascunho para restaurar:\n${draftsList}\n\nDigite o número (1-${drafts.length}) ou 0 para cancelar:`,
      "number"
    );

    const choiceNum = parseInt(choice || "0");
    if (choiceNum > 0 && choiceNum <= drafts.length) {
      await restoreFromDraft(drafts[choiceNum - 1]);
    }
  };

  /**
   * Inicia o auto-save
   */
  const startAutoSave = (): void => {
    if (!canUseAutoSave.value || !formPreferences.value.autoSave) return;

    stopAutoSave(); // Limpar timer existente

    autoSaveTimer = window.setInterval(async () => {
      await saveFormData();
    }, formPreferences.value.autoSaveInterval || saveInterval);
  };

  /**
   * Para o auto-save
   */
  const stopAutoSave = (): void => {
    if (autoSaveTimer) {
      window.clearInterval(autoSaveTimer);
      autoSaveTimer = null;
    }
  };

  /**
   * Força um save imediato
   */
  const forceSave = async (): Promise<boolean> => {
    return await saveFormData();
  };

  /**
   * Limpa todos os dados e para o auto-save
   */
  const cleanup = (): void => {
    stopAutoSave();
    if (changeDebounceTimer) {
      window.clearTimeout(changeDebounceTimer);
    }
    clearAllDrafts();
  };

  /**
   * Verifica se há mudanças não salvas
   */
  const checkUnsavedChanges = (): boolean => {
    if (!canUseAutoSave.value) return false;

    const currentData = JSON.stringify(filterFormData(formData));
    return currentData !== lastSavedData;
  };

  /**
   * Configura watchers para auto-save
   */
  const setupWatchers = (): void => {
    if (!canUseAutoSave.value) return;

    // Watch para mudanças no formulário
    watch(
      () => formData,
      () => {
        if (isRestoring.value) return;

        hasUnsavedChanges.value = checkUnsavedChanges();

        if (isAutoSaveEnabled.value && formPreferences.value.autoSave) {
          // Debounce para save on change
          if (options.saveOnChange || formPreferences.value.saveOnChange) {
            if (changeDebounceTimer) {
              window.clearTimeout(changeDebounceTimer);
            }

            changeDebounceTimer = window.setTimeout(async () => {
              await saveFormData();
            }, 2000);
          }
        }
      },
      { deep: true }
    );

    // Watch para mudanças nas preferências
    watch(formPreferences, (newPrefs) => {
      if (newPrefs.autoSave) {
        startAutoSave();
      } else {
        stopAutoSave();
      }
    });
  };

  /**
   * Handler para beforeunload
   */
  const handleBeforeUnload = (event: BeforeUnloadEvent): string | undefined => {
    if (!formPreferences.value.confirmBeforeLeave) return;

    if (checkUnsavedChanges()) {
      forceSave(); // Tentar salvar antes de sair

      const message =
        "Você tem alterações não salvas. Tem certeza que deseja sair?";
      event.preventDefault();
      event.returnValue = message;
      return message;
    }
  };

  // Lifecycle hooks
  onMounted(async () => {
    if (canUseAutoSave.value) {
      await checkForSavedDrafts();
      setupWatchers();
      startAutoSave();

      // Inicializar lastSavedData
      lastSavedData = JSON.stringify(filterFormData(formData));
    }
  });

  onUnmounted(() => {
    stopAutoSave();
    if (changeDebounceTimer) {
      window.clearTimeout(changeDebounceTimer);
    }
  });

  // Adicionar listener para beforeunload
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", handleBeforeUnload);

    onUnmounted(() => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    });
  }

  return {
    // Estados
    isAutoSaveEnabled,
    lastSaveTime,
    isRestoring,
    hasUnsavedChanges,
    saveStatus,
    canUseAutoSave,

    // Métodos principais
    saveFormData,
    loadFormDrafts,
    loadDraftData,
    restoreFromDraft,
    checkForSavedDrafts,
    showDraftManager,

    // Controles
    startAutoSave,
    stopAutoSave,
    forceSave,
    cleanup,

    // Gerenciamento de rascunhos
    deleteDraft,
    clearAllDrafts,

    // Utilitários
    checkUnsavedChanges,

    // Controles de estado
    enableAutoSave: () => {
      isAutoSaveEnabled.value = true;
      if (canUseAutoSave.value) {
        startAutoSave();
      }
    },
    disableAutoSave: () => {
      isAutoSaveEnabled.value = false;
      stopAutoSave();
    },

    // Informações
    getDraftCount: () => loadFormDrafts().length,
    getLastSaveTime: () => lastSaveTime.value,
    getSaveStatus: () => saveStatus.value,
  };
}
