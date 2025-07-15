<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Cadastrar Pagamento</h1>
      <p class="form-subtitle">Preencha os dados do pagamento</p>
    </div>

    <form @submit.prevent="registrarPagamento" class="client-form">
      <div class="form-section">
        <h2 class="section-title">Dados do Agendamento</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Selecione o Agendamento</label>
            <select v-model="pagamento.agendamentoId" class="form-select" required @change="carregarDadosAgendamento" :disabled="isLoading">
              <option disabled value="">Selecione um agendamento</option>
              <option v-for="ag in agendamentosPendentes" :key="ag.id" :value="ag.id.toString()">
                {{ ag.clienteNome }} - {{ ag.servico }} ({{ formatarData(ag.dataHorario) }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Usuário Responsável</label>
            <select v-model="pagamento.usuarioId" class="form-select" required :disabled="isLoading">
              <option disabled value="">Selecione um usuário</option>
              <option v-for="user in usuarios" :key="user.id" :value="user.id">{{ user.perfil }}</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Forma de Pagamento</label>
            <select v-model="pagamento.forma" class="form-select" required :disabled="isLoading">
              <option disabled value="">Selecione</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="pix">PIX</option>
              <option value="transferencia">Transferência</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Status</label>
            <select v-model="pagamento.status" class="form-select" required :disabled="isLoading">
              <option value="efetuado">Efetuado</option>
              <option value="pendente">Pendente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Valor Pago (R$)</label>
            <input v-model.number="pagamento.valor" class="form-input" type="number" min="0" step="0.01" required />
          </div>

          <div class="form-group">
            <label class="form-label">Troco (R$)</label>
            <input :value="calcularTroco()" class="form-input" readonly />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="grid-column: 1 / -1">
            <label class="form-label">Observações</label>
            <textarea v-model="pagamento.observacoes" class="form-textarea"></textarea>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <div class="actions-group">
          <button type="submit" class="btn btn-primary" :disabled="!formularioValido || isLoading">
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? "Registrando..." : "Registrar Pagamento" }}
          </button>

          <button type="button" class="btn btn-secondary" @click="limparFormulario" :disabled="isLoading">
            Limpar
          </button>
        </div>
      </div>
    </form>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { api } from "@/common/http";

export default defineComponent({
  name: "PagamentoCadastroView",
  setup() {
    const router = useRouter();
    const { showError, showToast, showLoading, hideLoading, confirmAction } = useSweetAlert();

    const isLoading = ref(false);
    const caixaAberto = ref(false);
    const caixaId = ref<number | null>(null);
    const agendamentosPendentes = ref<any[]>([]);
    const usuarios = ref<any[]>([]);
    const agendamentoSelecionado = ref<any>(null);
    const servicoValor = ref(0);

    const pagamento = ref({
      agendamentoId: "",
      usuarioId: "",
      forma: "",
      valor: 0,
      status: "efetuado",
      observacoes: "",
    });

    const formularioValido = computed(() => {
      return (
        pagamento.value.agendamentoId &&
        pagamento.value.usuarioId &&
        pagamento.value.forma &&
        pagamento.value.valor > 0 &&
        pagamento.value.status
      );
    });

    const formatarData = (data: string) => {
      return new Date(data).toLocaleString("pt-BR");
    };

    const calcularTroco = () => {
      return (pagamento.value.valor - servicoValor.value).toFixed(2);
    };

    const carregarDadosAgendamento = async () => {
      const agendamento = agendamentosPendentes.value.find(
        (ag) => ag.id.toString() === pagamento.value.agendamentoId
      );
      if (agendamento) {
        agendamentoSelecionado.value = agendamento;
        pagamento.value.valor = 0;
        const { data: servico } = await api.get(`/api/Servico/${agendamento.servicoFk}`);
        servicoValor.value = servico.valor;
      }
    };

    const verificarCaixaAberto = async () => {
      try {
        const { data } = await api.get("/api/Caixa/ultimo");
        if (data && data.status === "Aberto") {
          caixaAberto.value = true;
          caixaId.value = data.id;
        } else {
          router.push("/abrir-caixa");
        }
      } catch (e) {
        showError("Erro ao verificar caixa", "Não foi possível verificar o caixa aberto.");
      }
    };

    const registrarPagamento = async () => {
      if (!formularioValido.value || !caixaId.value) return;

      const confirmed = await confirmAction(
        "Confirmar pagamento",
        `Confirma o pagamento de R$ ${pagamento.value.valor.toFixed(2)}?`,
        "Sim"
      );
      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Registrando pagamento...");

      try {
        const { data: caixa } = await api.get(`/api/Caixa/${caixaId.value}`);
        const novoSaldo = caixa.saldoFinal + servicoValor.value;
        await api.put(`/api/Caixa/${caixaId.value}`, {
          ...caixa,
          saldoFinal: novoSaldo,
        });

        await api.post("/api/Pagamento", {
          formaPagamento: pagamento.value.forma,
          valor: pagamento.value.valor,
          status: pagamento.value.status === "efetuado",
          agendamentoFk: parseInt(pagamento.value.agendamentoId),
          comprovantePath: "",
        });

        await api.put(`/api/Agendamento/${agendamentoSelecionado.value.id}`, {
          ...agendamentoSelecionado.value,
          status: "concluido",
        });

        showToast.success("Pagamento registrado com sucesso");
        limparFormulario();
      } catch (e) {
        showError("Erro", "Falha ao registrar o pagamento");
      } finally {
        hideLoading();
        isLoading.value = false;
      }
    };

    const limparFormulario = () => {
      pagamento.value = {
        agendamentoId: "",
        usuarioId: "",
        forma: "",
        valor: 0,
        status: "efetuado",
        observacoes: "",
      };
      agendamentoSelecionado.value = null;
      servicoValor.value = 0;
    };

    onMounted(async () => {
      await verificarCaixaAberto();
      const { data: users } = await api.get("/api/Usuario");
      usuarios.value = users;
      const { data: ags } = await api.get("/api/Agendamento");
      const agendamentosComClientes = await Promise.all(
        ags.map(async (ag: any) => {
          const { data: cliente } = await api.get(`/api/Cliente/${ag.clienteFk}`);
          return {
            ...ag,
            clienteNome: `${cliente.nome} ${cliente.sobrenome}`,
          };
        })
      );
      agendamentosPendentes.value = agendamentosComClientes.filter((ag: any) => ag.status === "Agendado" && !ag.pagamento);
    });

    return {
      pagamento,
      agendamentosPendentes,
      usuarios,
      agendamentoSelecionado,
      isLoading,
      formularioValido,
      carregarDadosAgendamento,
      calcularTroco,
      registrarPagamento,
      limparFormulario,
      formatarData,
    };
  },
});
</script>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}


.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}


.client-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}


.form-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #d1d5db;
}


.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
}


.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}


.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  background: #ffffff;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled,
.form-select:disabled,
.form-textarea:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}


.input-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-weight: 500;
}


.form-actions {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f3f4f6;
}

.actions-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}


.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  min-width: 160px;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: #ffffff;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}


.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


.icon-check::before {
  content: "✓";
}

.icon-refresh::before {
  content: "↻";
}


@media (max-width: 768px) {
  .form-container {
    padding: 1rem;
    margin: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .actions-group {
    flex-direction: column-reverse;
    gap: 1rem;
  }

  .btn {
    width: 100%;
  }

  .form-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .form-container {
    margin: 0.5rem;
    padding: 0.75rem;
  }

  .form-section {
    padding: 1rem;
  }
}
</style>