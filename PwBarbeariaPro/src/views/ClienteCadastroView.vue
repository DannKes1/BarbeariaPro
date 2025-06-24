<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Cadastrar Cliente</h1>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label>Nome</label>
        <input
          v-model="cliente.nome"
          class="input"
          required
          pattern="[A-Za-zÀ-ü ]+"
          :disabled="isLoading"
        />
      </div>

      <div>
        <label>Sobrenome</label>
        <input
          v-model="cliente.sobrenome"
          class="input"
          required
          pattern="[A-Za-zÀ-ü ]+"
          :disabled="isLoading"
        />
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
        />
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
        />
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
import { defineComponent, ref, onMounted } from "vue";
import { useSweetAlert } from "@/composables/useSweetAlert";
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

    async function submitForm() {
      // Validar campos obrigatórios
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

      // Validar CPF e idade
      if (!validarCPF() || !validarIdade()) {
        showError(
          "Dados inválidos",
          "Por favor, corrija os erros no formulário."
        );
        return;
      }

      // Confirmar cadastro
      const confirmed = await confirmAction(
        "Confirmar cadastro",
        `Deseja cadastrar o cliente ${cliente.value.nome} ${cliente.value.sobrenome}?`,
        "Sim, cadastrar"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Cadastrando cliente...");

      try {
        // Simular chamada de API
        await new Promise((resolve) => setTimeout(resolve, 2000));

        hideLoading();

        // Mostrar sucesso
        showSuccess(
          "Cliente cadastrado!",
          `${cliente.value.nome} ${cliente.value.sobrenome} foi cadastrado com sucesso.`,
          "Continuar"
        );

        // Limpar formulário
        limparFormulario();

        // Toast de confirmação
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
      validarCPF,
      validarIdade,
      submitForm,
      limparFormulario,
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
