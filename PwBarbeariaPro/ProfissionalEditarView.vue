<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Editar Profissional</h1>
    <form @submit.prevent="submitForm" class="space-y-4" v-if="profissional">
      <div>
        <label>Nome</label>
        <input
          v-model="profissional.nome"
          class="input"
          required
          pattern="[A-Za-zÀ-ü ]+"
        />
      </div>

      <div>
        <label>Sobrenome</label>
        <input
          v-model="profissional.sobrenome"
          class="input"
          required
          pattern="[A-Za-zÀ-ü ]+"
        />
      </div>

      <div>
        <label>Telefone</label>
        <input
          v-model="profissional.telefone"
          class="input"
          required
          pattern="\(\d{2}\) \d{5}-\d{4}"
          placeholder="(11) 98765-4321"
        />
      </div>

      <div>
        <label>CPF</label>
        <input
          v-model="profissional.cpf"
          class="input"
          required
          pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
          @blur="validarCPF"
          readonly
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
        />
        <p v-if="erros.dataNascimento" class="text-red-500 text-sm">
          {{ erros.dataNascimento }}
        </p>
      </div>

      <div>
        <label>Especialidade</label>
        <select v-model="profissional.especialidade" class="input" required>
          <option value="" disabled>Selecione uma opção</option>
          <option>Cabeleireiro</option>
          <option>Barbeiro</option>
          <option>Esteticista</option>
          <option>Depilador</option>
          <option>Massoterapeuta</option>
        </select>
      </div>

      <button class="btn" type="submit">Salvar Alterações</button>
      <p v-if="sucesso" class="text-green-600 mt-4">
        Alterações salvas com sucesso!
      </p>
    </form>
    <p v-else class="text-red-600 text-center">Profissional não encontrado.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import feather from "feather-icons";

export default defineComponent({
  name: "ProfissionalEditarView",
  setup() {
    const route = useRoute();
    const sucesso = ref(false);
    const erros = ref({ cpf: "", dataNascimento: "" });

    const profissionaisMock = [
      {
        nome: "Lucas",
        sobrenome: "Oliveira",
        telefone: "(11) 91234-5678",
        cpf: "111.222.333-44",
        email: "lucas@barber.com",
        dataNascimento: "1990-07-10",
        especialidade: "Barbeiro",
      },
      {
        nome: "Ana",
        sobrenome: "Lima",
        telefone: "(21) 99876-5432",
        cpf: "555.666.777-88",
        email: "ana@spa.com",
        dataNascimento: "1988-02-25",
        especialidade: "Esteticista",
      },
    ];

    const profissional = ref<any>(null);

    onMounted(() => {
      const cpfParam = route.params.cpf;
      profissional.value = profissionaisMock.find((p) => p.cpf === cpfParam);
      feather.replace();
    });

    function validarCPF() {
      const cpf = profissional.value.cpf.replace(/[.\-]/g, "");
      if (!/^\d{11}$/.test(cpf) || cpf === cpf[0].repeat(11)) {
        erros.value.cpf = "CPF inválido.";
        return false;
      }
      let soma = 0,
        resto;
      for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf[9])) {
        erros.value.cpf = "CPF inválido.";
        return false;
      }
      soma = 0;
      for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
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
      if (idade - (ajuste ? 1 : 0) < 16) {
        erros.value.dataNascimento =
          "Profissional deve ter pelo menos 16 anos.";
        return false;
      }
      erros.value.dataNascimento = "";
      return true;
    }

    function submitForm() {
      if (validarCPF() && validarIdade()) {
        console.log("Profissional atualizado:", profissional.value);
        sucesso.value = true;
        setTimeout(() => (sucesso.value = false), 3000);
      }
    }

    return {
      profissional,
      sucesso,
      erros,
      validarCPF,
      validarIdade,
      submitForm,
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
}
</style>
