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
    </div>

    <div v-if="servicosFiltrados.length">
      <table class="min-w-full border text-sm w-100">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-4 py-2">Serviço</th>
            <th class="border px-4 py-2">Descrição</th>
            <th class="border px-4 py-2">Preço</th>
            <th class="border px-4 py-2">Duração</th>
            <th class="border px-4 py-2">Categoria</th>
            <th class="border px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="servico in servicosFiltrados" :key="servico.id">
            <td class="border px-4 py-2">{{ servico.nome }}</td>
            <td class="border px-4 py-2">{{ servico.descricao }}</td>
            <td class="border px-4 py-2">R$ {{ servico.valor.toFixed(2) }}</td>
            <td class="border px-4 py-2">{{ servico.duracaoMinutos }} min</td>
            <td class="border px-4 py-2">{{ servico.categoria }}</td>
            <td class="border px-4 py-2">
              <div class="flex gap-2">
                <router-link
                  :to="`/servico/editar/${servico.id}`"
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
import { api } from "@/common/http";
import { useSweetAlert } from "@/composables/useSweetAlert";

export default defineComponent({
  name: "ServicoConsultaView",
  setup() {
    const { showSuccess, showError } = useSweetAlert();
    const filtro = ref({ nome: "", precoMin: 0, precoMax: 0 });
    const servicos = ref<any[]>([]);

    const servicosFiltrados = computed(() => {
      const nomeFiltro = filtro.value.nome.toLowerCase();
      return servicos.value.filter((s) => {
        const precoValido =
          (!filtro.value.precoMin || s.valor >= filtro.value.precoMin) &&
          (!filtro.value.precoMax || s.valor <= filtro.value.precoMax);
        const nomeValido = s.nome.toLowerCase().includes(nomeFiltro);
        return nomeValido && precoValido;
      });
    });

    async function carregarServicos() {
      try {
        const response = await api.get("/api/Servico");
        servicos.value = response.data;
      } catch {
        showError("Erro", "Erro ao carregar serviços.");
      }
    }

    async function excluirServico(servico: any) {
      const confirmado = window.confirm(`Excluir "${servico.nome}"?`);
      if (!confirmado) return;
      try {
        await api.delete(`/api/Servico/${servico.id}`);
        servicos.value = servicos.value.filter((s) => s.id !== servico.id);
        showSuccess("Removido", `"${servico.nome}" foi excluído.`);
      } catch {
        showError("Erro", "Erro ao excluir.");
      }
    }

    onMounted(carregarServicos);

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
  text-align: center;
  cursor: pointer;
}
.btn-danger {
  background-color: #dc2626;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  text-align: center;
  cursor: pointer;
}
</style>
