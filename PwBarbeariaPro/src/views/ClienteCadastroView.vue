<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Cadastrar Cliente</h1>

    <div
      v-if="cookieInfo.hasLastValues"
      class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md"
    >
      <div class="flex items-center">
        <svg
          class="w-4 h-4 text-blue-500 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm text-blue-700">
          Alguns campos foram preenchidos com valores anteriores.
          <button
            @click="clearRememberedValues"
            class="text-blue-600 underline ml-1"
          >
            Limpar valores salvos
          </button>
        </span>
      </div>
    </div>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label>Nome</label>
        <input
          v-model="cliente.nome"
          class="input"
          required
          pattern="[A-Za-zÀ-ü ]+"
          :disabled="isLoading"
          @blur="rememberFieldValue('nome')"
        />
        <small v-if="hasRememberedValue('nome')" class="text-gray-500">
          💾 Valor lembrado dos últimos dados inseridos
        </small>
      </div>

      <div>
        <label>Sobrenome</label>
        <input
          v-model="cliente.sobrenome"
          class="input"
          required
          pattern="[A-Za-zÀ-ü ]+"
          :disabled="isLoading"
          @blur="rememberFieldValue('sobrenome')"
        />
        <small v-if="hasRememberedValue('sobrenome')" class="text-gray-500">
          💾 Valor lembrado dos últimos dados inseridos
        </small>
      </div>

      <div>
        <label>Telefone</label>
        <input
          v-model="cliente.telefone"
          class="input"
          required
          pattern="\\(\\d{2}\\) \\d{5}-\\d{4}"
          placeholder="(11) 98765-4321"
          :disabled="isLoading"
          @blur="rememberFieldValue('telefone')"
        />
        <small v-if="hasRememberedValue('telefone')" class="text-gray-500">
          💾 Valor lembrado dos últimos dados inseridos
        </small>
      </div>

      <div>
        <label>CPF</label>
        <input
          v-model="cliente.cpf"
          class="input"
          required
          pattern="\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}"
          @blur="validarCPF"
          :disabled="isLoading"
        />
        <p v-if="erros.cpf" class="text-red-500 text-sm">{{ erros.cpf }}</p>
      </div>

      <div>
        <label>E-mail</label>
        <input
          v-model="cliente.email"
          class="input"
          type="email"
          :disabled="isLoading"
          @blur="rememberFieldValue('email')"
        />
        <small v-if="hasRememberedValue('email')" class="text-gray-500">
          💾 Valor lembrado dos últimos dados inseridos
        </small>
      </div>

      <div>
        <label>Data de Nascimento</label>
        <input
          v-model="cliente.dataNascimento"
          class="input"
          required
          type="date"
          @change="validarIdade"
          :disabled="isLoading"
        />
        <p v-if="erros.dataNascimento" class="text-red-500 text-sm">
          {{ erros.dataNascimento }}
        </p>
      </div>

      <div class="flex gap-2">
        <button class="btn" type="submit" :disabled="isLoading">
          <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          {{ isLoading ? "Cadastrando..." : "Cadastrar" }}
        </button>

        <button
          type="button"
          class="btn-secondary"
          @click="limparFormulario"
          :disabled="isLoading"
        >
          Limpar
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { useFormCookies } from "@/composables/useFormCookies";
import feather from "feather-icons";

export default defineComponent({
  name: "ClienteCadastroView",
  setup() {
    const {
      showToast,
      showError,
      showSuccess,
      showLoading,
      hideLoading,
      confirmAction,
    } = useSweetAlert();

    const isLoading = ref(false);
    const showDebugInfo = ref(false);

    const cliente = ref({
      nome: "",
      sobrenome: "",
      telefone: "",
      cpf: "",
      email: "",
      dataNascimento: "",
      historico: [],
    });

    const erros = ref({ cpf: "", dataNascimento: "" });

    const {
      canUseCookies,
      lastValues,
      saveLastValues,
      loadLastValues,
      clearFormCookies,
      getCookieInfo,
      rememberValue,
      getRememberedValue,
      hasRememberedValue,
    } = useFormCookies(cliente.value, {
      formKey: "cliente_cadastro",
      rememberFields: ["nome", "sobrenome", "telefone", "email"],
      expirationDays: 30,
    });

    const cookieInfo = computed(() => getCookieInfo());

    function validarCPF() {
      const cpf = cliente.value.cpf.replace(/[\\.\\-]/g, "");
      if (!/\\d{11}/.test(cpf) || cpf === cpf[0].repeat(11)) {
        erros.value.cpf = "CPF inválido.";
        return false;
      }
      let soma = 0,
        resto;
      for (let i = 1; i <= 9; i++)
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf[9])) {
        erros.value.cpf = "CPF inválido.";
        return false;
      }
      soma = 0;
      for (let i = 1; i <= 10; i++)
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
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
      const idade = hoje.getFullYear() - nascimento.getFullYear();
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

    function rememberFieldValue(field: string) {
      if (cliente.value[field as keyof typeof cliente.value]) {
        rememberValue(
          field,
          cliente.value[field as keyof typeof cliente.value]
        );
      }
    }

    function clearRememberedValues() {
      clearFormCookies();
      showToast.info("Valores salvos foram limpos");
    }

    async function submitForm() {
      if (!cliente.value.nome.trim()) {
        showError("Campo obrigatório", "Por favor, informe o nome do cliente.");
        return;
      }

      if (!cliente.value.sobrenome.trim()) {
        showError(
          "Campo obrigatório",
          "Por favor, informe o sobrenome do cliente."
        );
        return;
      }

      if (!cliente.value.telefone.trim()) {
        showError(
          "Campo obrigatório",
          "Por favor, informe o telefone do cliente."
        );
        return;
      }

      if (!cliente.value.cpf.trim()) {
        showError("Campo obrigatório", "Por favor, informe o CPF do cliente.");
        return;
      }

      if (!cliente.value.dataNascimento) {
        showError(
          "Campo obrigatório",
          "Por favor, informe a data de nascimento."
        );
        return;
      }

      if (!validarCPF() || !validarIdade()) {
        showError(
          "Dados inválidos",
          "Por favor, corrija os erros no formulário."
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
        saveLastValues();

        await new Promise((resolve) => setTimeout(resolve, 2000));

        hideLoading();

        showSuccess(
          "Cliente cadastrado!",
          `${cliente.value.nome} ${cliente.value.sobrenome} foi cadastrado com sucesso.`,
          "Continuar"
        );

        limparFormulario();

        showToast.success("Cliente cadastrado com sucesso!");
      } catch (error) {
        hideLoading();
        showError(
          "Erro no servidor",
          "Ocorreu um erro ao cadastrar o cliente. Tente novamente."
        );
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
        historico: [],
      });

      erros.value = { cpf: "", dataNascimento: "" };

      showToast.info("Formulário limpo");
    }

    onMounted(() => {
      feather.replace();
    });

    return {
      cliente,
      erros,
      isLoading,
      showDebugInfo,
      cookieInfo,
      validarCPF,
      validarIdade,
      submitForm,
      limparFormulario,
      rememberFieldValue,
      clearRememberedValues,
      hasRememberedValue,
      canUseCookies,
    };
  },
});
</script>

<style scoped>
.input {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
  width: 100%;
}
.btn {
  background-color: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  margin: 0 10px;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background-color: #6b7280;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
