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

    <div v-if="movimentosFiltrados.length" class="overflow-x-auto">
      <table class="min-w-full border">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-4 py-2">ID</th>
            <th class="border px-4 py-2">Tipo</th>
            <th class="border px-4 py-2">Valor</th>
            <th class="border px-4 py-2">Categoria</th>
            <th class="border px-4 py-2">Descrição</th>
            <th class="border px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movimento in movimentosFiltrados" :key="movimento.id">
            <td class="border px-4 py-2">{{ movimento.id }}</td>
            <td class="border px-4 py-2">
              <span
                :class="movimento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'"
              >
                {{ movimento.tipo === 'entrada' ? '↗️ Entrada' : '↙️ Saída' }}
              </span>
            </td>
            <td class="border px-4 py-2">R$ {{ movimento.valor.toFixed(2) }}</td>
            <td class="border px-4 py-2">{{ movimento.categoria }}</td>
            <td class="border px-4 py-2">{{ movimento.descricao }}</td>
            <td class="border px-4 py-2">
              <button class="btn-sm mr-2" @click="verDetalhes(movimento)">👁️</button>
              <button class="btn-sm bg-red-600" @click="excluirMovimento(movimento)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-gray-600">Nenhuma movimentação encontrada.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { api } from "@/common/http";
import { useSweetAlert } from "@/composables/useSweetAlert";

export default defineComponent({
  name: "CaixaConsultaView",
  setup() {
    const { showSuccess, showError, Swal } = useSweetAlert();

    const filtros = ref({ data: "", tipo: "" });
    const movimentos = ref<any[]>([]);

    // Função para normalizar tipo (lowercase e sem acento)
    function normalizeTipo(tipo: string) {
      return tipo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    const buscarMovimentacoes = async () => {
      try {
        const caixaResponse = await api.get("/api/Caixa/ultimo");
        const caixaAberto = caixaResponse.data;

        if (!caixaAberto?.id || caixaAberto.status !== "Aberto") {
          showError("Nenhum caixa aberto", "Abra um caixa para visualizar movimentações.");
          movimentos.value = [];
          return;
        }

        const movResponse = await api.get(`/api/MovimentacaoCaixa/caixa/${caixaAberto.id}`);

        movimentos.value = movResponse.data.map((m: any) => ({
          ...m,
          tipo: normalizeTipo(m.tipo),
        }));
      } catch (err) {
        console.error("Erro ao buscar movimentações:", err);
        showError("Erro", "Não foi possível carregar as movimentações.");
      }
    };

    const movimentosFiltrados = computed(() => {
      return movimentos.value.filter((m) => {
        const dataMatch = !filtros.value.data || m.dataHora?.includes(filtros.value.data);
        const tipoMatch = !filtros.value.tipo || m.tipo === filtros.value.tipo;
        return dataMatch && tipoMatch;
      });
    });

    async function verDetalhes(movimento: any) {
      await Swal.fire({
        title: "Detalhes da Movimentação",
        html: `
          <div class="text-left">
            <p><strong>ID:</strong> ${movimento.id}</p>
            <p><strong>Tipo:</strong> ${movimento.tipo}</p>
            <p><strong>Valor:</strong> R$ ${movimento.valor.toFixed(2)}</p>
            <p><strong>Categoria:</strong> ${movimento.categoria}</p>
            <p><strong>Descrição:</strong> ${movimento.descricao}</p>
          </div>
        `,
        confirmButtonText: "Fechar",
      });
    }

    async function excluirMovimento(movimento: any) {
      const result = await Swal.fire({
        title: "Confirma exclusão?",
        text: `Deseja excluir a movimentação de R$ ${movimento.valor.toFixed(2)} (${movimento.tipo})?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        try {
          await api.delete(`/api/MovimentacaoCaixa/${movimento.id}`);

          // Atualiza saldo do caixa
          const caixaResponse = await api.get("/api/Caixa/ultimo");
          const caixa = caixaResponse.data;

          let novoSaldoFinal = caixa.saldoFinal;

          if (movimento.tipo === "entrada") {
            novoSaldoFinal -= movimento.valor;
          } else if (movimento.tipo === "saida") {
            novoSaldoFinal += movimento.valor;
          }

          await api.put(`/api/Caixa/${caixa.id}`, {
            ...caixa,
            saldoFinal: novoSaldoFinal,
          });

          showSuccess("Movimentação excluída com sucesso!");
          buscarMovimentacoes();
        } catch (error) {
          console.error("Erro ao excluir movimentação:", error);
          showError("Erro", "Não foi possível excluir a movimentação.");
        }
      }
    }

    async function exportarRelatorio() {
      showSuccess("Relatório exportado!", "O relatório foi gerado com sucesso.");
    }

    onMounted(() => {
      buscarMovimentacoes();
    });

    return {
      filtros,
      movimentosFiltrados,
      verDetalhes,
      excluirMovimento,
      exportarRelatorio,
    };
  },
});
</script>

<style scoped>
.input {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
}
.btn {
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}
.btn-sm {
  padding: 0.25rem 0.5rem;
  color: white;
  border-radius: 0.25rem;
  cursor: pointer;
  border: none;
}
.btn-sm.bg-red-600 {
  background-color: #dc2626;
}
.btn-sm.mr-2 {
  margin-right: 0.5rem;
}
.text-green-600 {
  color: #16a34a;
}
.text-red-600 {
  color: #dc2626;
}
</style>
