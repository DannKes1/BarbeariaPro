<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Consultar Serviços</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <input
        v-model="filtro.nome"
        type="text"
        placeholder="Buscar por nome"
        class="input"
      />
      <input
        v-model.number="filtro.precoMin"
        type="number"
        placeholder="Preço mínimo (R$)"
        class="input"
      />
      <input
        v-model.number="filtro.precoMax"
        type="number"
        placeholder="Preço máximo (R$)"
        class="input"
      />
    </div>

    <div v-if="servicosFiltrados.length">
      <table class="min-w-full border text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-4 py-2">Serviço</th>
            <th class="border px-4 py-2">Descrição</th>
            <th class="border px-4 py-2">Preço</th>
            <th class="border px-4 py-2">Duração</th>
            <th class="border px-4 py-2">Profissionais</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="servico in servicosFiltrados" :key="servico.nome">
            <td class="border px-4 py-2">{{ servico.nome }}</td>
            <td class="border px-4 py-2">{{ servico.descricao }}</td>
            <td class="border px-4 py-2">R$ {{ servico.preco.toFixed(2) }}</td>
            <td class="border px-4 py-2">{{ servico.duracao }} min</td>
            <td class="border px-4 py-2 align-top">
              <div class="flex flex-col gap-2">
                <ul class="list-disc list-inside">
                  <li v-for="p in servico.profissionais" :key="p.nome">
                    {{ p.nome }} ({{ p.especialidade }})
                  </li>
                </ul>
                <div class="flex gap-2 mt-1">
                  <router-link
                    :to="`/servico/editar/${servico.nome}`"
                    class="btn text-sm"
                  >
                    Editar
                  </router-link>
                  <button
                    class="btn-danger text-sm"
                    @click="excluirServico(servico)"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-gray-600 mt-4">Nenhum serviço encontrado.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import feather from "feather-icons";

export default defineComponent({
  name: "ServicoConsultaView",
  setup() {
    const filtro = ref({
      nome: "",
      precoMin: 0,
      precoMax: 0,
    });

    const servicos = ref([
      {
        nome: "Corte Masculino",
        descricao: "Corte tradicional com tesoura e máquina.",
        preco: 35,
        duracao: 30,
        inativo: false,
        profissionais: [
          { nome: "Lucas", especialidade: "Barbeiro" },
          { nome: "João", especialidade: "Barbeiro" },
        ],
      },
      {
        nome: "Limpeza de Pele",
        descricao: "Procedimento estético para remover impurezas.",
        preco: 75,
        duracao: 45,
        inativo: false,
        profissionais: [{ nome: "Ana", especialidade: "Esteticista" }],
      },
      {
        nome: "Corte + Barba",
        descricao: "Combo completo para sair renovado.",
        preco: 60,
        duracao: 45,
        inativo: false,
        profissionais: [{ nome: "Carlos", especialidade: "Barbeiro" }],
      },
    ]);

    const servicosFiltrados = computed(() => {
      const nomeFiltro = filtro.value.nome.toLowerCase();
      return servicos.value.filter((s) => {
        if (s.inativo) return false;

        const precoValido =
          (!filtro.value.precoMin || s.preco >= filtro.value.precoMin) &&
          (!filtro.value.precoMax || s.preco <= filtro.value.precoMax);

        const nomeValido = s.nome.toLowerCase().includes(nomeFiltro);

        return nomeValido && precoValido;
      });
    });

    function excluirServico(servico: any) {
      const confirmado = window.confirm(
        `Tem certeza que deseja excluir o serviço "${servico.nome}"?`
      );

      if (!confirmado) return;

      
      const temAgendamentosFuturos = false;

      if (temAgendamentosFuturos) {
        alert(
          "Não é possível excluir este serviço porque há agendamentos futuros."
        );
        return;
      }

      servico.inativo = true;
      console.log(`Serviço "${servico.nome}" marcado como inativo.`);
    }

    onMounted(() => {
      feather.replace();
    });

    return {
      filtro,
      servicos,
      servicosFiltrados,
      excluirServico,
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
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  display: inline-block;
  text-align: center;
  cursor: pointer;
  margin: 0; 
}

.btn-danger {
  background-color: #dc2626;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  display: inline-block;
  text-align: center;
  cursor: pointer;
  margin: 0; 
}
</style>
