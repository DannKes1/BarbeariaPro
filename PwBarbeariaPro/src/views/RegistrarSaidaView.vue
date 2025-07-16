<template>
  <div class="page-container">
    <div>
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
              d="M6 12h12"
            />
          </svg>
        </div>
        <h1 class="title">Registrar Nova Saída</h1>
        <p class="subtitle">Adicione uma nova despesa ao sistema</p>
      </div>

      <div class="form-card">
        <div class="form-content">
          <form @submit.prevent="handleSubmit" class="form" novalidate>
            <div class="form-group">
              <label for="descricao" class="form-label">Descrição *</label>
              <div class="input-container">
                <input
                  id="descricao"
                  v-model="form.descricao"
                  type="text"
                  class="form-input"
                  :class="{ 'input-error': !!errors.descricao }"
                  placeholder="Ex: Compra de materiais, pagamento de conta..."
                  maxlength="100"
                  @blur="validateField('descricao')"
                  @input="clearFieldError('descricao')"
                />
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

            <div class="form-group">
              <label for="valor" class="form-label">Valor (R$) *</label>
              <div class="input-container">
                <div class="currency-prefix"><span>R$</span></div>
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
              </div>
              <span v-if="errors.valor" class="error-message">{{
                errors.valor
              }}</span>
            </div>

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
                  <option value="salario">💼 Salário</option>
                  <option value="manutencao">🛠️ Manutenção</option>
                  <option value="compras">🛒 Compras</option>
                  <option value="outros">📋 Outros</option>
                </select>
              </div>
              <span v-if="errors.categoria" class="error-message">{{
                errors.categoria
              }}</span>
            </div>

            <div class="form-group">
              <label for="observacoes" class="form-label"
                >Observações
                <span class="optional-label">(opcional)</span></label
              >
              <textarea
                id="observacoes"
                v-model="form.observacoes"
                class="form-textarea"
                rows="4"
                maxlength="500"
                placeholder="Adicione observações..."
                @input="clearFieldError('observacoes')"
              ></textarea>
              <div class="textarea-footer">
                <span class="char-counter"
                  >{{ form.observacoes.length }}/500</span
                >
              </div>
            </div>

            <div class="submit-container">
              <button
                type="submit"
                class="submit-button"
                :disabled="isLoading || !isFormValid"
              >
                <div v-if="isLoading" class="button-content">
                  <div class="loading-spinner"></div>
                  Registrando...
                </div>
                <div v-else class="button-content">Registrar Saída</div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { api } from "@/common/http";
import { useSweetAlert } from "@/composables/useSweetAlert";

export default defineComponent({
  name: "RegistrarSaidaView",
  setup() {
    const { showSuccess, showError, showLoading, hideLoading } =
      useSweetAlert();
    const router = useRouter();

    const isLoading = ref(false);
    const caixaAberto = ref<any>(null);

    const form = reactive({
      descricao: "",
      valor: "",
      categoria: "",
      observacoes: "",
    });

    const errors = reactive<Record<string, string>>({});

    const validateField = (field: string): boolean => {
      switch (field) {
        case "descricao":
          if (!form.descricao.trim()) {
            errors.descricao = "Descrição obrigatória";
            return false;
          }
          if (form.descricao.length < 3) {
            errors.descricao = "Mínimo 3 caracteres";
            return false;
          }
          delete errors.descricao;
          return true;
        case "valor":
          const valor = parseFloat(form.valor);
          if (!form.valor) {
            errors.valor = "Valor obrigatório";
            return false;
          }
          if (isNaN(valor) || valor <= 0) {
            errors.valor = "Valor deve ser maior que zero";
            return false;
          }
          if (valor > 999999.99) {
            errors.valor = "Valor máximo R$ 999.999,99";
            return false;
          }
          delete errors.valor;
          return true;
        case "categoria":
          if (!form.categoria) {
            errors.categoria = "Categoria obrigatória";
            return false;
          }
          delete errors.categoria;
          return true;
        default:
          return true;
      }
    };

    const clearFieldError = (field: string): void => {
      if (errors[field]) {
        delete errors[field];
      }
    };

    const isFormValid = computed(() => {
      return ["descricao", "valor", "categoria"].every((field) =>
        validateField(field)
      );
    });

    onMounted(async () => {
      try {
        const res = await api.get("/api/Caixa/ultimo");
        if (res.data?.status === "Aberto") {
          caixaAberto.value = res.data;
        } else {
          await showError(
            "Caixa Fechado",
            "Abra o caixa antes de registrar uma saída."
          );
          setTimeout(() => {
            router.push({ path: "/caixa/abrir" });
          }, 2000);
        }
      } catch (error) {
        console.error("Erro ao carregar caixa:", error);
        await showError("Erro", "Não foi possível carregar o caixa.");
      }
    });

    const resetForm = () => {
      Object.assign(form, {
        descricao: "",
        valor: "",
        categoria: "",
        observacoes: "",
      });
      Object.keys(errors).forEach((key) => delete errors[key]);
    };

    const handleSubmit = async () => {
      // Validação final do formulário
      if (!isFormValid.value) {
        await showError(
          "Formulário inválido",
          "Preencha todos os campos corretamente."
        );
        return;
      }

      // Verificar se o caixa está disponível
      if (!caixaAberto.value) {
        await showError(
          "Caixa não encontrado",
          "Nenhum caixa aberto foi localizado."
        );
        return;
      }

      const valorNum = parseFloat(form.valor);

      // Verificar se o valor é válido
      if (isNaN(valorNum) || valorNum <= 0) {
        await showError("Valor inválido", "Por favor, insira um valor válido.");
        return;
      }

      isLoading.value = true;

      try {
        // Mostrar loading
        showLoading("Registrando saída...");

        // Criar movimentação
        const movimentacaoPayload = {
          id: 0, // O backend deve gerar o ID
          tipo: "Saída",
          valor: valorNum,
          categoria: form.categoria,
          descricao: form.descricao,
          comprovantePath: "",
          caixaFk: caixaAberto.value.id,
        };

        console.log("Enviando movimentação:", movimentacaoPayload);
        await api.post("/api/MovimentacaoCaixa", movimentacaoPayload);

        // Atualizar saldo do caixa
        const novoSaldo = (caixaAberto.value.saldoFinal || 0) - valorNum;
        const caixaAtualizado = {
          ...caixaAberto.value,
          saldoFinal: novoSaldo,
        };

        console.log("Atualizando caixa:", caixaAtualizado);
        await api.put(`/api/Caixa/${caixaAberto.value.id}`, caixaAtualizado);

        // Atualizar referência local
        caixaAberto.value.saldoFinal = novoSaldo;

        // Esconder loading
        hideLoading();

        // Mostrar sucesso
        await showSuccess(
          "Saída registrada com sucesso!",
          `Despesa de R$ ${valorNum.toFixed(2)} foi registrada.`
        );

        // Resetar formulário
        resetForm();
      } catch (error) {
        console.error("Erro ao registrar saída:", error);
        hideLoading();

        // Mostrar erro específico baseado na resposta
        let errorMessage = "Erro ao registrar saída.";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        await showError("Erro", errorMessage);
      } finally {
        isLoading.value = false;
      }
    };

    return {
      form,
      errors,
      isLoading,
      isFormValid,
      validateField,
      clearFieldError,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.header {
  margin-bottom: 2rem;
  text-align: center;
}

.icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background-color: #fee2e2;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.icon {
  width: 2rem;
  height: 2rem;
  color: #dc2626;
}

.title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

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
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

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

.input-error {
  border-color: #fca5a5 !important;
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1) !important;
  background-color: #fef2f2 !important;
}

.form-select {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.form-textarea {
  resize: vertical;
  min-height: 6rem;
}

.error-message {
  font-size: 0.875rem;
  color: #dc2626;
  font-weight: 500;
}

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

.submit-container {
  padding-top: 1rem;
}

.submit-button {
  width: 100%;
  background: linear-gradient(to right, #dc2626, #b91c1c);
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
  background: linear-gradient(to right, #b91c1c, #991b1b);
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

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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
