<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Consultar Caixas</h1>

    <table class="table-auto w-full border">
      <thead>
        <tr class="bg-gray-100">
          <th class="px-4 py-2 text-left">ID</th>
          <th class="px-4 py-2">Data</th>
          <th class="px-4 py-2">Responsável</th>
          <th class="px-4 py-2">Status</th>
          <th class="px-4 py-2">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="caixa in caixas" :key="caixa.id" class="border-t">
          <td class="px-4 py-2">{{ caixa.id }}</td>
          <td class="px-4 py-2">{{ caixa.data }}</td>
          <td class="px-4 py-2">{{ caixa.responsavel }}</td>
          <td class="px-4 py-2">{{ caixa.status }}</td>
          <td class="px-4 py-2">
            <button
              @click="confirmarExclusao(caixa)"
              class="text-red-600 hover:underline"
              :disabled="caixa.status !== 'Fechado'"
            >
              Excluir
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="mensagem" class="mt-4 text-green-700">
      {{ mensagem }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

interface Caixa {
  id: number;
  data: string;
  responsavel: string;
  status: string;
  agendamentos: number[];
}

export default defineComponent({
  name: "CaixaConsultaView",
  setup() {
    const caixas = ref<Caixa[]>([
      {
        id: 1,
        data: "2024-05-13",
        responsavel: "Ana",
        status: "Fechado",
        agendamentos: [101, 102],
      },
      {
        id: 2,
        data: "2024-05-14",
        responsavel: "Carlos",
        status: "Aberto",
        agendamentos: [],
      },
    ]);

    const mensagem = ref("");

    function confirmarExclusao(caixa: Caixa) {
      if (caixa.status !== "Fechado") {
        alert("Somente caixas com status 'Fechado' podem ser excluídos.");
        return;
      }

      const confirmar = window.confirm(
        `Deseja realmente excluir o caixa ID ${caixa.id}? Esta ação não pode ser desfeita.`
      );
      if (!confirmar) return;

      // Simula atualização dos agendamentos
      console.log("Agendamentos marcados como 'Excluído':", caixa.agendamentos);

      // Remove caixa
      caixas.value = caixas.value.filter((c) => c.id !== caixa.id);
      mensagem.value = `Caixa ID ${caixa.id} excluído com sucesso.`;

      setTimeout(() => (mensagem.value = ""), 4000);
    }

    return {
      caixas,
      confirmarExclusao,
      mensagem,
    };
  },
});
</script>

<style scoped>
.table-auto th,
.table-auto td {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
}
</style>
