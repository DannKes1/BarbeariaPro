<template>
  <Teleport to="body">
    <div
      v-if="showBanner"
      class="cookie-consent-banner"
      :class="{ 'cookie-consent-banner--visible': isVisible }"
    >
      <div class="cookie-consent-content">
        <div class="cookie-consent-text">
          <h4>🍪 Uso de Cookies</h4>
          <p>
            Utilizamos cookies para melhorar sua experiência, personalizar
            conteúdo e analisar o tráfego. Ao continuar navegando, você concorda
            com nossa
            <a href="#" @click.prevent="showPolicy = true" class="cookie-link"
              >Política de Cookies</a
            >.
          </p>
        </div>

        <div class="cookie-consent-actions">
          <button
            class="btn btn-outline-secondary me-2"
            @click="showPreferences = true"
          >
            Configurar
          </button>
          <button class="btn btn-secondary me-2" @click="acceptEssential">
            Apenas Essenciais
          </button>
          <button class="btn btn-primary" @click="acceptAll">
            Aceitar Todos
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Preferências -->
    <div
      v-if="showPreferences"
      class="cookie-modal-overlay"
      @click="showPreferences = false"
    >
      <div class="cookie-modal" @click.stop>
        <div class="cookie-modal-header">
          <h3>Configurações de Cookies</h3>
          <button
            class="btn-close"
            @click="showPreferences = false"
            aria-label="Fechar"
          ></button>
        </div>

        <div class="cookie-modal-body">
          <div class="cookie-category">
            <div class="cookie-category-header">
              <h5>Cookies Essenciais</h5>
              <div class="form-check form-switch">
                <input
                  class="form-check-input"
                  type="checkbox"
                  checked
                  disabled
                />
                <label class="form-check-label">Sempre ativo</label>
              </div>
            </div>
            <p class="cookie-category-description">
              Necessários para o funcionamento básico do site, incluindo
              autenticação e navegação.
            </p>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <h5>Cookies de Preferências</h5>
              <div class="form-check form-switch">
                <input
                  v-model="preferences.preferences"
                  class="form-check-input"
                  type="checkbox"
                  id="pref-preferences"
                />
                <label class="form-check-label" for="pref-preferences">
                  {{ preferences.preferences ? "Ativo" : "Inativo" }}
                </label>
              </div>
            </div>
            <p class="cookie-category-description">
              Lembram suas configurações de interface, tema e outras
              preferências pessoais.
            </p>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <h5>Cookies de Funcionalidade</h5>
              <div class="form-check form-switch">
                <input
                  v-model="preferences.functionality"
                  class="form-check-input"
                  type="checkbox"
                  id="pref-functionality"
                />
                <label class="form-check-label" for="pref-functionality">
                  {{ preferences.functionality ? "Ativo" : "Inativo" }}
                </label>
              </div>
            </div>
            <p class="cookie-category-description">
              Permitem funcionalidades avançadas como salvamento automático de
              formulários e filtros.
            </p>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <h5>Cookies de Análise</h5>
              <div class="form-check form-switch">
                <input
                  v-model="preferences.analytics"
                  class="form-check-input"
                  type="checkbox"
                  id="pref-analytics"
                />
                <label class="form-check-label" for="pref-analytics">
                  {{ preferences.analytics ? "Ativo" : "Inativo" }}
                </label>
              </div>
            </div>
            <p class="cookie-category-description">
              Ajudam a entender como você usa o site para melhorarmos a
              experiência.
            </p>
          </div>
        </div>

        <div class="cookie-modal-footer">
          <button
            class="btn btn-secondary me-2"
            @click="showPreferences = false"
          >
            Cancelar
          </button>
          <button class="btn btn-primary" @click="savePreferences">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Política -->
    <div
      v-if="showPolicy"
      class="cookie-modal-overlay"
      @click="showPolicy = false"
    >
      <div class="cookie-modal cookie-modal--large" @click.stop>
        <div class="cookie-modal-header">
          <h3>Política de Cookies</h3>
          <button
            class="btn-close"
            @click="showPolicy = false"
            aria-label="Fechar"
          ></button>
        </div>

        <div class="cookie-modal-body">
          <div class="cookie-policy-content">
            <h4>O que são cookies?</h4>
            <p>
              Cookies são pequenos arquivos de texto armazenados em seu
              dispositivo quando você visita um site. Eles são amplamente
              utilizados para fazer os sites funcionarem de forma mais eficiente
              e fornecer informações aos proprietários do site.
            </p>

            <h4>Como utilizamos cookies?</h4>
            <p>Utilizamos cookies para:</p>
            <ul>
              <li>Manter você logado durante sua sessão</li>
              <li>Lembrar suas preferências de interface</li>
              <li>Salvar filtros e configurações de consultas</li>
              <li>Melhorar a performance e funcionalidade do site</li>
              <li>
                Analisar como o site é utilizado (apenas com seu consentimento)
              </li>
            </ul>

            <h4>Tipos de cookies que utilizamos:</h4>
            <ul>
              <li>
                <strong>Essenciais:</strong> Necessários para o funcionamento
                básico
              </li>
              <li>
                <strong>Preferências:</strong> Lembram suas configurações
                pessoais
              </li>
              <li>
                <strong>Funcionalidade:</strong> Habilitam recursos avançados
              </li>
              <li>
                <strong>Análise:</strong> Ajudam a melhorar o site (opcional)
              </li>
            </ul>

            <h4>Seus direitos</h4>
            <p>
              Você pode gerenciar suas preferências de cookies a qualquer
              momento através das configurações do seu navegador ou clicando no
              ícone de cookies no rodapé do site.
            </p>
          </div>
        </div>

        <div class="cookie-modal-footer">
          <button class="btn btn-primary" @click="showPolicy = false">
            Entendi
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import { useCookies } from "@/composables/useCookies";

export default defineComponent({
  name: "CookieConsent",
  setup() {
    const { hasConsent, setConsent, COOKIE_CONFIGS } = useCookies();

    const showBanner = ref(false);
    const isVisible = ref(false);
    const showPreferences = ref(false);
    const showPolicy = ref(false);

    const preferences = ref({
      essential: true, // sempre ativo
      preferences: true,
      functionality: true,
      analytics: false,
    });

    const shouldShowBanner = computed(() => {
      return !hasConsent.value;
    });

    const acceptAll = () => {
      const allPreferences = {
        essential: true,
        preferences: true,
        functionality: true,
        analytics: true,
      };

      setConsent(true, allPreferences);
      hideBanner();
    };

    const acceptEssential = () => {
      const essentialOnly = {
        essential: true,
        preferences: false,
        functionality: false,
        analytics: false,
      };

      setConsent(true, essentialOnly);
      hideBanner();
    };

    const savePreferences = () => {
      setConsent(true, preferences.value);
      showPreferences.value = false;
      hideBanner();
    };

    const hideBanner = () => {
      isVisible.value = false;
      setTimeout(() => {
        showBanner.value = false;
      }, 300);
    };

    const showBannerWithAnimation = () => {
      if (shouldShowBanner.value) {
        showBanner.value = true;
        setTimeout(() => {
          isVisible.value = true;
        }, 100);
      }
    };

    onMounted(() => {
      // Aguardar um pouco antes de mostrar o banner
      setTimeout(() => {
        showBannerWithAnimation();
      }, 1000);
    });

    return {
      showBanner,
      isVisible,
      showPreferences,
      showPolicy,
      preferences,
      acceptAll,
      acceptEssential,
      savePreferences,
    };
  },
});
</script>

<style scoped>
.cookie-consent-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #dee2e6;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  transform: translateY(100%);
  transition: transform 0.3s ease-in-out;
  padding: 1rem;
}

.cookie-consent-banner--visible {
  transform: translateY(0);
}

.cookie-consent-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.cookie-consent-text h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #333;
}

.cookie-consent-text p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.cookie-link {
  color: #0d6efd;
  text-decoration: underline;
}

.cookie-link:hover {
  color: #0a58ca;
}

.cookie-consent-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.cookie-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.cookie-modal {
  background: #fff;
  border-radius: 0.5rem;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.cookie-modal--large {
  max-width: 800px;
}

.cookie-modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cookie-modal-header h3 {
  margin: 0;
  color: #333;
}

.cookie-modal-body {
  padding: 1.5rem;
}

.cookie-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.cookie-category {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.cookie-category:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.cookie-category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.cookie-category-header h5 {
  margin: 0;
  color: #333;
  font-size: 1rem;
}

.cookie-category-description {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.cookie-policy-content h4 {
  color: #333;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.cookie-policy-content h4:first-child {
  margin-top: 0;
}

.cookie-policy-content ul {
  margin-bottom: 1rem;
}

.cookie-policy-content li {
  margin-bottom: 0.25rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .cookie-consent-content {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .cookie-consent-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .cookie-modal {
    margin: 0.5rem;
    max-height: 90vh;
  }

  .cookie-category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
