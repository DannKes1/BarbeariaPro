<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Editar Profissional</h1>
      <p class="form-subtitle">Atualize os dados do profissional no sistema</p>
    </div>

    <form v-if="profissional" @submit.prevent="submitForm" class="professional-form">
      <div class="form-section">
        <h2 class="section-title">Dados Pessoais</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nome *</label>
            <input v-model="profissional.nome" class="form-input" required placeholder="Digite o nome" />
          </div>

          <div class="form-group">
            <label class="form-label">Sobrenome *</label>
            <input v-model="profissional.sobrenome" class="form-input" required placeholder="Digite o sobrenome" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Telefone *</label>
            <input v-model="profissional.telefone" class="form-input" required placeholder="(11) 98765-4321" @input="formatarTelefone" maxlength="15" />
          </div>

          <div class="form-group">
            <label class="form-label">CPF *</label>
            <input v-model="profissional.cpf" class="form-input" required disabled placeholder="000.000.000-00" maxlength="14" readonly />
            <p class="info-message">CPF não pode ser alterado</p>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">E-mail *</label>
            <input v-model="profissional.email" class="form-input" type="email" required placeholder="exemplo@email.com" />
          </div>

          <div class="form-group">
            <label class="form-label">Data de Nascimento *</label>
            <input v-model="profissional.dataNasc" class="form-input" required type="date" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h2 class="section-title">Dados Profissionais</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Especialidade *</label>
            <select v-model="profissional.especialidade" class="form-select" required>
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
          <button type="button" class="btn btn-secondary" @click="voltarParaConsulta">Voltar</button>
          <div class="primary-actions">
            <button type="button" class="btn btn-outline" @click="resetarFormulario" :disabled="isLoading || !hasChanges">Desfazer Alterações</button>
            <button class="btn btn-primary" type="submit" :disabled="isLoading || !isFormValid || !hasChanges">
              {{ isLoading ? "Salvando..." : "Salvar Alterações" }}
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { api } from "@/common/http";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const profissional = ref<any>(null);
    const originalProfissional = ref<any>(null);
    const isLoading = ref(false);

    const isFormValid = computed(() => {
      return profissional.value && Object.values(profissional.value).every((campo) => campo);
    });

    const hasChanges = computed(() => {
      return JSON.stringify(profissional.value) !== JSON.stringify(originalProfissional.value);
    });

    const formatarTelefone = () => {
      profissional.value.telefone = profissional.value.telefone.replace(/\D/g, "").replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
    };

    const loadProfissional = async () => {
      const res = await api.get(`/api/Profissional/${route.params.id}`);
       profissional.value = {
        ...res.data,
         dataNasc: res.data.dataNasc.slice(0, 10)
        };
      originalProfissional.value = JSON.parse(JSON.stringify(res.data));
    };

    const submitForm = async () => {
      isLoading.value = true;
      try {
        await api.put(`/api/Profissional/${profissional.value.id}`, profissional.value);
        router.push("/profissional/consulta");
      } catch (error) {
        console.error(error);
      } finally {
        isLoading.value = false;
      }
    };

    const resetarFormulario = () => {
      profissional.value = JSON.parse(JSON.stringify(originalProfissional.value));
    };

    const voltarParaConsulta = () => {
      router.push("/profissional/consulta");
    };

    onMounted(loadProfissional);

    return {
      profissional,
      isLoading,
      isFormValid,
      hasChanges,
      formatarTelefone,
      submitForm,
      resetarFormulario,
      voltarParaConsulta,
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


.professional-form {
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
