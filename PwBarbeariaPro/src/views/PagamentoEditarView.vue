<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Editar Pagamento</h1>
      <p class="form-subtitle">Atualize os dados do pagamento</p>
    </div>

    <form @submit.prevent="atualizarPagamento" class="client-form">
      <div class="form-section">
        <h2 class="section-title">Dados do Pagamento</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Agendamento</label>
            <input class="form-input" :value="agendamentoInfo" readonly />
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
            {{ isLoading ? "Atualizando..." : "Atualizar Pagamento" }}
          </button>

          <button type="button" class="btn btn-secondary" @click="voltar" :disabled="isLoading">
            Voltar
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { api } from "@/common/http";

export default defineComponent({
  name: "PagamentoEditarView",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { showError, showToast, showLoading, hideLoading } = useSweetAlert();

    const isLoading = ref(false);
    const usuarios = ref<any[]>([]);
    const servicoValor = ref(0);
    const agendamentoInfo = ref("");

    const pagamento = ref({
      id: 0,
      agendamentoId: 0,
      usuarioId: "",
      forma: "",
      valor: 0,
      status: "efetuado",
      observacoes: "",
    });

    const formularioValido = computed(() => {
      return (
        pagamento.value.usuarioId &&
        pagamento.value.forma &&
        pagamento.value.valor > 0 &&
        pagamento.value.status
      );
    });

    const calcularTroco = () => {
      return (pagamento.value.valor - servicoValor.value).toFixed(2);
    };

    const carregarPagamento = async () => {
      try {
        isLoading.value = true;
        showLoading("Carregando dados...");
        const { data: pag } = await api.get(`/api/Pagamento/${route.params.id}`);
        const { data: agendamento } = await api.get(`/api/Agendamento/${pag.agendamentoFk}`);
        const { data: cliente } = await api.get(`/api/Cliente/${agendamento.clienteFk}`);
        const { data: servico } = await api.get(`/api/Servico/${agendamento.servicoFk}`);

        servicoValor.value = servico.valor;
        agendamentoInfo.value = `${cliente.nome} ${cliente.sobrenome} - ${servico.nome}`;

        pagamento.value = {
          id: pag.id,
          agendamentoId: pag.agendamentoFk,
          usuarioId: pag.usuarioFk || "",
          forma: pag.formaPagamento,
          valor: pag.valor,
          status: pag.status ? "efetuado" : "pendente",
          observacoes: pag.observacoes || "",
        };
      } catch (e) {
        showError("Erro", "Falha ao carregar pagamento");
      } finally {
        hideLoading();
        isLoading.value = false;
      }
    };

    const atualizarPagamento = async () => {
      try {
        isLoading.value = true;
        showLoading("Atualizando pagamento...");
        await api.put(`/api/Pagamento/${pagamento.value.id}`, {
          formaPagamento: pagamento.value.forma,
          valor: pagamento.value.valor,
          status: pagamento.value.status === "efetuado",
          agendamentoFk: pagamento.value.agendamentoId,
          comprovantePath: "",
          id: pagamento.value.id,
        });
        showToast.success("Pagamento atualizado com sucesso");
        router.push("/pagamento/consulta");
      } catch (e) {
        showError("Erro", "Falha ao atualizar o pagamento");
      } finally {
        hideLoading();
        isLoading.value = false;
      }
    };

    const voltar = () => {
      router.push("/pagamento/consulta");
    };

    onMounted(async () => {
      const { data: users } = await api.get("/api/Usuario");
      usuarios.value = users;
      await carregarPagamento();
    });

    return {
      pagamento,
      usuarios,
      isLoading,
      formularioValido,
      atualizarPagamento,
      voltar,
      calcularTroco,
      agendamentoInfo,
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
