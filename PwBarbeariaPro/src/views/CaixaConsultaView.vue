<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Consulta de Caixa</h1>

    <div class="filters mb-4">
      <input v-model="filtros.data" type="date" class="input mr-2" />
      <select v-model="filtros.tipo" class="input mr-2">
        <option value="">Todos os tipos</option>
        <option value="entrada">Entradas</option>
        <option value="saida">Saídas</option>
      </select>
      <button class="btn" @click="exportarRelatorio">📊 Exportar</button>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full border">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-4 py-2">Data/Hora</th>
            <th class="border px-4 py-2">Tipo</th>
            <th class="border px-4 py-2">Descrição</th>
            <th class="border px-4 py-2">Valor</th>
            <th class="border px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movimento in movimentosFiltrados" :key="movimento.id">
            <td class="border px-4 py-2">
              {{ formatarDataHora(movimento.dataHora) }}
            </td>
            <td class="border px-4 py-2">
              <span
                :class="
                  movimento.tipo === 'entrada'
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                {{ movimento.tipo === "entrada" ? "↗️ Entrada" : "↙️ Saída" }}
              </span>
            </td>
            <td class="border px-4 py-2">{{ movimento.descricao }}</td>
            <td class="border px-4 py-2">R$ {{ movimento.valor }}</td>
            <td class="border px-4 py-2">
              <button class="btn-sm" @click="verDetalhes(movimento)">👁️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useSweetAlert } from "@/composables/useSweetAlert";

export default defineComponent({
  name: "CaixaConsultaView",
  setup() {
    const { showSuccess, Swal } = useSweetAlert();

    const filtros = ref({ data: "", tipo: "" });

    const movimentos = ref([
      {
        id: 1,
        dataHora: "2024-01-15T09:00:00",
        tipo: "entrada",
        descricao: "Abertura de caixa",
        valor: "100.00",
      },
      {
        id: 2,
        dataHora: "2024-01-15T14:30:00",
        tipo: "entrada",
        descricao: "Pagamento - João Silva",
        valor: "25.00",
      },
      {
        id: 3,
        dataHora: "2024-01-15T16:00:00",
        tipo: "saida",
        descricao: "Compra de produtos",
        valor: "50.00",
      },
    ]);

    const movimentosFiltrados = computed(() => {
      return movimentos.value.filter((m) => {
        const dataMatch =
          !filtros.value.data || m.dataHora.includes(filtros.value.data);
        const tipoMatch = !filtros.value.tipo || m.tipo === filtros.value.tipo;
        return dataMatch && tipoMatch;
      });
    });

    function formatarDataHora(dataISO: string) {
      return new Date(dataISO).toLocaleString("pt-BR");
    }

    async function verDetalhes(movimento: any) {
      await Swal.fire({
        title: "Detalhes do Movimento",
        html: `
          <div class="text-left">
            <p><strong>Data/Hora:</strong> ${formatarDataHora(movimento.dataHora)}</p>
            <p><strong>Tipo:</strong> ${movimento.tipo}</p>
            <p><strong>Descrição:</strong> ${movimento.descricao}</p>
            <p><strong>Valor:</strong> R$ ${movimento.valor}</p>
          </div>
        `,
        confirmButtonText: "Fechar",
      });
    }

    async function exportarRelatorio() {
      showSuccess(
        "Relatório exportado!",
        "O relatório foi gerado com sucesso."
      );
    }

    return {
      filtros,
      movimentosFiltrados,
      formatarDataHora,
      verDetalhes,
      exportarRelatorio,
    };
  },
});
</script>
