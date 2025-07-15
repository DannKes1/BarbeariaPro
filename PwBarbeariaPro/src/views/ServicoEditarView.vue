<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Editar Serviço</h1>
    </div>

    <form @submit.prevent="submitForm" class="client-form">
      <div class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nome do Serviço</label>
            <input
              v-model="servico.nome"
              class="form-input"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Categoria</label>
            <select
              v-model="servico.categoria"
              class="form-select"
              required
              :disabled="isLoading"
            >
              <option value="">Selecione uma categoria</option>
              <option value="Cabelo">Cabelo</option>
              <option value="Barba">Barba</option>
              <option value="Estética">Estética</option>
              <option value="Unhas">Unhas</option>
              <option value="Massagem">Massagem</option>
              <option value="Combo">Combo</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Preço (R$)</label>
            <input
              v-model.number="servico.valor"
              class="form-input"
              type="number"
              min="0"
              step="0.01"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Duração (minutos)</label>
            <input
              v-model.number="servico.duracaoMinutos"
              class="form-input"
              type="number"
              min="15"
              step="15"
              required
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Descrição</label>
          <textarea
            v-model="servico.descricao"
            class="form-textarea"
            rows="3"
            :disabled="isLoading"
          ></textarea>
        </div>

        <div class="form-actions">
          <div class="actions-group">
            <button class="btn btn-primary" type="submit" :disabled="isLoading">
              <span
                v-if="isLoading"
                class="loading-spinner"
                role="status"
              ></span>
              {{ isLoading ? "Salvando..." : "Salvar Alterações" }}
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="voltar"
              :disabled="isLoading"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { api } from "@/common/http";

export default defineComponent({
  name: "ServicoEdicaoView",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const id = Number(route.params.id);

    const { showError, showSuccess, showLoading, hideLoading, confirmAction } =
      useSweetAlert();

    const isLoading = ref(false);

    const servico = ref({
      id: id,
      nome: "",
      descricao: "",
      categoria: "",
      valor: 0,
      duracaoMinutos: 0,
    });

    async function carregarServico() {
      try {
        const { data } = await api.get(`/api/Servico/${id}`);
        servico.value = {
          id: data.id,
          nome: data.nome,
          descricao: data.descricao,
          categoria: data.categoria,
          valor: data.valor,
          duracaoMinutos: data.duracaoMinutos,
        };
      } catch {
        showError("Erro", "Erro ao carregar o serviço.");
        router.push("/servico");
      }
    }

    async function submitForm() {
      if (!servico.value.nome.trim()) {
        showError("Campo obrigatório", "Informe o nome do serviço.");
        return;
      }

      if (!servico.value.categoria) {
        showError("Campo obrigatório", "Selecione uma categoria.");
        return;
      }

      if (!servico.value.valor || servico.value.valor <= 0) {
        showError("Preço inválido", "Informe um preço válido.");
        return;
      }

      if (!servico.value.duracaoMinutos || servico.value.duracaoMinutos < 15) {
        showError("Duração inválida", "A duração mínima é de 15 minutos.");
        return;
      }

      const confirmado = await confirmAction(
        "Confirmar alterações",
        `Deseja salvar as alterações no serviço "${servico.value.nome}"?`,
        "Salvar"
      );

      if (!confirmado) return;

      isLoading.value = true;
      showLoading("Salvando alterações...");

      try {
        const payload = {
          ...servico.value,
          duracaoEstimada: new Date().toISOString(),
        };

        await api.put(`/api/Servico/${id}`, payload);

        hideLoading();

        showSuccess("Sucesso", "Serviço atualizado com sucesso.");
        router.push("/servico/consulta");
      } catch {
        hideLoading();
        showError("Erro", "Erro ao atualizar o serviço.");
      } finally {
        isLoading.value = false;
      }
    }

    function voltar() {
      router.push("/servico/consulta");
    }

    onMounted(carregarServico);

    return {
      servico,
      isLoading,
      submitForm,
      voltar,  
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
