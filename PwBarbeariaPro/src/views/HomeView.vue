<template>
  <div class="home-container">
    <!-- Configurações de Visualização (usando cookies) -->
    <div v-if="showConfigPanel" class="config-panel">
      <div class="config-content">
        <div class="config-header">
          <h3>⚙️ Configurações de Visualização</h3>
          <button @click="showConfigPanel = false" class="close-btn">×</button>
        </div>

        <div class="config-options">
          <div class="config-option">
            <label>
              <input
                type="checkbox"
                v-model="viewPreferences.showStatistics"
                @change="saveViewPreferences"
              />
              Mostrar estatísticas no hero
            </label>
          </div>

          <div class="config-option">
            <label>
              <input
                type="checkbox"
                v-model="viewPreferences.showQuickActions"
                @change="saveViewPreferences"
              />
              Exibir ações rápidas
            </label>
          </div>

          <div class="config-option">
            <label>
              <input
                type="checkbox"
                v-model="viewPreferences.showUpcomingAppointments"
                @change="saveViewPreferences"
              />
              Mostrar próximos agendamentos
            </label>
          </div>

          <div class="config-option">
            <label>Tema da página:</label>
            <select
              v-model="viewPreferences.theme"
              @change="saveViewPreferences"
              class="theme-select"
            >
              <option value="default">Padrão (Gradiente)</option>
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>
        </div>

        <div class="config-footer">
          <small v-if="cookieInfo.hasLastValues" class="text-success">
            💾 Configurações salvas nos cookies
          </small>
          <button @click="resetPreferences" class="btn-reset">
            Restaurar Padrões
          </button>
        </div>
      </div>
    </div>

    <!-- Botão de Configurações -->
    <button
      class="config-toggle-btn"
      @click="showConfigPanel = !showConfigPanel"
      title="Configurações de Visualização"
    >
      ⚙️
    </button>

    <!-- Hero Section -->
    <section class="hero-section" :class="getThemeClass()">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="gradient-text">BarbeariaPro</span>
            <br />Sistema de Gestão
          </h1>
          <p class="hero-subtitle">
            Gerencie sua barbearia com eficiência e estilo. Controle
            agendamentos, clientes, profissionais e financeiro em um só lugar.
          </p>
          <div class="hero-buttons">
            <button class="btn-primary-large" @click="irParaDashboard">
              <i data-feather="bar-chart-2"></i>
              Acessar Dashboard
            </button>
            <button class="btn-secondary-large" @click="mostrarTour">
              <i data-feather="play-circle"></i>
              Tour do Sistema
            </button>
          </div>
        </div>

        <!-- Estatísticas (controladas por cookie) -->
        <div v-if="viewPreferences.showStatistics" class="hero-image">
          <div class="floating-card">
            <div class="card-stats">
              <div class="stat-item">
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                  <span class="stat-number">{{
                    estatisticas.agendamentosHoje
                  }}</span>
                  <span class="stat-label">Agendamentos Hoje</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                  <span class="stat-number"
                    >R$ {{ estatisticas.faturamento }}</span
                  >
                  <span class="stat-label">Faturamento</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                  <span class="stat-number">{{ estatisticas.clientes }}</span>
                  <span class="stat-label">Clientes Ativos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Funcionalidades Principais</h2>
          <p class="section-subtitle">
            Tudo que você precisa para gerenciar sua barbearia
          </p>
        </div>

        <div class="features-grid">
          <div
            class="feature-card"
            v-for="feature in features"
            :key="feature.id"
            @click="acessarFuncionalidade(feature)"
          >
            <div
              class="feature-icon"
              :style="{ backgroundColor: feature.color }"
            >
              <i :data-feather="feature.icon"></i>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
            <div class="feature-stats">
              <span class="feature-stat">{{ feature.stat }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Actions Section (controlada por cookie) -->
    <section
      v-if="viewPreferences.showQuickActions"
      class="quick-actions-section"
    >
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Ações Rápidas</h2>
          <p class="section-subtitle">
            Acesse rapidamente as funcionalidades mais usadas
          </p>
        </div>

        <div class="quick-actions-grid">
          <button
            v-for="action in quickActions"
            :key="action.id"
            class="quick-action-btn"
            @click="executarAcaoRapida(action)"
            :style="{ '--accent-color': action.color }"
          >
            <div class="action-icon">
              <i :data-feather="action.icon"></i>
            </div>
            <span class="action-label">{{ action.label }}</span>
            <div class="action-badge" v-if="action.badge">
              {{ action.badge }}
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- Status Section -->
    <section class="status-section">
      <div class="container">
        <div class="status-grid">
          <div class="status-card">
            <div class="status-header">
              <h3>Status do Sistema</h3>
              <div class="status-indicator online">
                <span class="status-dot"></span>
                Online
              </div>
            </div>
            <div class="status-items">
              <div class="status-item">
                <span class="status-label">Caixa</span>
                <span class="status-value" :class="caixaStatus.class">{{
                  caixaStatus.text
                }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Último Backup</span>
                <span class="status-value">{{ ultimoBackup }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Usuários Online</span>
                <span class="status-value">{{ usuariosOnline }}</span>
              </div>
            </div>
          </div>

          <!-- Próximos Agendamentos (controlado por cookie) -->
          <div
            v-if="viewPreferences.showUpcomingAppointments"
            class="status-card"
          >
            <div class="status-header">
              <h3>Próximos Agendamentos</h3>
              <button class="btn-sm" @click="verTodosAgendamentos">
                Ver Todos
              </button>
            </div>
            <div class="agendamentos-list">
              <div
                v-for="agendamento in proximosAgendamentos"
                :key="agendamento.id"
                class="agendamento-item"
                @click="verDetalhesAgendamento(agendamento)"
              >
                <div class="agendamento-time">{{ agendamento.horario }}</div>
                <div class="agendamento-info">
                  <div class="agendamento-cliente">
                    {{ agendamento.cliente }}
                  </div>
                  <div class="agendamento-servico">
                    {{ agendamento.servico }}
                  </div>
                </div>
                <div class="agendamento-status" :class="agendamento.status">
                  {{ getStatusText(agendamento.status) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Debug info (apenas para demonstração) -->
    <div v-if="showDebugInfo" class="debug-panel">
      <h3 class="font-semibold mb-2">Informações dos Cookies (Debug)</h3>
      <div class="text-xs space-y-2">
        <div>
          <strong>Pode usar cookies:</strong> {{ cookieInfo.canUseCookies }}
        </div>
        <div>
          <strong>Preferências salvas:</strong>
          {{ JSON.stringify(cookieInfo.lastValues) }}
        </div>
        <div><strong>Tema atual:</strong> {{ viewPreferences.theme }}</div>
      </div>
      <button @click="showDebugInfo = false" class="text-sm text-gray-600 mt-2">
        Ocultar debug
      </button>
    </div>

    <button v-else @click="showDebugInfo = true" class="debug-toggle">
      Debug cookies
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { useFormCookies } from "@/composables/useFormCookies";
import feather from "feather-icons";

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  stat: string;
  route: string;
}

interface QuickAction {
  id: number;
  label: string;
  icon: string;
  color: string;
  action: string;
  badge?: string;
}

interface Agendamento {
  id: number;
  cliente: string;
  servico: string;
  horario: string;
  status: "confirmado" | "pendente" | "cancelado";
}

export default defineComponent({
  name: "HomeView",
  setup() {
    const router = useRouter();
    const {
      showToast,
      showSuccess,
      confirmAction,
      showLoading,
      hideLoading,
      Swal,
    } = useSweetAlert();

    const showConfigPanel = ref(false);
    const showDebugInfo = ref(false);

    // Preferências de visualização (salvas em cookies)
    const viewPreferences = ref({
      showStatistics: true,
      showQuickActions: true,
      showUpcomingAppointments: true,
      theme: "default",
    });

    // Configurar cookies para preferências de visualização
    const {
      canUseCookies,
      saveLastValues,
      loadLastValues,
      clearFormCookies,
      getCookieInfo,
      rememberValue,
      getRememberedValue,
      hasRememberedValue,
    } = useFormCookies(viewPreferences.value, {
      formKey: "home_view_preferences",
      rememberFields: [
        "showStatistics",
        "showQuickActions",
        "showUpcomingAppointments",
        "theme",
      ],
      expirationDays: 90,
    });

    // Computed para informações dos cookies
    const cookieInfo = computed(() => getCookieInfo());

    const estatisticas = ref({
      agendamentosHoje: 12,
      faturamento: "2.450,00",
      clientes: 156,
    });

    const features = ref<Feature[]>([
      {
        id: 1,
        title: "Agendamentos",
        description: "Gerencie todos os agendamentos de forma eficiente",
        icon: "calendar",
        color: "#3B82F6",
        stat: "12 hoje",
        route: "/agendamentos",
      },
      {
        id: 2,
        title: "Clientes",
        description: "Cadastre e acompanhe o histórico dos seus clientes",
        icon: "users",
        color: "#10B981",
        stat: "156 ativos",
        route: "/clientes",
      },
      {
        id: 3,
        title: "Profissionais",
        description: "Controle a agenda e performance dos profissionais",
        icon: "user-check",
        color: "#F59E0B",
        stat: "8 ativos",
        route: "/profissionais",
      },
      {
        id: 4,
        title: "Financeiro",
        description: "Acompanhe receitas, despesas e fluxo de caixa",
        icon: "dollar-sign",
        color: "#EF4444",
        stat: "R$ 2.450",
        route: "/financeiro",
      },
      {
        id: 5,
        title: "Serviços",
        description: "Cadastre serviços, preços e promoções",
        icon: "scissors",
        color: "#8B5CF6",
        stat: "15 serviços",
        route: "/servicos",
      },
      {
        id: 6,
        title: "Relatórios",
        description: "Análises detalhadas e insights do negócio",
        icon: "bar-chart-2",
        color: "#06B6D4",
        stat: "5 relatórios",
        route: "/relatorios",
      },
    ]);

    const quickActions = ref<QuickAction[]>([
      {
        id: 1,
        label: "Novo Agendamento",
        icon: "plus-circle",
        color: "#3B82F6",
        action: "novo-agendamento",
      },
      {
        id: 2,
        label: "Abrir Caixa",
        icon: "unlock",
        color: "#10B981",
        action: "abrir-caixa",
      },
      {
        id: 3,
        label: "Registrar Pagamento",
        icon: "credit-card",
        color: "#F59E0B",
        action: "registrar-pagamento",
      },
      {
        id: 4,
        label: "Novo Cliente",
        icon: "user-plus",
        color: "#EF4444",
        action: "novo-cliente",
      },
    ]);

    const caixaStatus = ref({
      text: "Aberto",
      class: "status-success",
    });

    const ultimoBackup = ref("Hoje, 08:30");
    const usuariosOnline = ref(3);

    const proximosAgendamentos = ref<Agendamento[]>([
      {
        id: 1,
        cliente: "João Silva",
        servico: "Corte + Barba",
        horario: "14:30",
        status: "confirmado",
      },
      {
        id: 2,
        cliente: "Pedro Santos",
        servico: "Corte Masculino",
        horario: "15:00",
        status: "pendente",
      },
      {
        id: 3,
        cliente: "Carlos Lima",
        servico: "Barba",
        horario: "15:30",
        status: "confirmado",
      },
    ]);

    // Funções para gerenciar preferências
    function saveViewPreferences() {
      if (canUseCookies.value) {
        saveLastValues();
        showToast.info("Preferências de visualização salvas!");
      }
    }

    function resetPreferences() {
      viewPreferences.value = {
        showStatistics: true,
        showQuickActions: true,
        showUpcomingAppointments: true,
        theme: "default",
      };
      clearFormCookies();
      showToast.success("Preferências restauradas para o padrão!");
    }

    function getThemeClass() {
      switch (viewPreferences.value.theme) {
        case "light":
          return "theme-light";
        case "dark":
          return "theme-dark";
        default:
          return "";
      }
    }

    function irParaDashboard(): void {
      showLoading("Carregando dashboard...");
      setTimeout(() => {
        hideLoading();
        router.push("/dashboard");
        showToast.success("Dashboard carregado!");
      }, 1500);
    }

    async function mostrarTour(): Promise<void> {
      const { value: iniciarTour } = await Swal.fire({
        title: "🎯 Tour do Sistema",
        html: `
          <div style="text-align: left; margin: 20px 0;">
            <p><strong>O tour inclui:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>📅 Como criar agendamentos</li>
              <li>👥 Gerenciamento de clientes</li>
              <li>💰 Controle financeiro</li>
              <li>📊 Relatórios e análises</li>
              <li>⚙️ Configurações do sistema</li>
            </ul>
            <p><em>Duração estimada: 5 minutos</em></p>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "🚀 Iniciar Tour",
        cancelButtonText: "Talvez depois",
        customClass: {
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-secondary",
        },
      });

      if (iniciarTour) {
        showSuccess(
          "Tour iniciado!",
          "Siga as instruções na tela para conhecer o sistema."
        );
      }
    }

    function acessarFuncionalidade(feature: Feature): void {
      showToast.info(`Acessando ${feature.title}...`);
      router.push(feature.route);
    }

    async function executarAcaoRapida(action: QuickAction): Promise<void> {
      const confirmed = await confirmAction(
        `${action.label}`,
        `Deseja ${action.label.toLowerCase()}?`,
        "Sim, continuar"
      );

      if (confirmed) {
        showLoading(`Executando ${action.label.toLowerCase()}...`);

        setTimeout(() => {
          hideLoading();

          switch (action.action) {
            case "novo-agendamento":
              router.push("/agendamentos/novo");
              break;
            case "abrir-caixa":
              router.push("/caixa/abrir");
              break;
            case "registrar-pagamento":
              router.push("/pagamentos/novo");
              break;
            case "novo-cliente":
              router.push("/clientes/novo");
              break;
          }

          showToast.success(`${action.label} executado!`);
        }, 1000);
      }
    }

    function verTodosAgendamentos(): void {
      router.push("/agendamentos");
    }

    function verDetalhesAgendamento(agendamento: Agendamento): void {
      showToast.info(`Visualizando agendamento de ${agendamento.cliente}`);
      router.push(`/agendamentos/${agendamento.id}`);
    }

    function getStatusText(status: string): string {
      const statusMap: Record<string, string> = {
        confirmado: "Confirmado",
        pendente: "Pendente",
        cancelado: "Cancelado",
      };
      return statusMap[status] || status;
    }

    onMounted(() => {
      feather.replace();

      // Carregar preferências salvas
      if (canUseCookies.value) {
        loadLastValues();
      }

      showToast.success("Bem-vindo ao BarbeariaPro!");
    });

    return {
      estatisticas,
      features,
      quickActions,
      caixaStatus,
      ultimoBackup,
      usuariosOnline,
      proximosAgendamentos,
      showConfigPanel,
      showDebugInfo,
      viewPreferences,
      cookieInfo,
      irParaDashboard,
      mostrarTour,
      acessarFuncionalidade,
      executarAcaoRapida,
      verTodosAgendamentos,
      verDetalhesAgendamento,
      getStatusText,
      saveViewPreferences,
      resetPreferences,
      getThemeClass,
      canUseCookies,
    };
  },
});
</script>

<style scoped>
/* Estilos originais mantidos + novos estilos para configurações */

/* Reset e Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  position: relative;
}

/* Temas */
.theme-light .hero-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #1a202c;
}

.theme-dark .hero-section {
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  color: #f7fafc;
}

/* Painel de Configurações */
.config-toggle-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: all 0.3s ease;
}

.config-toggle-btn:hover {
  transform: scale(1.1);
  background: white;
}

.config-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  overflow-y: auto;
}

.config-content {
  padding: 20px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.config-header h3 {
  margin: 0;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f3f4f6;
}

.config-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.config-option {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.config-option label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #374151;
}

.theme-select {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
}

.config-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-reset {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-reset:hover {
  background: #dc2626;
}

.text-success {
  color: #10b981;
  font-size: 0.8rem;
}

/* Debug Panel */
.debug-panel {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-size: 0.8rem;
  max-width: 300px;
  z-index: 1000;
}

.debug-toggle {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  z-index: 1000;
}

/* Hero Section */
.hero-section {
  padding: 80px 20px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-text {
  color: white;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
}

.gradient-text {
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-primary-large,
.btn-secondary-large {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary-large {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
}

.btn-primary-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
}

.btn-secondary-large {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.btn-secondary-large:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Floating Card */
.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.floating-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.card-stats {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Features Section */
.features-section {
  padding: 100px 20px;
  background: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #6b7280;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: white;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.feature-description {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 16px;
}

.feature-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feature-stat {
  font-weight: 600;
  color: #3b82f6;
}

/* Quick Actions Section */
.quick-actions-section {
  padding: 100px 20px;
  background: #f9fafb;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.quick-action-btn {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.quick-action-btn:hover {
  border-color: var(--accent-color);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: var(--accent-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-label {
  font-weight: 600;
  color: #1f2937;
}

.action-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 600;
}

/* Status Section */
.status-section {
  padding: 100px 20px;
  background: white;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 32px;
}

.status-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.status-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-indicator.online {
  color: #10b981;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  color: #6b7280;
}

.status-value {
  font-weight: 600;
}

.status-success {
  color: #10b981;
}

/* Agendamentos */
.agendamentos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agendamento-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.agendamento-item:hover {
  background: #f3f4f6;
}

.agendamento-time {
  font-weight: 600;
  color: #3b82f6;
  min-width: 60px;
}

.agendamento-info {
  flex: 1;
}

.agendamento-cliente {
  font-weight: 600;
  color: #1f2937;
}

.agendamento-servico {
  font-size: 0.9rem;
  color: #6b7280;
}

.agendamento-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.agendamento-status.confirmado {
  background: #d1fae5;
  color: #065f46;
}

.agendamento-status.pendente {
  background: #fef3c7;
  color: #92400e;
}

.agendamento-status.cancelado {
  background: #fee2e2;
  color: #991b1b;
}

/* Utility Classes */
.btn-sm {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-sm:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* Responsive */
@media (max-width: 768px) {
  .config-panel {
    width: 100%;
  }

  .hero-content {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
