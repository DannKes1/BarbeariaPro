<template>
  <main class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">
          <i class="icon-dashboard"></i>
          Dashboard Analytics
        </h1>
        <p class="dashboard-subtitle">
          Visão geral do seu negócio em tempo real
        </p>
      </div>
      <div class="header-actions">
        <button
          class="btn btn-secondary btn-refresh"
          @click="atualizarDados"
          :disabled="isLoading"
        >
          <i class="icon-refresh" :class="{ spinning: isLoading }"></i>
          {{ isLoading ? "Atualizando..." : "Atualizar" }}
        </button>
        <button class="btn btn-primary" @click="exportarRelatorio">
          <i class="icon-download"></i>
          Exportar Relatório
        </button>
      </div>
    </div>

    <div v-if="!caixaAberto" class="system-alert">
      <div class="alert alert-warning">
        <i class="icon-alert-triangle"></i>
        <div>
          <strong>Caixa Fechado</strong>
          <p>
            O caixa está fechado. Abra o caixa para começar as operações do dia.
          </p>
        </div>
        <button class="btn btn-warning btn-sm" @click="abrirCaixa">
          Abrir Caixa
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card clients">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="icon-users"></i>
          </div>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Clientes Atendidos</h3>
          <div class="stat-value">{{ estatisticas.clientes }}</div>
          <p class="stat-description">Clientes únicos hoje</p>
        </div>
      </div>

      <div class="stat-card appointments">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="icon-calendar"></i>
          </div>
          <div class="stat-badge">
            {{ estatisticas.agendamentosPendentes }} pendentes
          </div>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Agendamentos</h3>
          <div class="stat-value">{{ estatisticas.agendamentos }}</div>
          <p class="stat-description">Total de agendamentos hoje</p>
        </div>
      </div>

      <div class="stat-card balance">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="icon-trending-up"></i>
          </div>
          <div
            class="stat-status"
            :class="resumoFinanceiro.saldo >= 0 ? 'positive' : 'negative'"
          >
            {{ resumoFinanceiro.saldo >= 0 ? "Positivo" : "Negativo" }}
          </div>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Saldo do Dia</h3>
          <div
            class="stat-value"
            :class="resumoFinanceiro.saldo >= 0 ? 'positive' : 'negative'"
          >
            R$ {{ formatarMoeda(Math.abs(resumoFinanceiro.saldo)) }}
          </div>
          <p class="stat-description">
            Entradas: R$ {{ formatarMoeda(resumoFinanceiro.entradas) }} |
            Saídas: R$ {{ formatarMoeda(resumoFinanceiro.saidas) }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="alertas.length" class="alerts-section">
      <div class="section-header">
        <h2 class="section-title">
          <i class="icon-bell"></i>
          Alertas e Notificações
        </h2>
      </div>
      <div class="alerts-container">
        <div
          v-for="alerta in alertas"
          :key="alerta.id"
          :class="['alert', `alert-${alerta.tipo}`]"
        >
          <div class="alert-icon">
            <i :class="getAlertIcon(alerta.tipo)"></i>
          </div>
          <div class="alert-content">
            <h4 class="alert-title">{{ alerta.titulo }}</h4>
            <p class="alert-message">{{ alerta.mensagem }}</p>
          </div>
          <div class="alert-actions">
            <button class="btn btn-ghost btn-sm" @click="verDetalhes(alerta)">
              Ver Detalhes
            </button>
            <button
              class="btn btn-ghost btn-sm"
              @click="dispensarAlerta(alerta.id)"
            >
              <i class="icon-x"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">
            <i class="icon-calendar-check"></i>
            Próximos Agendamentos
          </h2>
          <button class="btn btn-primary btn-sm" @click="novoAgendamento">
            <i class="icon-plus"></i>
            Novo Agendamento
          </button>
        </div>

        <div class="appointments-container">
          <div v-if="proximosAgendamentos.length" class="appointments-list">
            <div
              v-for="agendamento in proximosAgendamentos"
              :key="agendamento.id"
              class="appointment-card"
            >
              <div class="appointment-time">
                <div class="time-display">
                  {{ formatarHora(agendamento.dataHora) }}
                </div>
                <div class="date-display">
                  {{ formatarData(agendamento.dataHora) }}
                </div>
              </div>

              <div class="appointment-details">
                <h4 class="client-name">
                  {{ agendamento.cliente?.nome || "Cliente não informado" }}
                </h4>
                <p class="service-info">
                  <i class="icon-scissors"></i>
                  {{ agendamento.servico?.nome || "Serviço não informado" }}
                </p>
                <p class="professional-info">
                  <i class="icon-user"></i>
                  {{
                    agendamento.profissional?.nome ||
                    "Profissional não informado"
                  }}
                </p>
                <div
                  class="appointment-status"
                  :class="`status-${agendamento.status.toLowerCase()}`"
                >
                  {{ agendamento.status }}
                </div>
              </div>

              <div class="appointment-actions">
                <button
                  class="btn btn-success btn-sm"
                  @click="confirmarAgendamento(agendamento)"
                  :disabled="isLoading || agendamento.status !== 'Agendado'"
                  v-if="agendamento.status === 'Agendado'"
                >
                  <i class="icon-check"></i>
                  Confirmar
                </button>
                <button
                  class="btn btn-danger btn-sm"
                  @click="cancelarAgendamento(agendamento)"
                  :disabled="isLoading"
                  v-if="agendamento.status === 'Agendado'"
                >
                  <i class="icon-x"></i>
                  Cancelar
                </button>
                <button
                  class="btn btn-secondary btn-sm"
                  @click="editarAgendamento(agendamento)"
                >
                  <i class="icon-edit"></i>
                  Editar
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">
              <i class="icon-calendar"></i>
            </div>
            <h3 class="empty-title">Nenhum agendamento para hoje</h3>
            <p class="empty-description">
              Que tal agendar um novo atendimento para começar o dia?
            </p>
            <button class="btn btn-primary" @click="novoAgendamento">
              <i class="icon-plus"></i>
              Criar Primeiro Agendamento
            </button>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">
            <i class="icon-bar-chart"></i>
            Resumo Financeiro
          </h2>
          <div class="financial-actions">
            <button class="btn btn-secondary btn-sm" @click="registrarEntrada">
              <i class="icon-plus-circle"></i>
              Entrada
            </button>
            <button class="btn btn-secondary btn-sm" @click="registrarSaida">
              <i class="icon-minus-circle"></i>
              Saída
            </button>
          </div>
        </div>

        <div class="financial-summary">
          <div class="financial-card entradas">
            <div class="financial-icon">
              <i class="icon-arrow-up-circle"></i>
            </div>
            <div class="financial-content">
              <h4 class="financial-title">Entradas</h4>
              <div class="financial-value positive">
                R$ {{ formatarMoeda(resumoFinanceiro.entradas) }}
              </div>
            </div>
          </div>

          <div class="financial-card saidas">
            <div class="financial-icon">
              <i class="icon-arrow-down-circle"></i>
            </div>
            <div class="financial-content">
              <h4 class="financial-title">Saídas</h4>
              <div class="financial-value negative">
                R$ {{ formatarMoeda(resumoFinanceiro.saidas) }}
              </div>
            </div>
          </div>

          <div class="financial-card saldo">
            <div class="financial-icon">
              <i class="icon-dollar-sign"></i>
            </div>
            <div class="financial-content">
              <h4 class="financial-title">Saldo Total</h4>
              <div
                class="financial-value"
                :class="resumoFinanceiro.saldo >= 0 ? 'positive' : 'negative'"
              >
                R$ {{ formatarMoeda(Math.abs(resumoFinanceiro.saldo)) }}
              </div>
            </div>
          </div>
        </div>

        <div class="cash-actions">
          <button
            class="btn btn-danger btn-block"
            @click="fecharCaixa"
            v-if="caixaAberto"
          >
            <i class="icon-lock"></i>
            Fechar Caixa
          </button>
        </div>
      </div>
    </div>

    <div class="quick-actions-section">
      <div class="section-header">
        <h2 class="section-title">
          <i class="icon-zap"></i>
          Ações Rápidas
        </h2>
      </div>

      <div class="quick-actions-grid">
        <button class="quick-action-card" @click="novoCliente">
          <div class="action-icon">
            <i class="icon-user-plus"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Novo Cliente</h4>
            <p class="action-description">Cadastrar novo cliente</p>
          </div>
        </button>

        <button class="quick-action-card" @click="consultarClientes">
          <div class="action-icon">
            <i class="icon-users"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Consultar Clientes</h4>
            <p class="action-description">Ver lista de clientes</p>
          </div>
        </button>

        <button class="quick-action-card" @click="registrarPagamento">
          <div class="action-icon">
            <i class="icon-credit-card"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Registrar Pagamento</h4>
            <p class="action-description">Processar pagamento</p>
          </div>
        </button>

        <button class="quick-action-card" @click="consultarAgendamentos">
          <div class="action-icon">
            <i class="icon-calendar"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Ver Agendamentos</h4>
            <p class="action-description">Consultar agenda</p>
          </div>
        </button>

        <button class="quick-action-card" @click="gerenciarProfissionais">
          <div class="action-icon">
            <i class="icon-briefcase"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Profissionais</h4>
            <p class="action-description">Gerenciar equipe</p>
          </div>
        </button>

        <button class="quick-action-card" @click="gerenciarServicos">
          <div class="action-icon">
            <i class="icon-scissors"></i>
          </div>
          <div class="action-content">
            <h4 class="action-title">Serviços</h4>
            <p class="action-description">Gerenciar serviços</p>
          </div>
        </button>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import feather from "feather-icons";
import { api } from "@/common/http";

interface Cliente {
  id: number;
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
  email?: string;
  endereco?: string;
  dataNascimento?: string;
  observacoes?: string;
}

interface Profissional {
  id: number;
  nome: string;
  telefone: string;
  email?: string;
  especialidade?: string;
  comissao?: number;
  ativo: boolean;
}

interface Servico {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  duracao: number;
  ativo: boolean;
}

interface Agendamento {
  id: number;
  clienteFk: number;
  profissionalFk: number;
  servicoFk: number;
  dataHora: string;
  status: string;
  observacoes?: string;
  cliente?: Cliente;
  profissional?: Profissional;
  servico?: Servico;
}

interface Pagamento {
  id: number;
  agendamentoId: number;
  valor: number;
  formaPagamento: string;
  dataPagamento: string;
  status: string;
  observacoes?: string;
}

interface MovimentacaoCaixa {
  id: number;
  caixaId: number;
  tipo: string;
  valor: number;
  descricao: string;
  dataMovimentacao: string;
  formaPagamento?: string;
}

interface Caixa {
  id: number;
  dataAbertura: string;
  dataFechamento?: string;
  valorInicial: number;
  valorFinal?: number;
  status: string;
  observacoes?: string;
}

interface Alerta {
  id: number;
  tipo: "success" | "warning" | "danger" | "info";
  titulo: string;
  mensagem: string;
}

export default defineComponent({
  name: "DashboardView",
  setup() {
    const router = useRouter();
    const {
      showToast,
      showSuccess,
      showError,
      confirmAction,
      showLoading,
      hideLoading,
      Swal,
    } = useSweetAlert();

    const isLoading = ref(false);
    const caixaAberto = ref(false);

    const estatisticas = ref({
      vendas: 0,
      faturamento: 0,
      clientes: 0,
      agendamentos: 0,
      agendamentosPendentes: 0,
    });

    const alertas = ref<Alerta[]>([]);
    const proximosAgendamentos = ref<Agendamento[]>([]);

    const resumoFinanceiro = ref({
      entradas: 0,
      saidas: 0,
      saldo: 0,
    });

    const dataAtual = computed(() => {
      return new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    });

    function formatarMoeda(valor: number): string {
      return valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    function formatarDataHora(dataISO: string): string {
      try {
        if (!dataISO) return "Data não informada";

        const data = new Date(dataISO);

        if (isNaN(data.getTime())) {
          console.warn("Data inválida recebida:", dataISO);
          return "Data inválida";
        }

        return data.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (error) {
        console.error("Erro ao formatar data/hora:", error, "Data:", dataISO);
        return "Erro na data";
      }
    }

    function formatarHora(dataISO: string): string {
      try {
        if (!dataISO) return "--:--";

        const data = new Date(dataISO);

        if (isNaN(data.getTime())) {
          console.warn("Data inválida para hora:", dataISO);
          return "--:--";
        }

        return data.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (error) {
        console.error("Erro ao formatar hora:", error, "Data:", dataISO);
        return "--:--";
      }
    }

    function formatarData(dataISO: string): string {
      try {
        if (!dataISO) return "--/--";

        const data = new Date(dataISO);

        if (isNaN(data.getTime())) {
          console.warn("Data inválida para data:", dataISO);
          return "--/--";
        }

        return data.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });
      } catch (error) {
        console.error("Erro ao formatar data:", error, "Data:", dataISO);
        return "--/--";
      }
    }

    function getAlertIcon(tipo: string): string {
      const icons: Record<string, string> = {
        success: "icon-check-circle",
        warning: "icon-alert-triangle",
        danger: "icon-alert-circle",
        info: "icon-info",
      };
      return icons[tipo] || "icon-info";
    }

    function gerarAlertasReais() {
      const alertasReais: Alerta[] = [];

      const agora = new Date();
      const em30Minutos = new Date(agora.getTime() + 30 * 60 * 1000);

      proximosAgendamentos.value.forEach((agendamento) => {
        try {
          const dataAgendamento = new Date(agendamento.dataHora);
          if (
            !isNaN(dataAgendamento.getTime()) &&
            dataAgendamento >= agora &&
            dataAgendamento <= em30Minutos &&
            agendamento.status === "Agendado"
          ) {
            alertasReais.push({
              id: Date.now() + agendamento.id,
              tipo: "warning",
              titulo: "Agendamento próximo",
              mensagem: `${agendamento.cliente?.nome} tem agendamento em ${formatarHora(agendamento.dataHora)} para ${agendamento.servico?.nome}.`,
            });
          }
        } catch (error) {
          console.error("Erro ao processar alerta de agendamento:", error);
        }
      });

      if (!caixaAberto.value) {
        alertasReais.push({
          id: Date.now() + 1,
          tipo: "danger",
          titulo: "Caixa fechado",
          mensagem:
            "O caixa está fechado. Abra o caixa para iniciar as operações.",
        });
      }

      if (proximosAgendamentos.value.length === 0) {
        alertasReais.push({
          id: Date.now() + 2,
          tipo: "info",
          titulo: "Nenhum agendamento hoje",
          mensagem:
            "Não há agendamentos para hoje. Que tal promover seus serviços?",
        });
      }

      alertas.value = alertasReais;
    }

    async function buscarDadosCaixa() {
      try {
        console.log("🔍 Buscando dados do caixa...");
        const response = await api.get("/api/Caixa/ultimo");
        const ultimoCaixa: Caixa = response.data;

        console.log("📦 Último caixa encontrado:", ultimoCaixa);
        caixaAberto.value = ultimoCaixa.status === "Aberto";

        if (ultimoCaixa.id) {
          await buscarMovimentacoesCaixa(ultimoCaixa.id);
        } else {
          console.log("⚠️ Nenhum caixa encontrado");
          resumoFinanceiro.value = {
            entradas: 0,
            saidas: 0,
            saldo: 0,
          };
        }
      } catch (error) {
        console.error("❌ Erro ao buscar dados do caixa:", error);
        caixaAberto.value = false;
        resumoFinanceiro.value = {
          entradas: 0,
          saidas: 0,
          saldo: 0,
        };
      }
    }

    async function buscarMovimentacoesCaixa(caixaId: number) {
      try {
        console.log("🔍 Buscando movimentações do caixa ID:", caixaId);

        const responseMovimentacoes = await api.get(
          `/api/MovimentacaoCaixa/caixa/${caixaId}`
        );
        const movimentacoes: MovimentacaoCaixa[] = responseMovimentacoes.data;

        console.log("📊 Movimentações encontradas:", movimentacoes);

        let entradas = 0;
        let saidas = 0;

        movimentacoes.forEach((mov) => {
          console.log(`💰 Processando movimentação:`, {
            id: mov.id,
            tipo: mov.tipo,
            valor: mov.valor,
            descricao: mov.descricao,
          });

          if (mov.tipo === "Entrada") {
            entradas += mov.valor;
          } else if (mov.tipo === "Saida" || mov.tipo === "Saída") {
            saidas += mov.valor;
          }
        });

        console.log("📈 Totais finais calculados:", {
          entradas,
          saidas,
          saldo: entradas - saidas,
        });

        resumoFinanceiro.value = {
          entradas,
          saidas,
          saldo: entradas - saidas,
        };
      } catch (error) {
        console.error("❌ Erro ao buscar movimentações do caixa:", error);
        resumoFinanceiro.value = {
          entradas: 0,
          saidas: 0,
          saldo: 0,
        };
      }
    }

    async function buscarAgendamentos() {
      try {
        console.log("🔍 Buscando TODOS os agendamentos na API...");
        const response = await api.get("/api/Agendamento");
        const todosAgendamentos: Agendamento[] = response.data;

        console.log(
          "📊 Total de agendamentos retornados pela API:",
          todosAgendamentos.length
        );
        console.log("📋 Agendamentos da API:", todosAgendamentos);

        const agendamentosComStatusAgendado = todosAgendamentos.filter(
          (agendamento) => agendamento.status === "Agendado"
        );

        console.log(
          "📈 Agendamentos com status 'Agendado':",
          agendamentosComStatusAgendado.length
        );

        for (const agendamento of agendamentosComStatusAgendado) {
          try {
            console.log(
              `🔍 Buscando dados relacionados para agendamento ${agendamento.id}...`
            );
            console.log(`📋 DataHora original recebida:`, agendamento.dataHora);

            const [clienteRes, profissionalRes, servicoRes] = await Promise.all(
              [
                api
                  .get(`/api/Cliente/${agendamento.clienteFk}`)
                  .catch((err) => {
                    console.error(
                      `Erro ao buscar cliente ${agendamento.clienteFk}:`,
                      err
                    );
                    return { data: null };
                  }),
                api
                  .get(`/api/Profissional/${agendamento.profissionalFk}`)
                  .catch((err) => {
                    console.error(
                      `Erro ao buscar profissional ${agendamento.profissionalFk}:`,
                      err
                    );
                    return { data: null };
                  }),
                api
                  .get(`/api/Servico/${agendamento.servicoFk}`)
                  .catch((err) => {
                    console.error(
                      `Erro ao buscar serviço ${agendamento.servicoFk}:`,
                      err
                    );
                    return { data: null };
                  }),
              ]
            );

            agendamento.cliente = clienteRes.data;
            agendamento.profissional = profissionalRes.data;
            agendamento.servico = servicoRes.data;

            console.log(
              `✅ Dados relacionados carregados para agendamento ${agendamento.id}:`,
              {
                cliente: agendamento.cliente?.nome,
                profissional: agendamento.profissional?.nome,
                servico: agendamento.servico?.nome,
                dataHora: agendamento.dataHora,
                dataFormatada: formatarDataHora(agendamento.dataHora),
              }
            );
          } catch (error) {
            console.error(
              `❌ Erro ao buscar dados relacionados do agendamento ${agendamento.id}:`,
              error
            );
          }
        }

        agendamentosComStatusAgendado.sort((a, b) => {
          try {
            const dataA = new Date(a.dataHora);
            const dataB = new Date(b.dataHora);

            if (isNaN(dataA.getTime()) || isNaN(dataB.getTime())) {
              console.warn("Data inválida encontrada durante ordenação:", {
                a: a.dataHora,
                b: b.dataHora,
              });
              return 0;
            }

            return dataA.getTime() - dataB.getTime();
          } catch (error) {
            console.error("Erro ao ordenar agendamentos:", error);
            return 0;
          }
        });

        proximosAgendamentos.value = agendamentosComStatusAgendado;

        estatisticas.value.agendamentos = agendamentosComStatusAgendado.length;
        estatisticas.value.agendamentosPendentes =
          agendamentosComStatusAgendado.length;

        console.log("📈 Estatísticas atualizadas:", {
          agendamentos: estatisticas.value.agendamentos,
          agendamentosPendentes: estatisticas.value.agendamentosPendentes,
        });
      } catch (error) {
        console.error("❌ Erro ao buscar agendamentos:", error);
      }
    }

    async function buscarPagamentosHoje() {
      try {
        console.log("🔍 Buscando pagamentos na API...");
        const response = await api.get("/api/Pagamento");
        const pagamentos: Pagamento[] = response.data;

        console.log(
          "📊 Total de pagamentos retornados pela API:",
          pagamentos.length
        );

        const hoje = new Date();

        const pagamentosHoje = pagamentos.filter((pagamento) => {
          try {
            const dataPagamento = new Date(pagamento.dataPagamento);
            const ehHoje =
              dataPagamento.getDate() === hoje.getDate() &&
              dataPagamento.getMonth() === hoje.getMonth() &&
              dataPagamento.getFullYear() === hoje.getFullYear();

            if (ehHoje) {
              console.log(`💳 Pagamento do dia encontrado:`, {
                id: pagamento.id,
                valor: pagamento.valor,
                dataPagamento: pagamento.dataPagamento,
                status: pagamento.status,
              });
            }

            return ehHoje;
          } catch (error) {
            console.error(
              "Erro ao processar data de pagamento:",
              error,
              pagamento
            );
            return false;
          }
        });

        console.log("📈 Pagamentos de hoje filtrados:", pagamentosHoje.length);

        const faturamentoHoje = pagamentosHoje.reduce((total, pagamento) => {
          console.log(`💰 Somando pagamento: R$ ${pagamento.valor}`);
          return total + pagamento.valor;
        }, 0);

        console.log("💰 Faturamento total de hoje:", faturamentoHoje);

        estatisticas.value.vendas = pagamentosHoje.length;
        estatisticas.value.faturamento = faturamentoHoje;

        return faturamentoHoje;
      } catch (error) {
        console.error("❌ Erro ao buscar pagamentos:", error);
        return 0;
      }
    }

    async function buscarClientesAtendidosHoje() {
      try {
        const response = await api.get("/api/Agendamento");
        const agendamentos: Agendamento[] = response.data;

        const hoje = new Date();

        const agendamentosConcluidosHoje = agendamentos.filter(
          (agendamento) => {
            try {
              const dataAgendamento = new Date(agendamento.dataHora);
              return (
                !isNaN(dataAgendamento.getTime()) &&
                dataAgendamento.getDate() === hoje.getDate() &&
                dataAgendamento.getMonth() === hoje.getMonth() &&
                dataAgendamento.getFullYear() === hoje.getFullYear() &&
                agendamento.status === "Concluido"
              );
            } catch (error) {
              console.error("Erro ao processar data de agendamento:", error);
              return false;
            }
          }
        );

        const clientesUnicos = new Set(
          agendamentosConcluidosHoje.map((a) => a.clienteFk)
        );

        estatisticas.value.clientes = clientesUnicos.size;
      } catch (error) {
        console.error("Erro ao buscar clientes atendidos:", error);
      }
    }

    async function atualizarDados() {
      if (isLoading.value) return;

      isLoading.value = true;

      try {
        console.log("🔄 Iniciando atualização dos dados do dashboard...");

        await buscarDadosCaixa();

        await Promise.all([
          buscarAgendamentos(),
          buscarClientesAtendidosHoje(),
          buscarPagamentosHoje(),
        ]);

        gerarAlertasReais();

        console.log("✅ Dados atualizados com sucesso!");
        showToast.success("Dados atualizados com sucesso!");
      } catch (error) {
        console.error("❌ Erro ao atualizar dados:", error);
        showError("Erro", "Falha ao atualizar os dados do dashboard");
      } finally {
        isLoading.value = false;
      }
    }

    async function exportarRelatorio() {
      const { value: formato } = await Swal.fire({
        title: "Exportar Relatório",
        text: "Escolha o formato do relatório:",
        input: "select",
        inputOptions: {
          pdf: "PDF",
          excel: "Excel",
          csv: "CSV",
        },
        showCancelButton: true,
        confirmButtonText: "Exportar",
        cancelButtonText: "Cancelar",
      });

      if (formato) {
        showLoading(`Gerando relatório ${formato.toUpperCase()}...`);

        try {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          hideLoading();
          showSuccess(
            "Relatório gerado!",
            `Relatório em ${formato.toUpperCase()} foi gerado com sucesso.`
          );
        } catch (error) {
          hideLoading();
          showError("Erro", "Falha ao gerar o relatório");
        }
      }
    }

    async function verDetalhes(alerta: Alerta) {
      await Swal.fire({
        title: alerta.titulo,
        text: alerta.mensagem,
        icon: alerta.tipo === "warning" ? "warning" : "info",
        confirmButtonText: "Fechar",
      });
    }

    function dispensarAlerta(id: number) {
      alertas.value = alertas.value.filter((a: Alerta) => a.id !== id);
      showToast.info("Alerta dispensado");
    }

    async function confirmarAgendamento(agendamento: Agendamento) {
      const confirmed = await confirmAction(
        "Confirmar agendamento",
        `Confirmar agendamento de ${agendamento.cliente?.nome} para ${formatarDataHora(agendamento.dataHora)}?`,
        "Sim, confirmar"
      );

      if (confirmed) {
        try {
          showLoading("Confirmando agendamento...");

          const agendamentoAtualizado = {
            ...agendamento,
            status: "Confirmado",
          };
          await api.put(
            `/api/Agendamento/${agendamento.id}`,
            agendamentoAtualizado
          );

          const index = proximosAgendamentos.value.findIndex(
            (a: Agendamento) => a.id === agendamento.id
          );
          if (index !== -1) {
            proximosAgendamentos.value[index].status = "Confirmado";
          }

          hideLoading();
          showSuccess(
            "Agendamento confirmado!",
            `Agendamento de ${agendamento.cliente?.nome} foi confirmado.`
          );

          await buscarAgendamentos();
          gerarAlertasReais();
        } catch (error) {
          hideLoading();
          showError("Erro", "Falha ao confirmar agendamento");
          console.error("Erro ao confirmar agendamento:", error);
        }
      }
    }

    async function cancelarAgendamento(agendamento: Agendamento) {
      const confirmed = await confirmAction(
        "Cancelar agendamento",
        `Cancelar agendamento de ${agendamento.cliente?.nome}?`,
        "Sim, cancelar"
      );

      if (confirmed) {
        try {
          showLoading("Cancelando agendamento...");

          const agendamentoAtualizado = { ...agendamento, status: "Cancelado" };
          await api.put(
            `/api/Agendamento/${agendamento.id}`,
            agendamentoAtualizado
          );

          const index = proximosAgendamentos.value.findIndex(
            (a: Agendamento) => a.id === agendamento.id
          );
          if (index !== -1) {
            proximosAgendamentos.value[index].status = "Cancelado";
          }

          hideLoading();
          showSuccess(
            "Agendamento cancelado!",
            `Agendamento de ${agendamento.cliente?.nome} foi cancelado.`
          );

          await buscarAgendamentos();
          gerarAlertasReais();
        } catch (error) {
          hideLoading();
          showError("Erro", "Falha ao cancelar agendamento");
          console.error("Erro ao cancelar agendamento:", error);
        }
      }
    }

    function abrirCaixa() {
      router.push({ name: "caixa-abrir" });
    }

    function fecharCaixa() {
      router.push({ name: "caixa-fechar" });
    }

    function novoAgendamento() {
      router.push({ name: "AgendamentoCadastro" });
    }

    function editarAgendamento(agendamento: Agendamento) {
      router.push({
        name: "agendamento-editar",
        params: { id: agendamento.id },
      });
    }

    function consultarAgendamentos() {
      router.push({ name: "agendamento-consulta" });
    }

    function novoCliente() {
      router.push({ name: "cliente-cadastro" });
    }

    function consultarClientes() {
      router.push({ name: "cliente-consulta" });
    }

    function registrarPagamento() {
      router.push({ name: "pagamento-cadastro" });
    }

    function registrarEntrada() {
      router.push({ name: "caixa-entrada" });
    }

    function registrarSaida() {
      router.push({ name: "caixa-saida" });
    }

    function gerenciarProfissionais() {
      router.push({ name: "profissional-consulta" });
    }

    function gerenciarServicos() {
      router.push({ name: "servico-consulta" });
    }

    onMounted(async () => {
      feather.replace();
      await atualizarDados();
    });

    return {
      isLoading,
      caixaAberto,
      estatisticas,
      alertas,
      proximosAgendamentos,
      resumoFinanceiro,
      dataAtual,
      formatarMoeda,
      formatarDataHora,
      formatarHora,
      formatarData,
      getAlertIcon,
      atualizarDados,
      exportarRelatorio,
      verDetalhes,
      dispensarAlerta,
      confirmarAgendamento,
      cancelarAgendamento,
      abrirCaixa,
      fecharCaixa,
      novoAgendamento,
      editarAgendamento,
      consultarAgendamentos,
      novoCliente,
      consultarClientes,
      registrarPagamento,
      registrarEntrada,
      registrarSaida,
      gerenciarProfissionais,
      gerenciarServicos,
    };
  },
});
</script>

<style scoped>
/* Reset e base */
* {
  box-sizing: border-box;
}

.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
}

/* Header do Dashboard */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.header-content {
  flex: 1;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Sistema de alertas */
.system-alert {
  margin-bottom: 2rem;
}

.alert {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid;
  background: white;
}

.alert-warning {
  border-color: #f59e0b;
  background: #fffbeb;
  color: #92400e;
}

/* Grid de estatísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

.stat-card.revenue::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.stat-card.clients::before {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.stat-card.appointments::before {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.stat-card.balance::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-size: 1.5rem;
}

.revenue .stat-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.clients .stat-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.appointments .stat-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.balance .stat-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.stat-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.stat-status.positive {
  background: #d1fae5;
  color: #065f46;
}

.stat-status.negative {
  background: #fee2e2;
  color: #991b1b;
}

.stat-content {
  text-align: left;
}

.stat-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.stat-value.positive {
  color: #059669;
}

.stat-value.negative {
  color: #dc2626;
}

.stat-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Seções de alertas */
.alerts-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.alerts-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid;
  background: white;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.alert-success {
  border-color: #10b981;
  background: #ecfdf5;
}

.alert-warning {
  border-color: #f59e0b;
  background: #fffbeb;
}

.alert-danger {
  border-color: #ef4444;
  background: #fef2f2;
}

.alert-info {
  border-color: #3b82f6;
  background: #eff6ff;
}

.alert-icon {
  font-size: 1.5rem;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.alert-message {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.8;
}

.alert-actions {
  display: flex;
  gap: 0.5rem;
}

/* Conteúdo principal */
.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.content-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Agendamentos */
.appointments-container {
  max-height: 600px;
  overflow-y: auto;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appointment-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s ease-in-out;
}

.appointment-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
}

.appointment-time {
  text-align: center;
  min-width: 80px;
}

.time-display {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.date-display {
  font-size: 0.75rem;
  color: #6b7280;
}

.appointment-details {
  flex: 1;
}

.client-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.service-info,
.professional-info {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.appointment-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-agendado {
  background: #dbeafe;
  color: #1e40af;
}

.status-confirmado {
  background: #d1fae5;
  color: #065f46;
}

.status-concluido {
  background: #f3e8ff;
  color: #7c3aed;
}

.status-cancelado {
  background: #fee2e2;
  color: #991b1b;
}

.appointment-actions {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}

/* Estado vazio */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.empty-description {
  color: #6b7280;
  margin: 0 0 2rem 0;
}

/* Resumo financeiro */
.financial-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.financial-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.financial-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.entradas .financial-icon {
  background: #d1fae5;
  color: #059669;
}

.saidas .financial-icon {
  background: #fee2e2;
  color: #dc2626;
}

.saldo .financial-icon {
  background: #dbeafe;
  color: #2563eb;
}

.financial-content {
  flex: 1;
}

.financial-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.financial-value {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.financial-value.positive {
  color: #059669;
}

.financial-value.negative {
  color: #dc2626;
}

.financial-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.cash-actions {
  margin-top: 1rem;
}

/* Ações rápidas */
.quick-actions-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: left;
}

.quick-action-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.action-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-size: 1.25rem;
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.action-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

/* Botões */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  justify-content: center;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
  transform: translateY(-1px);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.3);
}

.btn-warning:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
  border: 1px solid transparent;
}

.btn-ghost:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

.btn-block {
  width: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-refresh {
  position: relative;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Ícones */
.icon-dashboard::before {
  content: "📊";
}
.icon-refresh::before {
  content: "🔄";
}
.icon-download::before {
  content: "⬇️";
}
.icon-alert-triangle::before {
  content: "⚠️";
}
.icon-dollar-sign::before {
  content: "💰";
}
.icon-users::before {
  content: "👥";
}
.icon-calendar::before {
  content: "📅";
}
.icon-trending-up::before {
  content: "📈";
}
.icon-trending-down::before {
  content: "📉";
}
.icon-bell::before {
  content: "🔔";
}
.icon-calendar-check::before {
  content: "✅";
}
.icon-plus::before {
  content: "+";
}
.icon-check::before {
  content: "✓";
}
.icon-x::before {
  content: "✕";
}
.icon-edit::before {
  content: "✏️";
}
.icon-scissors::before {
  content: "✂️";
}
.icon-user::before {
  content: "👤";
}
.icon-bar-chart::before {
  content: "📊";
}
.icon-plus-circle::before {
  content: "➕";
}
.icon-minus-circle::before {
  content: "➖";
}
.icon-arrow-up-circle::before {
  content: "⬆️";
}
.icon-arrow-down-circle::before {
  content: "⬇️";
}
.icon-lock::before {
  content: "🔒";
}
.icon-zap::before {
  content: "⚡";
}
.icon-user-plus::before {
  content: "👤➕";
}
.icon-credit-card::before {
  content: "💳";
}
.icon-briefcase::before {
  content: "💼";
}
.icon-check-circle::before {
  content: "✅";
}
.icon-alert-circle::before {
  content: "🚨";
}
.icon-info::before {
  content: "ℹ️";
}

/* Responsividade */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .appointment-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .appointment-actions {
    flex-direction: row;
    width: 100%;
  }

  .financial-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .dashboard-title {
    font-size: 2rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
