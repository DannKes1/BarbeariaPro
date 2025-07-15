<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Cadastrar Profissional</h1>
      <p class="form-subtitle">
        Preencha os dados do profissional para cadastro no sistema
      </p>
    </div>

    <form @submit.prevent="submitForm" class="professional-form">
      <div class="form-section">
        <h2 class="section-title">Dados Pessoais</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nome *</label>
            <input
              v-model="profissional.nome"
              class="form-input"
              required
              placeholder="Digite o nome"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Sobrenome *</label>
            <input
              v-model="profissional.sobrenome"
              class="form-input"
              required
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
              required
              placeholder="000.000.000-00"
              @input="formatarCPF"
              maxlength="14"
            />
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
              placeholder="exemplo@email.com"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Data de Nascimento *</label>
            <input
              v-model="profissional.dataNasc"
              class="form-input"
              required
              type="date"
            />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h2 class="section-title">Dados Profissionais</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Especialidade *</label>
            <select
              v-model="profissional.especialidade"
              class="form-select"
              required
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
        </div>
      </div>

      <div class="form-actions">
        <div class="actions-group">
          <button
            type="button"
            class="btn btn-secondary"
            @click="limparFormulario"
          >
            Limpar Formulário
          </button>

          <button
            class="btn btn-primary"
            type="submit"
            :disabled="isLoading || !isFormValid"
          >
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
import { api } from "@/common/http";

export default defineComponent({
  setup() {
    const router = useRouter();

    const profissional = ref({
      nome: "",
      sobrenome: "",
      telefone: "",
      cpf: "",
      email: "",
      dataNasc: "",
      especialidade: "",
    });

    const isLoading = ref(false);

    const isFormValid = computed(() => {
      return Object.values(profissional.value).every((campo) => campo);
    });

    const formatarTelefone = () => {
      profissional.value.telefone = profissional.value.telefone.replace(/\D/g, "").replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
    };

    const formatarCPF = () => {
      profissional.value.cpf = profissional.value.cpf.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    };

    const submitForm = async () => {
      isLoading.value = true;
      try {
        await api.post("/api/Profissional", profissional.value);
        router.push("/profissional/consulta");
      } catch (error) {
        console.error("Erro ao cadastrar profissional", error);
      } finally {
        isLoading.value = false;
      }
    };

    const limparFormulario = () => {
      Object.keys(profissional.value).forEach((key) => profissional.value[key] = "");
    };

    return {
      profissional,
      isLoading,
      isFormValid,
      formatarTelefone,
      formatarCPF,
      submitForm,
      limparFormulario,
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
