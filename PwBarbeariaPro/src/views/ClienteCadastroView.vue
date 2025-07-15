<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Cadastrar Cliente</h1>
      <p class="form-subtitle">
        Preencha os dados do cliente para cadastro no sistema
      </p>
    </div>

    <form @submit.prevent="submitForm" class="client-form">
      
      <div class="form-section">
        <h2 class="section-title">Dados Pessoais</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nome *</label>
            <input
              v-model="cliente.nome"
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
              v-model="cliente.sobrenome"
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
              v-model="cliente.telefone"
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
              v-model="cliente.cpf"
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
            <label class="form-label">E-mail</label>
            <input
              v-model="cliente.email"
              class="form-input"
              type="email"
              :disabled="isLoading"
              placeholder="exemplo@email.com"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Data de Nascimento *</label>
            <input
              v-model="cliente.dataNascimento"
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
            {{ isLoading ? "Cadastrando..." : "Cadastrar Cliente" }}
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
  name: "ClienteCadastroView",
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

    const cliente = ref({
      nome: "",
      sobrenome: "",
      telefone: "",
      cpf: "",
      email: "",
      dataNascimento: "",
    });

    const erros = ref({
      cpf: "",
      dataNascimento: "",
      cep: "",
    });

    
    const isFormValid = computed(() => {
      return (
        cliente.value.nome.trim() &&
        cliente.value.sobrenome.trim() &&
        cliente.value.telefone.trim() &&
        cliente.value.cpf.trim() &&
        cliente.value.dataNascimento &&
        !erros.value.cpf &&
        !erros.value.dataNascimento
      );
    });

   
    function formatarTelefone() {
      let valor = cliente.value.telefone.replace(/\D/g, "");

      if (valor.length <= 11) {
        valor = valor.replace(/(\d{2})(\d)/, "($1) $2");
        valor = valor.replace(/(\d{4,5})(\d{4})$/, "$1-$2");
        cliente.value.telefone = valor;
      }
    }

    
    function formatarCPF() {
      let valor = cliente.value.cpf.replace(/\D/g, "");

      if (valor.length <= 11) {
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        cliente.value.cpf = valor;
      }

      
      if (erros.value.cpf && valor.length < 14) {
        erros.value.cpf = "";
      }
    }

    
    function formatarCEP() {
      let valor = cliente.value.cep.replace(/\D/g, "");

      if (valor.length <= 8) {
        valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
        cliente.value.cep = valor;
      }

      
      if (erros.value.cep && valor.length < 9) {
        erros.value.cep = "";
      }
    }

    
    function validarCPF() {
      const cpf = cliente.value.cpf.replace(/[\.\-]/g, "");

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
      const nascimento = new Date(cliente.value.dataNascimento);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const ajuste =
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() &&
          hoje.getDate() < nascimento.getDate());

      if (idade - (ajuste ? 1 : 0) < 16) {
        erros.value.dataNascimento = "Cliente deve ter pelo menos 16 anos.";
        return false;
      }

      erros.value.dataNascimento = "";
      return true;
    }

    
    async function buscarCEP() {
      const cep = cliente.value.cep.replace(/\D/g, "");

      if (cep.length !== 8) {
        if (cep.length > 0) {
          erros.value.cep = "CEP deve conter 8 dígitos.";
        }
        return;
      }

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
          erros.value.cep = "CEP não encontrado.";
          return;
        }

       
        cliente.value.endereco = `${data.logradouro}, ${data.bairro}`;
        cliente.value.cidade = data.localidade;
        cliente.value.estado = data.uf;
        erros.value.cep = "";

        showToast.success(
          "CEP encontrado! Endereço preenchido automaticamente."
        );
      } catch (error) {
        erros.value.cep = "Erro ao buscar CEP.";
      }
    }

    
    async function submitForm() {
    
      if (!isFormValid.value) {
        showError(
          "Formulário incompleto",
          "Por favor, preencha todos os campos obrigatórios corretamente."
        );
        return;
      }

     
      const confirmed = await confirmAction(
        "Confirmar cadastro",
        `Deseja cadastrar o cliente ${cliente.value.nome} ${cliente.value.sobrenome}?`,
        "Sim, cadastrar"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Cadastrando cliente...");

      try {
        
        const payload = {
          id: 0,
          nome: cliente.value.nome.trim(),
          sobrenome: cliente.value.sobrenome.trim(),
          telefone: cliente.value.telefone,
          cpf: cliente.value.cpf.replace(/[\.\-]/g, ""),
          email: cliente.value.email.trim() || null,
          dataNascimento: cliente.value.dataNascimento,
        };

        
        await api.post("/api/Cliente", payload);

        hideLoading();

        showSuccess(
          "Cliente cadastrado!",
          `${cliente.value.nome} ${cliente.value.sobrenome} foi cadastrado com sucesso.`
        );

        limparFormulario();
        showToast.success("Cliente cadastrado com sucesso!");

        
        router.push("/cliente/consulta");
      } catch (error: any) {
        hideLoading();

        if (error.response?.status === 409) {
          showError(
            "CPF duplicado",
            "Já existe um cliente cadastrado com esse CPF."
          );
        } else if (error.response?.status === 400) {
          const errosAPI =
            error.response.data?.errors || error.response.data?.message;
          showError(
            "Erro de validação",
            typeof errosAPI === "string"
              ? errosAPI
              : JSON.stringify(errosAPI, null, 2)
          );
        } else {
          showError(
            "Erro no servidor",
            "Ocorreu um erro ao cadastrar o cliente. Tente novamente."
          );
        }
      } finally {
        isLoading.value = false;
      }
    }

    
    function limparFormulario() {
      Object.assign(cliente.value, {
        nome: "",
        sobrenome: "",
        telefone: "",
        cpf: "",
        email: "",
        dataNascimento: "",
        endereco: "",
        cep: "",
        cidade: "",
        estado: "",
        observacoes: "",
        comoConheceu: "",
      });

      erros.value = {
        cpf: "",
        dataNascimento: "",
        cep: "",
      };

      showToast.info("Formulário limpo");
    }

    onMounted(() => {
      feather.replace();
    });

    return {
      cliente,
      erros,
      isLoading,
      isFormValid,
      formatarTelefone,
      formatarCPF,
      formatarCEP,
      validarCPF,
      validarIdade,
      buscarCEP,
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
