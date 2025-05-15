<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Editar Serviço</h1>
    <form @submit.prevent="submitForm" class="space-y-4" v-if="servico">
      <div>
        <label>Nome do Serviço</label>
        <input v-model="servico.nome" class="input" :readonly="bloquearNome" />
        <p v-if="bloquearNome" class="text-sm text-gray-500">
          O nome não pode ser alterado porque há agendamentos vinculados.
        </p>
        <p v-if="erros.nome" class="text-red-500 text-sm">{{ erros.nome }}</p>
      </div>

      <div>
        <label>Descrição</label>
        <textarea v-model="servico.descricao" class="input" required></textarea>
        <p v-if="erros.descricao" class="text-red-500 text-sm">
          {{ erros.descricao }}
        </p>
      </div>

      <div>
        <label>Preço</label>
        <input
          v-model="servico.preco"
          class="input"
          required
          placeholder="R$ 00,00"
          @input="formatarPreco"
        />
        <p v-if="erros.preco" class="text-red-500 text-sm">{{ erros.preco }}</p>
      </div>

      <div>
        <label>Duração Estimada (minutos)</label>
        <input
          v-model="servico.duracao"
          class="input"
          required
          type="number"
          min="1"
        />
        <p v-if="erros.duracao" class="text-red-500 text-sm">
          {{ erros.duracao }}
        </p>
      </div>

      <button class="btn" type="submit">Salvar Alterações</button>
    </form>

    <p v-if="sucesso" class="text-green-600 mt-4">
      Serviço atualizado com sucesso!
    </p>
    <p v-else-if="!servico" class="text-red-600 text-center">
      Serviço não encontrado.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import feather from "feather-icons";

export default defineComponent({
  name: "ServicoEditarView",
  setup() {
    const route = useRoute();
    const sucesso = ref(false);
    const bloquearNome = ref(false);
    const erros = ref({ nome: "", descricao: "", preco: "", duracao: "" });

    const servicosMock = [
      {
        nome: "Corte Masculino",
        descricao: "Corte tradicional com tesoura e máquina.",
        preco: "R$ 35,00",
        duracao: 30,
        possuiAgendamento: true,
      },
      {
        nome: "Limpeza de Pele",
        descricao: "Procedimento estético para remover impurezas.",
        preco: "R$ 75,00",
        duracao: 45,
        possuiAgendamento: false,
      },
    ];

    const servico = ref<any>(null);

    onMounted(() => {
      const nomeParam = route.params.nome;
      const encontrado = servicosMock.find((s) => s.nome === nomeParam);
      if (encontrado) {
        servico.value = { ...encontrado };
        bloquearNome.value = encontrado.possuiAgendamento;
      }
      feather.replace();
    });

    function formatarPreco() {
      let valor = servico.value.preco.replace(/[^\d]/g, "");
      if (valor.length < 3) valor = valor.padStart(3, "0");
      const reais = valor.slice(0, valor.length - 2);
      const centavos = valor.slice(-2);
      servico.value.preco = `R$ ${reais},${centavos}`;
    }

    function validar() {
      let valido = true;
      erros.value = { nome: "", descricao: "", preco: "", duracao: "" };

      if (!servico.value.descricao || servico.value.descricao.length < 20) {
        erros.value.descricao = "Descrição deve ter pelo menos 20 caracteres.";
        valido = false;
      }

      if (!/^R\$ \d+,\d{2}$/.test(servico.value.preco)) {
        erros.value.preco = "Preço no formato R$ 00,00.";
        valido = false;
      }

      const duracao = parseInt(servico.value.duracao);
      if (!Number.isInteger(duracao) || duracao <= 0) {
        erros.value.duracao = "Duração deve ser um número positivo.";
        valido = false;
      }

      return valido;
    }

    function submitForm() {
      if (validar()) {
        console.log("Serviço atualizado:", servico.value);
        sucesso.value = true;
        setTimeout(() => (sucesso.value = false), 3000);
      }
    }

    return {
      servico,
      erros,
      sucesso,
      bloquearNome,
      submitForm,
      formatarPreco,
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
