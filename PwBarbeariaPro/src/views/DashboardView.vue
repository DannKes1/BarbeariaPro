<template>
  <main class="content">
    <div class="container-fluid p-0">
      <div class="flex justify-between items-center mb-4">
        <h1 class="h3 mb-3"><strong>Analytics</strong> Dashboard</h1>
        <div class="flex gap-2"></div>
      </div>

      <!-- Cards de Estatísticas -->
      <div class="row mb-4">
        <!-- Vendas -->
        <div class="col-sm-6 col-xl-3 d-flex">
          <div class="card flex-fill">
            <div class="card-body">
              <h5 class="card-title">Vendas Hoje</h5>
              <div class="stat text-primary float-end">
                <i class="align-middle" data-feather="truck"></i>
              </div>
              <h1 class="mt-1 mb-3">{{ estatisticas.vendas }}</h1>
              <div>
                <span
                  :class="
                    estatisticas.vendasVariacao >= 0
                      ? 'text-success'
                      : 'text-danger'
                  "
                >
                  {{ estatisticas.vendasVariacao >= 0 ? "+" : ""
                  }}{{ estatisticas.vendasVariacao }}%
                </span>
                <span class="text-muted"> desde ontem</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Faturamento -->
        <div class="col-sm-6 col-xl-3 d-flex">
          <div class="card flex-fill">
            <div class="card-body">
              <h5 class="card-title">Faturamento</h5>
              <div class="stat text-primary float-end">
                <i class="align-middle" data-feather="dollar-sign"></i>
              </div>
              <h1 class="mt-1 mb-3">R$ {{ estatisticas.faturamento }}</h1>
              <div>
                <span
                  :class="
                    estatisticas.faturamentoVariacao >= 0
                      ? 'text-success'
                      : 'text-danger'
                  "
                >
                  {{ estatisticas.faturamentoVariacao >= 0 ? "+" : ""
                  }}{{ estatisticas.faturamentoVariacao }}%
                </span>
                <span class="text-muted"> desde ontem</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Clientes -->
        <div class="col-sm-6 col-xl-3 d-flex">
          <div class="card flex-fill">
            <div class="card-body">
              <h5 class="card-title">Clientes Atendidos</h5>
              <div class="stat text-primary float-end">
                <i class="align-middle" data-feather="users"></i>
              </div>
              <h1 class="mt-1 mb-3">{{ estatisticas.clientes }}</h1>
              <div>
                <span
                  :class="
                    estatisticas.clientesVariacao >= 0
                      ? 'text-success'
                      : 'text-danger'
                  "
                >
                  {{ estatisticas.clientesVariacao >= 0 ? "+" : ""
                  }}{{ estatisticas.clientesVariacao }}%
                </span>
                <span class="text-muted"> desde ontem</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Agendamentos -->
        <div class="col-sm-6 col-xl-3 d-flex">
          <div class="card flex-fill">
            <div class="card-body">
              <h5 class="card-title">Agendamentos</h5>
              <div class="stat text-primary float-end">
                <i class="align-middle" data-feather="calendar"></i>
              </div>
              <h1 class="mt-1 mb-3">{{ estatisticas.agendamentos }}</h1>
              <div>
                <span class="text-info"
                  >{{ estatisticas.agendamentosPendentes }} pendentes</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alertas e Notificações -->
      <div v-if="alertas.length" class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">🔔 Alertas e Notificações</h5>
            </div>
            <div class="card-body">
              <div
                v-for="alerta in alertas"
                :key="alerta.id"
                :class="getAlertClass(alerta.tipo)"
                class="alert d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{{ alerta.titulo }}</strong>
                  <p class="mb-0">{{ alerta.mensagem }}</p>
                </div>
                <div class="flex gap-2">
                  <button class="btn-sm" @click="verDetalhes(alerta)">
                    Ver Detalhes
                  </button>
                  <button class="btn-sm" @click="dispensarAlerta(alerta.id)">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Próximos Agendamentos -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">📅 Próximos Agendamentos</h5>
            </div>
            <div class="card-body">
              <div v-if="proximosAgendamentos.length">
                <div
                  v-for="agendamento in proximosAgendamentos"
                  :key="agendamento.id"
                  class="d-flex justify-content-between align-items-center mb-3 p-3 border rounded"
                >
                  <div>
                    <strong>{{ agendamento.cliente }}</strong>
                    <p class="mb-0 text-muted">
                      {{ agendamento.servico }} - {{ agendamento.profissional }}
                    </p>
                    <small class="text-muted">{{
                      formatarDataHora(agendamento.dataHora)
                    }}</small>
                  </div>
                  <div class="flex gap-2">
                    <button
                      class="btn-sm"
                      @click="confirmarAgendamento(agendamento)"
                    >
                      ✓ Confirmar
                    </button>
                    <button
                      class="btn-danger-sm"
                      @click="cancelarAgendamento(agendamento)"
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-muted py-4">
                Nenhum agendamento para hoje
              </div>
            </div>
          </div>
        </div>

        <!-- Resumo Financeiro -->
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">💰 Resumo Financeiro</h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-6 mb-3">
                  <h4 class="text-success">
                    R$ {{ resumoFinanceiro.entradas }}
                  </h4>
                  <small class="text-muted">Entradas</small>
                </div>
                <div class="col-6 mb-3">
                  <h4 class="text-danger">R$ {{ resumoFinanceiro.saidas }}</h4>
                  <small class="text-muted">Saídas</small>
                </div>
                <div class="col-12">
                  <hr />
                  <h3
                    :class="
                      resumoFinanceiro.saldo >= 0
                        ? 'text-success'
                        : 'text-danger'
                    "
                  >
                    R$ {{ resumoFinanceiro.saldo }}
                  </h3>
                  <small class="text-muted">Saldo do Dia</small>
                </div>
              </div>
              <div class="mt-3">
                <button
                  class="btn w-100"
                  @click="abrirCaixa"
                  v-if="!caixaAberto"
                >
                  Abrir Caixa
                </button>
                <button class="btn-danger w-100" @click="fecharCaixa" v-else>
                  Fechar Caixa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações Rápidas -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">⚡ Ações Rápidas</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3 mb-2">
                  <button class="btn w-100" @click="novoAgendamento">
                    📅 Novo Agendamento
                  </button>
                </div>
                <div class="col-md-3 mb-2">
                  <button class="btn w-100" @click="novoCliente">
                    👤 Novo Cliente
                  </button>
                </div>
                <div class="col-md-3 mb-2">
                  <button class="btn w-100" @click="registrarPagamento">
                    💳 Registrar Pagamento
                  </button>
                </div>
                <div class="col-md-3 mb-2">
                  <button class="btn w-100" @click="consultarClientes">
                    📋 Consultar Clientes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import feather from "feather-icons";

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
    const caixaAberto = ref(true);

    const estatisticas = ref({
      vendas: 23,
      vendasVariacao: 12.5,
      faturamento: "1.850,00",
      faturamentoVariacao: 8.3,
      clientes: 18,
      clientesVariacao: -2.1,
      agendamentos: 15,
      agendamentosPendentes: 7,
    });

    const alertas = ref([
      {
        id: 1,
        tipo: "warning",
        titulo: "Caixa com divergência",
        mensagem: "Diferença de R$ 15,00 detectada no fechamento de ontem",
      },
      {
        id: 2,
        tipo: "info",
        titulo: "Agendamento cancelado",
        mensagem: "João Silva cancelou o agendamento das 14:00",
      },
    ]);

    const proximosAgendamentos = ref([
      {
        id: 1,
        cliente: "Maria Santos",
        servico: "Corte Feminino",
        profissional: "Ana",
        dataHora: "2024-01-15T14:00:00",
      },
      {
        id: 2,
        cliente: "Pedro Oliveira",
        servico: "Barba",
        profissional: "Carlos",
        dataHora: "2024-01-15T15:30:00",
      },
    ]);

    const resumoFinanceiro = ref({
      entradas: 1.85,
      saidas: 320,
      saldo: 1.53,
    });

    function getAlertClass(tipo: string) {
      const classes: Record<string, string> = {
        success: "alert-success",
        warning: "alert-warning",
        danger: "alert-danger",
        info: "alert-info",
      };
      return classes[tipo] || "alert-info";
    }

    function formatarDataHora(dataISO: string) {
      return new Date(dataISO).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    async function atualizarDados() {
      isLoading.value = true;
      showLoading("Atualizando dados...");

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simular atualização dos dados
        estatisticas.value.vendas += Math.floor(Math.random() * 5);

        hideLoading();
        showToast.success("Dados atualizados!");
      } catch (error) {
        hideLoading();
        showError("Erro", "Falha ao atualizar os dados");
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

    async function verDetalhes(alerta: any) {
      await Swal.fire({
        title: alerta.titulo,
        text: alerta.mensagem,
        icon: alerta.tipo === "warning" ? "warning" : "info",
        confirmButtonText: "Fechar",
      });
    }

    function dispensarAlerta(id: number) {
      alertas.value = alertas.value.filter((a) => a.id !== id);
      showToast.info("Alerta dispensado");
    }

    async function confirmarAgendamento(agendamento: any) {
      const confirmed = await confirmAction(
        "Confirmar agendamento",
        `Confirmar agendamento de ${agendamento.cliente} para ${formatarDataHora(agendamento.dataHora)}?`,
        "Sim, confirmar"
      );

      if (confirmed) {
        proximosAgendamentos.value = proximosAgendamentos.value.filter(
          (a) => a.id !== agendamento.id
        );
        showSuccess(
          "Agendamento confirmado!",
          `Agendamento de ${agendamento.cliente} foi confirmado.`
        );
      }
    }

    async function cancelarAgendamento(agendamento: any) {
      const confirmed = await confirmAction(
        "Cancelar agendamento",
        `Cancelar agendamento de ${agendamento.cliente}?`,
        "Sim, cancelar"
      );

      if (confirmed) {
        proximosAgendamentos.value = proximosAgendamentos.value.filter(
          (a) => a.id !== agendamento.id
        );
        showSuccess(
          "Agendamento cancelado!",
          `Agendamento de ${agendamento.cliente} foi cancelado.`
        );
      }
    }

    function abrirCaixa() {
      router.push("/caixa/abrir");
    }

    function fecharCaixa() {
      router.push("/caixa/fechar");
    }

    function novoAgendamento() {
      router.push("/agendamento/cadastro");
    }

    function novoCliente() {
      router.push("/cliente/cadastro");
    }

    function registrarPagamento() {
      router.push("/pagamento/cadastro");
    }

    function consultarClientes() {
      router.push("/cliente/consulta");
    }

    onMounted(() => {
      feather.replace();
    });

    return {
      isLoading,
      caixaAberto,
      estatisticas,
      alertas,
      proximosAgendamentos,
      resumoFinanceiro,
      getAlertClass,
      formatarDataHora,
      atualizarDados,
      exportarRelatorio,
      verDetalhes,
      dispensarAlerta,
      confirmarAgendamento,
      cancelarAgendamento,
      abrirCaixa,
      fecharCaixa,
      novoAgendamento,
      novoCliente,
      registrarPagamento,
      consultarClientes,
    };
  },
});
</script>

<style scoped>
.content {
  padding: 1.5rem;
}
.card {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}
.card-header {
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}
.card-body {
  padding: 1rem;
}
.btn {
  background-color: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}
.btn-sm {
  background-color: #4f46e5;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  margin-right: 10px;
}
.btn-danger {
  background-color: #dc2626;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}
.btn-danger-sm {
  background-color: #dc2626;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
}
.alert {
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}
.alert-success {
  background-color: #d1fae5;
  border-color: #10b981;
  color: #065f46;
}
.alert-warning {
  background-color: #fef3c7;
  border-color: #f59e0b;
  color: #92400e;
}
.alert-danger {
  background-color: #fee2e2;
  border-color: #ef4444;
  color: #991b1b;
}
.alert-info {
  background-color: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af;
}
.stat {
  font-size: 2rem;
}
.text-success {
  color: #10b981;
}
.text-danger {
  color: #ef4444;
}
.text-muted {
  color: #6b7280;
}
.text-info {
  color: #3b82f6;
}
</style>
