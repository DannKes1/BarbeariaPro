<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Cadastrar Profissional</h1>
      <p class="form-subtitle">
        Preencha os dados do profissional para cadastro no sistema
      </p>
    </div>

    <form @submit.prevent="submitForm" class="professional-form">
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
              :disabled="isLoading"
              placeholder="000.000.000-00"
              @input="formatarCPF"
              @blur="validarCPF"
              maxlength="14"
            />
            <p v-if="erros.cpf" class="error-message">{{ erros.cpf }}</p>
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
            @click="limparFormulario"
            :disabled="isLoading"
          >
            <i class="icon-refresh"></i>
            Limpar Formulário
          </button>

          <button
            class="btn btn-primary"
            type="submit"
            :disabled="isLoading || !isFormValid"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <i v-else class="icon-check"></i>
            {{ isLoading ? "Cadastrando..." : "Cadastrar Profissional" }}
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
import feather from "feather-icons";

export default defineComponent({
  name: "ProfissionalCadastroView",
  setup() {
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

    const profissional = ref({
      nome: "",
      sobrenome: "",
      telefone: "",
      cpf: "",
      email: "",
      dataNascimento: "",
      especialidade: "",
      salario: "",
    });

    const erros = ref({ cpf: "", dataNascimento: "" });

    // Computed para validar se o formulário está válido
    const isFormValid = computed(() => {
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

    // Formatação automática do telefone
    function formatarTelefone() {
      let valor = profissional.value.telefone.replace(/\D/g, "");

      if (valor.length <= 11) {
        valor = valor.replace(/(\d{2})(\d)/, "($1) $2");
        valor = valor.replace(/(\d{4,5})(\d{4})$/, "$1-$2");
        profissional.value.telefone = valor;
      }
    }

    // Formatação automática do CPF
    function formatarCPF() {
      let valor = profissional.value.cpf.replace(/\D/g, "");

      if (valor.length <= 11) {
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        profissional.value.cpf = valor;
      }

      // Limpar erro se o usuário está digitando
      if (erros.value.cpf && valor.length < 14) {
        erros.value.cpf = "";
      }
    }

    function validarCPF() {
      const cpf = profissional.value.cpf.replace(/[\.\-]/g, "");

      if (cpf.length !== 11) {
        erros.value.cpf = "CPF deve conter 11 dígitos.";
        return false;
      }

      if (/^(\d)\1{10}$/.test(cpf)) {
        erros.value.cpf = "CPF inválido.";
        return false;
      }

      let soma = 0;
      let resto;

      for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
      }

      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf[9])) {
        erros.value.cpf = "CPF inválido.";
        return false;
      }

      soma = 0;
      for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
      }

      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf[10])) {
        erros.value.cpf = "CPF inválido.";
        return false;
      }

      erros.value.cpf = "";
      return true;
    }

    function validarIdade() {
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

    async function submitForm() {
      // Validações finais
      if (!isFormValid.value) {
        showError(
          "Formulário incompleto",
          "Por favor, preencha todos os campos obrigatórios corretamente."
        );
        return;
      }

      // Confirmar cadastro
      const confirmed = await confirmAction(
        "Confirmar cadastro",
        `Deseja cadastrar o profissional ${profissional.value.nome} ${profissional.value.sobrenome} como ${profissional.value.especialidade}?`,
        "Sim, cadastrar"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Cadastrando profissional...");

      try {
        // Chamada real à API
        await api.post("/api/Profissional", profissional.value);

        hideLoading();

        showSuccess(
          "Profissional cadastrado!",
          `${profissional.value.nome} ${profissional.value.sobrenome} foi cadastrado com sucesso.`
        );

        limparFormulario();
        showToast.success("Profissional cadastrado com sucesso!");
        router.push("/profissional/consulta");
      } catch (error) {
        hideLoading();
        showError(
          "Erro no servidor",
          "Ocorreu um erro ao cadastrar o profissional. Tente novamente."
        );
      } finally {
        isLoading.value = false;
      }
    }

    function limparFormulario() {
      Object.assign(profissional.value, {
        nome: "",
        sobrenome: "",
        telefone: "",
        cpf: "",
        email: "",
        dataNascimento: "",
        especialidade: "",
        salario: "",
      });

      erros.value = { cpf: "", dataNascimento: "" };
      showToast.info("Formulário limpo");
    }

    onMounted(() => {
      feather.replace();
    });

    return {
      profissional,
      erros,
      isLoading,
      isFormValid,
      formatarTelefone,
      formatarCPF,
      validarCPF,
      validarIdade,
      submitForm,
      limparFormulario,
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

/* Ícones */
.icon-check::before {
  content: "✓";
}

.icon-refresh::before {
  content: "↻";
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
