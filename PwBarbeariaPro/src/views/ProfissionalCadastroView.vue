<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Cadastrar Profissional</h1>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label>Nome</label>
        <input
          v-model="profissional.nome"
          class="input"
          required
          pattern="[A-Za-zÀ-ü ]+"
          :disabled="isLoading"
        />
      </div>

      <div>
        <label>Sobrenome</label>
        <input
          v-model="profissional.sobrenome"
          class="input"
          required
          pattern="[A-Za-zÀ-ü ]+"
          :disabled="isLoading"
        />
      </div>

      <div>
        <label>Telefone</label>
        <input
          v-model="profissional.telefone"
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
          v-model="profissional.cpf"
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
          v-model="profissional.email"
          class="input"
          type="email"
          required
          :disabled="isLoading"
        />
      </div>

      <div>
        <label>Data de Nascimento</label>
        <input
          v-model="profissional.dataNascimento"
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

      <div>
        <label>Especialidade</label>
        <select
          v-model="profissional.especialidade"
          class="input"
          required
          :disabled="isLoading"
        >
          <option value="">Selecione uma especialidade</option>
          <option value="Cabeleireiro">Cabeleireiro</option>
          <option value="Barbeiro">Barbeiro</option>
          <option value="Esteticista">Esteticista</option>
          <option value="Manicure">Manicure</option>
          <option value="Pedicure">Pedicure</option>
        </select>
      </div>

      <div>
        <label>Salário (R$)</label>
        <input
          v-model="profissional.salario"
          class="input"
          type="number"
          min="0"
          step="0.01"
          placeholder="0,00"
          :disabled="isLoading"
        />
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
  name: "ProfissionalCadastroView",
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

    function validarCPF() {
      const cpf = profissional.value.cpf.replace(/[\\.\\-]/g, "");
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
      const nascimento = new Date(profissional.value.dataNascimento);
      const idade = hoje.getFullYear() - nascimento.getFullYear();
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
      // Validar campos obrigatórios
      if (!profissional.value.nome.trim()) {
        showError(
          "Campo obrigatório",
          "Por favor, informe o nome do profissional."
        );
        return;
      }

      if (!profissional.value.email.trim()) {
        showError(
          "Campo obrigatório",
          "Por favor, informe o email do profissional."
        );
        return;
      }

      if (!profissional.value.especialidade) {
        showError(
          "Campo obrigatório",
          "Por favor, selecione uma especialidade."
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
        `Deseja cadastrar o profissional ${profissional.value.nome} ${profissional.value.sobrenome} como ${profissional.value.especialidade}?`,
        "Sim, cadastrar"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Cadastrando profissional...");

      try {
        // Simular chamada de API
        await new Promise((resolve) => setTimeout(resolve, 2500));

        hideLoading();

        // Mostrar sucesso
        showSuccess(
          "Profissional cadastrado!",
          `${profissional.value.nome} ${profissional.value.sobrenome} foi cadastrado como ${profissional.value.especialidade}.`,
          "Continuar"
        );

        // Limpar formulário
        limparFormulario();

        // Toast de confirmação
        showToast.success("Profissional cadastrado com sucesso!");
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
