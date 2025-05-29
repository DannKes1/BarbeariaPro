<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Editar Agendamento</h1>

    <form
      v-if="agendamento"
      @submit.prevent="salvarAlteracoes"
      class="space-y-4"
    >
      <div>
        <label>Cliente</label>
        <input v-model="agendamento.cliente" class="input" readonly />
      </div>

      <div>
        <label>Serviço</label>
        <input v-model="agendamento.servico" class="input" readonly />
      </div>

      <div>
        <label>Profissional</label>
        <select v-model="agendamento.profissional" class="input" required>
          <option disabled value="">Selecione um profissional</option>
          <option
            v-for="p in profissionaisFiltrados"
            :key="p.nome"
            :value="p.nome"
          >
            {{ p.nome }} ({{ p.especialidade }})
          </option>
        </select>
      </div>

      <div>
        <label>Data</label>
        <input type="date" v-model="agendamento.data" class="input" required />
      </div>

      <div>
        <label>Horário</label>
        <input
          type="time"
          v-model="agendamento.horario"
          class="input"
          required
        />
      </div>

      <button class="btn" type="submit">Salvar</button>
    </form>

    <p v-if="sucesso" class="text-green-600 mt-4">
      Agendamento atualizado com sucesso!
    </p>
    <p v-else-if="!agendamento" class="text-red-600">
      Agendamento não encontrado.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "AgendamentoEditarView",
  setup() {
    const route = useRoute();
    const sucesso = ref(false);

    const profissionais = ref([
      { nome: "Carlos", especialidade: "Barbeiro" },
      { nome: "Ana", especialidade: "Esteticista" },
      { nome: "Lucas", especialidade: "Barbeiro" },
    ]);

    const agendamentosMock = [
      {
        id: 1,
        cliente: "João",
        servico: "Corte Masculino",
        profissional: "Carlos",
        especialidade: "Barbeiro",
        data: "2024-06-01",
        horario: "10:00",
      },
      {
        id: 2,
        cliente: "Maria Santos",
        servico: "Limpeza de Pele",
        profissional: "Ana",
        especialidade: "Esteticista",
        data: "2024-05-16",
        horario: "09:30",
      },
    ];

    const agendamento = ref<any>(null);
    const profissionaisFiltrados = ref<any[]>([]);

    onMounted(() => {
      const id = parseInt(route.params.id as string);
      const encontrado = agendamentosMock.find((a) => a.id === id);
      if (encontrado) {
        agendamento.value = { ...encontrado };
        filtrarProfissionais(encontrado.servico);
      }
    });

    function filtrarProfissionais(servico: string) {
      if (servico === "Corte Masculino") {
        profissionaisFiltrados.value = profissionais.value.filter(
          (p) => p.especialidade === "Barbeiro"
        );
      } else if (servico === "Limpeza de Pele") {
        profissionaisFiltrados.value = profissionais.value.filter(
          (p) => p.especialidade === "Esteticista"
        );
      }
    }

    function salvarAlteracoes() {
      console.log("Atualizado:", agendamento.value);
      sucesso.value = true;
      setTimeout(() => (sucesso.value = false), 3000);
    }

    return {
      agendamento,
      sucesso,
      profissionaisFiltrados,
      salvarAlteracoes,
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
