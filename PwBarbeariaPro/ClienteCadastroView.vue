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
        />
      </div>

      <div>
        <label>Sobrenome</label>
        <input
          v-model="cliente.sobrenome"
          class="input"
          required
          pattern="[A-Za-zÀ-ü ]+"
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
        />
        <p v-if="erros.cpf" class="text-red-500 text-sm">{{ erros.cpf }}</p>
      </div>

      <div>
        <label>E-mail</label>
        <input v-model="cliente.email" class="input" type="email" />
      </div>

      <div>
        <label>Data de Nascimento</label>
        <input
          v-model="cliente.dataNascimento"
          class="input"
          required
          type="date"
          @change="validarIdade"
        />
        <p v-if="erros.dataNascimento" class="text-red-500 text-sm">
          {{ erros.dataNascimento }}
        </p>
      </div>

      <button class="btn" type="submit">Cadastrar</button>
    </form>
    <p v-if="sucesso" class="text-green-600 mt-4">
      Cliente cadastrado com sucesso!
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import feather from "feather-icons";

export default defineComponent({
  name: "ClienteCadastroView",
  setup() {
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
    const sucesso = ref(false);

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

    function submitForm() {
      if (validarCPF() && validarIdade()) {
        console.log("Cliente registrado:", cliente.value);
        sucesso.value = true;
        setTimeout(() => (sucesso.value = false), 3000);
        Object.assign(cliente.value, {
          nome: "",
          sobrenome: "",
          telefone: "",
          cpf: "",
          email: "",
          dataNascimento: "",
          historico: [],
        });
      }
    }

    onMounted(() => {
      feather.replace();
    });

    return { cliente, erros, sucesso, validarCPF, validarIdade, submitForm };
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
}
</style>
