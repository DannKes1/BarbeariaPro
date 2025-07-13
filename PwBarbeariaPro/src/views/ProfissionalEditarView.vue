<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Editar Profissional</h1>
      <p class="form-subtitle">Atualize os dados do profissional no sistema</p>
    </div>

    <form
      v-if="profissional"
      @submit.prevent="submitForm"
      class="professional-form"
    >
      <!-- Dados Pessoais -->
      <div class="form-section">
        <h2 class="section-title">Dados Pessoais</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nome *</label>
            <input
              v-model="profissional.nome"
              class="form-input"
              required
              pattern="[A-Za-zÀ-ü ]+"
              :disabled="isLoading"
              placeholder="Digite o nome"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Sobrenome *</label>
            <input
              v-model="profissional.sobrenome"
              class="form-input"
              required
              pattern="[A-Za-zÀ-ü ]+"
              :disabled="isLoading"
              placeholder="Digite o sobrenome"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Telefone *</label>
            <input
              v-model="profissional.telefone"
              class="form-input"
              required
              :disabled="isLoading"
              placeholder="(11) 98765-4321"
              @input="formatarTelefone"
              maxlength="15"
            />
          </div>

          <div class="form-group">
            <label class="form-label">CPF *</label>
            <input
              v-model="profissional.cpf"
              class="form-input"
              :class="{ 'input-error': erros.cpf }"
              required
              :disabled="true"
              placeholder="000.000.000-00"
              maxlength="14"
              readonly
            />
            <p v-if="erros.cpf" class="error-message">{{ erros.cpf }}</p>
            <p class="info-message">CPF não pode ser alterado</p>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">E-mail *</label>
            <input
              v-model="profissional.email"
              class="form-input"
              type="email"
              required
              :disabled="isLoading"
              placeholder="exemplo@email.com"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Data de Nascimento *</label>
            <input
              v-model="profissional.dataNascimento"
              class="form-input"
              :class="{ 'input-error': erros.dataNascimento }"
              required
              type="date"
              @change="validarIdade"
              :disabled="isLoading"
            />
            <p v-if="erros.dataNascimento" class="error-message">
              {{ erros.dataNascimento }}
            </p>
          </div>
        </div>
      </div>

      <!-- Dados Profissionais -->
      <div class="form-section">
        <h2 class="section-title">Dados Profissionais</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Especialidade *</label>
            <select
              v-model="profissional.especialidade"
              class="form-select"
              required
              :disabled="isLoading"
            >
              <option value="">Selecione uma especialidade</option>
              <option value="Cabeleireiro">Cabeleireiro</option>
              <option value="Barbeiro">Barbeiro</option>
              <option value="Esteticista">Esteticista</option>
              <option value="Manicure">Manicure</option>
              <option value="Pedicure">Pedicure</option>
              <option value="Massagista">Massagista</option>
              <option value="Depilador">Depilador</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Salário (R$)</label>
            <input
              v-model="profissional.salario"
              class="form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              :disabled="isLoading"
            />
          </div>
        </div>
      </div>

      <!-- Botões de Ação -->
      <div class="form-actions">
        <div class="actions-group">
          <button
            type="button"
            class="btn btn-secondary"
            @click="voltarParaConsulta"
            :disabled="isLoading"
          >
            <i class="icon-arrow-left"></i>
            Voltar
          </button>

          <div class="primary-actions">
            <button
              type="button"
              class="btn btn-outline"
              @click="resetarFormulario"
              :disabled="isLoading || !hasChanges"
            >
              <i class="icon-refresh"></i>
              Desfazer Alterações
            </button>

            <button
              class="btn btn-primary"
              type="submit"
              :disabled="isLoading || !isFormValid || !hasChanges"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              <i v-else class="icon-check"></i>
              {{ isLoading ? "Salvando..." : "Salvar Alterações" }}
            </button>
          </div>
        </div>
      </div>
    </form>

    <!-- Estado de Loading -->
    <div v-else-if="isLoadingProfissional" class="loading-state">
      <div class="loading-spinner-large"></div>
      <h3 class="loading-title">Carregando dados do profissional...</h3>
      <p class="loading-text">
        Por favor, aguarde enquanto buscamos as informações.
      </p>
    </div>

    <!-- Estado de Erro -->
    <div v-else class="error-state">
      <div class="error-icon">
        <i class="icon-alert-circle"></i>
      </div>
      <h3 class="error-title">Profissional não encontrado</h3>
      <p class="error-text">
        O profissional solicitado não existe ou foi removido do sistema.
      </p>
      <button class="btn btn-primary" @click="voltarParaConsulta">
        <i class="icon-arrow-left"></i>
        Voltar à Lista de Profissionais
      </button>
    </div>

    <!-- Toast de Sucesso -->
    <div v-if="showSuccessToast" class="success-toast">
      <div class="toast-content">
        <i class="icon-check-circle"></i>
        <span>Alterações salvas com sucesso!</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { api } from "@/common/http";
import feather from "feather-icons";

interface Profissional {
  id: number;
  nome: string;
  sobrenome: string;
  telefone: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  especialidade: string;
  salario: string;
}

export default defineComponent({
  name: "ProfissionalEditarView",
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const {
      showToast,
      showError,
      showSuccess,
      showLoading,
      hideLoading,
      confirmAction,
    } = useSweetAlert();

    const isLoading = ref(false);
    const isLoadingProfissional = ref(true);
    const showSuccessToast = ref(false);

    const profissional = ref<Profissional | null>(null);
    const originalProfissional = ref<Profissional | null>(null);
    const erros = ref({ cpf: "", dataNascimento: "" });

    // Computed para validar se o formulário está válido
    const isFormValid = computed(() => {
      if (!profissional.value) return false;

      return (
        profissional.value.nome.trim() &&
        profissional.value.sobrenome.trim() &&
        profissional.value.telefone.trim() &&
        profissional.value.cpf.trim() &&
        profissional.value.email.trim() &&
        profissional.value.dataNascimento &&
        profissional.value.especialidade &&
        !erros.value.cpf &&
        !erros.value.dataNascimento
      );
    });

    // Computed para verificar se houve mudanças
    const hasChanges = computed(() => {
      if (!profissional.value || !originalProfissional.value) return false;

      return (
        profissional.value.nome !== originalProfissional.value.nome ||
        profissional.value.sobrenome !== originalProfissional.value.sobrenome ||
        profissional.value.telefone !== originalProfissional.value.telefone ||
        profissional.value.email !== originalProfissional.value.email ||
        profissional.value.dataNascimento !==
          originalProfissional.value.dataNascimento ||
        profissional.value.especialidade !==
          originalProfissional.value.especialidade ||
        profissional.value.salario !== originalProfissional.value.salario
      );
    });

    // Formatação automática do telefone
    function formatarTelefone() {
      if (!profissional.value) return;

      let valor = profissional.value.telefone.replace(/\D/g, "");

      if (valor.length <= 11) {
        valor = valor.replace(/(\d{2})(\d)/, "($1) $2");
        valor = valor.replace(/(\d{4,5})(\d{4})$/, "$1-$2");
        profissional.value.telefone = valor;
      }
    }

    function validarIdade() {
      if (!profissional.value) return false;

      const hoje = new Date();
      const nascimento = new Date(profissional.value.dataNascimento);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const ajuste =
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() &&
          hoje.getDate() < nascimento.getDate());

      if (idade - (ajuste ? 1 : 0) < 18) {
        erros.value.dataNascimento =
          "Profissional deve ter pelo menos 18 anos.";
        return false;
      }

      erros.value.dataNascimento = "";
      return true;
    }

    async function loadProfissional() {
      isLoadingProfissional.value = true;

      try {
        const res = await api.get<Profissional>(
          `/api/Profissional/${props.id}`
        );
        profissional.value = { ...res.data };
        originalProfissional.value = { ...res.data };
      } catch (error) {
        console.error("Erro ao carregar profissional:", error);
        profissional.value = null;
        showError(
          "Erro ao carregar",
          "Não foi possível carregar os dados do profissional."
        );
      } finally {
        isLoadingProfissional.value = false;
      }
    }

    async function submitForm() {
      if (!profissional.value) return;

      // Validações finais
      if (!isFormValid.value) {
        showError(
          "Formulário incompleto",
          "Por favor, preencha todos os campos obrigatórios corretamente."
        );
        return;
      }

      if (!hasChanges.value) {
        showToast.info("Nenhuma alteração foi feita.");
        return;
      }

      // Confirmar alterações
      const confirmed = await confirmAction(
        "Confirmar alterações",
        `Deseja salvar as alterações feitas no profissional ${profissional.value.nome} ${profissional.value.sobrenome}?`,
        "Sim, salvar"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Salvando alterações...");

      try {
        await api.put(
          `/api/Profissional/${profissional.value.id}`,
          profissional.value
        );

        hideLoading();

        // Atualizar dados originais
        originalProfissional.value = { ...profissional.value };

        showSuccess(
          "Alterações salvas!",
          `Os dados de ${profissional.value.nome} ${profissional.value.sobrenome} foram atualizados com sucesso.`
        );

        // Mostrar toast de sucesso
        showSuccessToast.value = true;
        setTimeout(() => {
          showSuccessToast.value = false;
        }, 3000);

        showToast.success("Profissional atualizado com sucesso!");
      } catch (error) {
        hideLoading();
        console.error("Erro ao salvar:", error);
        showError(
          "Erro ao salvar",
          "Ocorreu um erro ao salvar as alterações. Tente novamente."
        );
      } finally {
        isLoading.value = false;
      }
    }

    function resetarFormulario() {
      if (!originalProfissional.value) return;

      profissional.value = { ...originalProfissional.value };
      erros.value = { cpf: "", dataNascimento: "" };
      showToast.info("Alterações desfeitas");
    }

    function voltarParaConsulta() {
      if (hasChanges.value) {
        confirmAction(
          "Descartar alterações?",
          "Você tem alterações não salvas. Deseja realmente sair sem salvar?",
          "Sim, descartar"
        ).then((confirmed) => {
          if (confirmed) {
            router.push("/profissional/consulta");
          }
        });
      } else {
        router.push("/profissional/consulta");
      }
    }

    onMounted(() => {
      loadProfissional();
      feather.replace();
    });

    return {
      profissional,
      erros,
      isLoading,
      isLoadingProfissional,
      isFormValid,
      hasChanges,
      showSuccessToast,
      formatarTelefone,
      validarIdade,
      submitForm,
      resetarFormulario,
      voltarParaConsulta,
    };
  },
});
</script>

<style scoped>
/* Container Principal */
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

/* Cabeçalho do Formulário */
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

/* Formulário */
.professional-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Seções do Formulário */
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

/* Layout dos Campos */
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

/* Labels */
.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

/* Inputs */
.form-input,
.form-select {
  padding: 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  background: #ffffff;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled,
.form-select:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: #9ca3af;
}

/* Estados de Erro */
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

.info-message {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-style: italic;
}

/* Área de Ações */
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

.primary-actions {
  display: flex;
  gap: 1rem;
}

/* Botões */
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
  min-width: 140px;
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

.btn-outline {
  background: #ffffff;
  color: #f59e0b;
  border: 2px solid #fbbf24;
}

.btn-outline:hover:not(:disabled) {
  background: #fffbeb;
  border-color: #f59e0b;
  color: #d97706;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Estados de Loading e Erro */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner-large {
  width: 3rem;
  height: 3rem;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

.loading-title,
.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.loading-text,
.error-text {
  color: #6b7280;
  margin-bottom: 2rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.error-icon {
  font-size: 4rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

/* Spinner de Loading */
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

/* Toast de Sucesso */
.success-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.toast-content {
  background: #10b981;
  color: #ffffff;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Ícones */
.icon-check::before {
  content: "✓";
}

.icon-refresh::before {
  content: "↻";
}

.icon-arrow-left::before {
  content: "←";
}

.icon-alert-circle::before {
  content: "⚠";
}

.icon-check-circle::before {
  content: "✓";
}

/* Responsividade */
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
    flex-direction: column;
    gap: 1rem;
  }

  .primary-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .success-toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;
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

  .loading-state,
  .error-state {
    padding: 2rem 1rem;
  }
}
</style>
