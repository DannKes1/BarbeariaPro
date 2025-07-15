<template>
  <div class="page-container">
    <div>
      <div class="header">
        <div class="icon-container">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h12" />
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
                <span v-if="errors.descricao" class="error-message">{{ errors.descricao }}</span>
                <span class="char-counter">{{ form.descricao.length }}/100</span>
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
              <span v-if="errors.valor" class="error-message">{{ errors.valor }}</span>
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
              <span v-if="errors.categoria" class="error-message">{{ errors.categoria }}</span>
            </div>

            <div class="form-group">
              <label for="observacoes" class="form-label">Observações <span class="optional-label">(opcional)</span></label>
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
                <span class="char-counter">{{ form.observacoes.length }}/500</span>
              </div>
            </div>

            <div class="submit-container">
              <button
                type="submit"
                class="submit-button"
                :disabled="isLoading || !isFormValid"
              >
                <div v-if="isLoading" class="button-content">
                  Registrando...
                </div>
                <div v-else class="button-content">
                  Registrar Saída
                </div>
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
    const { showSuccess, showError, showLoading, hideLoading } = useSweetAlert();
    const router = useRouter();

    const isLoading = ref(false);
    const caixaAberto = ref<any>(null);

    const form = reactive({
      descricao: "",
      valor: "",
      categoria: "",
      observacoes: ""
    });

    const errors = reactive<Record<string, string>>({});

    const validateField = (field: string): boolean => {
      switch (field) {
        case "descricao":
          if (!form.descricao.trim()) return (errors.descricao = "Descrição obrigatória"), false;
          if (form.descricao.length < 3) return (errors.descricao = "Mínimo 3 caracteres"), false;
          delete errors.descricao;
          return true;
        case "valor":
          const valor = parseFloat(form.valor);
          if (!form.valor) return (errors.valor = "Valor obrigatório"), false;
          if (isNaN(valor) || valor <= 0) return (errors.valor = "Valor deve ser maior que zero"), false;
          if (valor > 999999.99) return (errors.valor = "Valor máximo R$ 999.999,99"), false;
          delete errors.valor;
          return true;
        case "categoria":
          if (!form.categoria) return (errors.categoria = "Categoria obrigatória"), false;
          delete errors.categoria;
          return true;
        default:
          return true;
      }
    };

    const clearFieldError = (field: string): void => {
      delete errors[field];
    };

    const isFormValid = computed(() =>
      ["descricao", "valor", "categoria"].every(validateField)
    );

    onMounted(async () => {
      try {
        const res = await api.get("/api/Caixa/ultimo");
        if (res.data?.status === "Aberto") {
          caixaAberto.value = res.data;
        } else {
          showError("Caixa Fechado", "Abra o caixa antes de registrar uma saída.");
          setTimeout(() => {
            router.push({ path: "/caixa/abrir" });
          }, 2000);
        }
      } catch {
        showError("Erro", "Não foi possível carregar o caixa.");
      }
    });

    const handleSubmit = async () => {
      if (!isFormValid.value) {
        showError("Formulário inválido", "Preencha todos os campos corretamente.");
        return;
      }

      const valorNum = parseFloat(form.valor);

      showLoading("Registrando saída...");
      try {
        await api.post("/api/MovimentacaoCaixa", {
          id: Math.floor(Math.random() * 1000000),
          tipo: "Saída",
          valor: valorNum,
          categoria: form.categoria,
          descricao: `${form.descricao}`,
          comprovantePath: "",
          caixaFk: caixaAberto.value.id
        });

        const novoSaldo = caixaAberto.value.saldoFinal - valorNum;
        await api.put(`/api/Caixa/${caixaAberto.value.id}`, {
          ...caixaAberto.value,
          saldoFinal: novoSaldo
        });

        showSuccess("Saída registrada", `Despesa de R$ ${valorNum.toFixed(2)} registrada com sucesso.`);
        Object.assign(form, {
          descricao: "",
          valor: "",
          categoria: "",
          observacoes: ""
        });
      } catch (err) {
        console.error(err);
        showError("Erro", "Erro ao registrar saída.");
      } finally {
        hideLoading();
      }
    };

    return {
      form,
      errors,
      isLoading,
      isFormValid,
      validateField,
      clearFieldError,
      handleSubmit
    };
  }
});
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
.header {
  margin-bottom: 1.5rem;
}
.icon-container {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}
.icon {
  width: 1.75rem;
  height: 1.75rem;
  color: #dc2626;
}
.title {
  font-size: 1.75rem;
  font-weight: bold;
}
.subtitle {
  font-size: 1rem;
  color: #6b7280;
}
.form-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  padding: 2rem;
}
.form-group {
  margin-bottom: 1.25rem;
}
.input-container {
  position: relative;
}
.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}
.input-with-prefix {
  padding-left: 2.5rem;
}
.currency-prefix {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  color: #6b7280;
}
.input-error {
  border-color: #dc2626;
}
.error-message {
  color: #dc2626;
  font-size: 0.875rem;
}
.char-counter {
  float: right;
  font-size: 0.8rem;
  color: #9ca3af;
}
.optional-label {
  color: #9ca3af;
}
.submit-button {
  background-color: #dc2626;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
  width: 100%;
}
.submit-button:disabled {
  opacity: 0.6;
}
.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
}
.loading-spinner {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
