<template>
  <div class="page-container">
    <div class="content-wrapper">
      <!-- Header -->
      <div class="header">
        <div class="icon-container">
          <svg
            class="icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h1 class="title">Registrar Nova Entrada</h1>
        <p class="subtitle">Adicione uma nova entrada financeira ao sistema</p>
      </div>

      <!-- Form Card -->
      <div class="form-card">
        <div class="form-content">
          <form @submit.prevent="handleSubmit" class="form" novalidate>
            <!-- Descrição -->
            <div class="form-group">
              <label for="descricao" class="form-label">Descrição *</label>
              <div class="input-container">
                <input
                  id="descricao"
                  v-model="form.descricao"
                  type="text"
                  class="form-input"
                  :class="{ 'input-error': !!errors.descricao }"
                  placeholder="Ex: Venda de produto, Prestação de serviço..."
                  maxlength="100"
                  @blur="validateField('descricao')"
                  @input="clearFieldError('descricao')"
                />
                <div class="input-icon" v-if="errors.descricao">
                  <svg
                    class="error-icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div class="input-footer">
                <span v-if="errors.descricao" class="error-message">{{
                  errors.descricao
                }}</span>
                <span class="char-counter"
                  >{{ form.descricao.length }}/100</span
                >
              </div>
            </div>

            <!-- Valor -->
            <div class="form-group">
              <label for="valor" class="form-label">Valor (R$) *</label>
              <div class="input-container">
                <div class="currency-prefix">
                  <span>R$</span>
                </div>
                <input
                  id="valor"
                  v-model="form.valor"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-input input-with-prefix"
                  :class="{ 'input-error': !!errors.valor }"
                  placeholder="0,00"
                  @blur="validateField('valor')"
                  @input="clearFieldError('valor')"
                />
                <div class="input-icon" v-if="errors.valor">
                  <svg
                    class="error-icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <span v-if="errors.valor" class="error-message">{{
                errors.valor
              }}</span>
            </div>

            <!-- Categoria -->
            <div class="form-group">
              <label for="categoria" class="form-label">Categoria *</label>
              <div class="input-container">
                <select
                  id="categoria"
                  v-model="form.categoria"
                  class="form-select"
                  :class="{ 'input-error': !!errors.categoria }"
                  @change="validateField('categoria')"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="servico">🔧 Serviço</option>
                  <option value="produto">📦 Produto</option>
                  <option value="outros">📋 Outros</option>
                </select>
                <div class="input-icon" v-if="errors.categoria">
                  <svg
                    class="error-icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <span v-if="errors.categoria" class="error-message">{{
                errors.categoria
              }}</span>
            </div>

            <!-- Observações -->
            <div class="form-group">
              <label for="observacoes" class="form-label">
                Observações
                <span class="optional-label">(opcional)</span>
              </label>
              <textarea
                id="observacoes"
                v-model="form.observacoes"
                class="form-textarea"
                rows="4"
                maxlength="500"
                placeholder="Adicione informações complementares sobre esta entrada..."
                @input="clearFieldError('observacoes')"
              ></textarea>
              <div class="textarea-footer">
                <span class="char-counter"
                  >{{ form.observacoes.length }}/500</span
                >
              </div>
            </div>

            <!-- Submit Button -->
            <div class="submit-container">
              <button
                type="submit"
                class="submit-button"
                :disabled="isLoading || !isFormValid"
                :class="{ 'button-loading': isLoading }"
              >
                <div v-if="isLoading" class="button-content">
                  <svg class="loading-spinner" fill="none" viewBox="0 0 24 24">
                    <circle
                      class="spinner-track"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="spinner-path"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Registrando...
                </div>
                <div v-else class="button-content">
                  <svg
                    class="button-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Registrar Entrada
                </div>
              </button>
            </div>
          </form>
        </div>

        <!-- Form Summary -->
        <div v-if="isFormValid && !hasErrors" class="form-summary">
          <div class="summary-content">
            <svg class="success-icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            Formulário preenchido corretamente
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, reactive } from "vue";
import { useSweetAlert } from "@/composables/useSweetAlert";

interface FormData {
  descricao: string;
  valor: string;
  categoria: string;
  observacoes: string;
}

interface FormErrors {
  descricao?: string;
  valor?: string;
  categoria?: string;
  observacoes?: string;
}

export default defineComponent({
  name: "RegistrarEntradaView",
  setup() {
    const { showSuccess, showError, showLoading, hideLoading } =
      useSweetAlert();

    const isLoading = ref(false);
    const form = reactive<FormData>({
      descricao: "",
      valor: "",
      categoria: "",
      observacoes: "",
    });
    const errors = reactive<FormErrors>({});

    const validateField = (fieldName: keyof FormData): boolean => {
      switch (fieldName) {
        case "descricao":
          if (!form.descricao.trim()) {
            errors.descricao = "A descrição é obrigatória";
            return false;
          }
          if (form.descricao.trim().length < 3) {
            errors.descricao = "A descrição deve ter pelo menos 3 caracteres";
            return false;
          }
          delete errors.descricao;
          return true;

        case "valor":
          if (!form.valor) {
            errors.valor = "O valor é obrigatório";
            return false;
          }
          const valorNum = parseFloat(form.valor);
          if (isNaN(valorNum) || valorNum <= 0) {
            errors.valor = "O valor deve ser maior que zero";
            return false;
          }
          if (valorNum > 999999.99) {
            errors.valor = "O valor não pode exceder R$ 999.999,99";
            return false;
          }
          delete errors.valor;
          return true;

        case "categoria":
          if (!form.categoria) {
            errors.categoria = "A categoria é obrigatória";
            return false;
          }
          delete errors.categoria;
          return true;

        default:
          return true;
      }
    };

    const clearFieldError = (fieldName: keyof FormErrors): void => {
      if (errors[fieldName]) {
        delete errors[fieldName];
      }
    };

    const validateForm = (): boolean => {
      return ["descricao", "valor", "categoria"].every((f) =>
        validateField(f as keyof FormData)
      );
    };

    const isFormValid = computed<boolean>(() => validateForm());
    const hasErrors = computed<boolean>(() => Object.keys(errors).length > 0);

    const formatCurrency = (value: string): string => {
      const num = parseFloat(value);
      return isNaN(num)
        ? "0,00"
        : num.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
    };

    const resetForm = (): void => {
      Object.assign(form, {
        descricao: "",
        valor: "",
        categoria: "",
        observacoes: "",
      });
      Object.keys(errors).forEach((k) => delete errors[k as keyof FormErrors]);
    };

    const handleSubmit = async (): Promise<void> => {
      if (!validateForm()) {
        showError(
          "Formulário inválido",
          "Por favor, corrija os erros antes de continuar."
        );
        return;
      }
      isLoading.value = true;
      showLoading("Registrando entrada financeira...");
      try {
        await new Promise((r) => setTimeout(r, 2000));
        hideLoading();
        const valorFormatado = formatCurrency(form.valor);
        await showSuccess(
          "Entrada registrada com sucesso!",
          `Entrada de R$ ${valorFormatado} foi registrada na categoria "${getCategoryLabel(form.categoria)}".`
        );
        resetForm();
      } catch (err) {
        hideLoading();
        showError(
          "Erro ao registrar entrada",
          "Ocorreu um erro inesperado. Tente novamente."
        );
        console.error(err);
      } finally {
        isLoading.value = false;
      }
    };

    const getCategoryLabel = (cat: string): string => {
      const labels: Record<string, string> = {
        servico: "Serviço",
        produto: "Produto",
        outros: "Outros",
      };
      return labels[cat] || cat;
    };

    return {
      form,
      errors,
      isLoading,
      isFormValid,
      hasErrors,
      validateField,
      clearFieldError,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
/* Reset e base */
* {
  box-sizing: border-box;
}

/* Container principal */
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 1rem;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
}

.content-wrapper {
  max-width: 48rem;
  margin: 0 auto;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 2rem;
}

.icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background-color: #d1fae5;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.icon {
  width: 2rem;
  height: 2rem;
  color: #059669;
}

.title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

/* Form Card */
.form-card {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.form-content {
  padding: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Form Groups */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: fadeIn 0.3s ease-out;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.optional-label {
  color: #9ca3af;
  font-weight: 400;
}

/* Input Container */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

/* Form Inputs */
.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  color: #111827;
  background-color: #ffffff;
  font-size: 1rem;
  line-height: 1.5;
  transition: all 0.2s ease;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Input with prefix */
.input-with-prefix {
  padding-left: 3rem;
}

.currency-prefix {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding-left: 0.75rem;
  pointer-events: none;
  z-index: 1;
}

.currency-prefix span {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Error states */
.input-error {
  border-color: #fca5a5 !important;
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1) !important;
  background-color: #fef2f2 !important;
}

.input-icon {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding-right: 0.75rem;
  pointer-events: none;
}

.error-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #ef4444;
}

/* Select specific */
.form-select {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* Textarea */
.form-textarea {
  resize: vertical;
  min-height: 6rem;
}

/* Error messages */
.error-message {
  font-size: 0.875rem;
  color: #dc2626;
  font-weight: 500;
}

/* Input footers */
.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
}

.textarea-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.25rem;
}

.char-counter {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Submit button */
.submit-container {
  padding-top: 1rem;
}

.submit-button {
  width: 100%;
  background: linear-gradient(to right, #059669, #047857);
  color: #ffffff;
  font-weight: 600;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 1rem;
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(to right, #047857, #065f46);
  transform: translateY(-2px);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.button-loading {
  cursor: wait;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Loading spinner */
.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  animation: spin 1s linear infinite;
}

.spinner-track {
  opacity: 0.25;
}

.spinner-path {
  opacity: 0.75;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Form summary */
.form-summary {
  background-color: #f8fafc;
  padding: 1rem 2rem;
  border-top: 1px solid #e2e8f0;
}

.summary-content {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #64748b;
}

.success-icon {
  width: 1rem;
  height: 1rem;
  color: #10b981;
  margin-right: 0.5rem;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .page-container {
    padding: 1rem 0.5rem;
  }

  .form-content {
    padding: 1.5rem;
  }

  .form-input,
  .form-select,
  .form-textarea {
    font-size: 1rem; /* Prevent zoom on iOS */
  }

  .title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .input-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .char-counter {
    align-self: flex-end;
  }
}
</style>
