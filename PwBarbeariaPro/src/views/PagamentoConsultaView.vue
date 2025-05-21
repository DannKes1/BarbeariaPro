<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Consultar Pagamentos</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <input
        v-model="filtros.cliente"
        class="input"
        placeholder="Filtrar por Cliente"
      />
      <input
        v-model="filtros.data"
        class="input"
        type="date"
        placeholder="Data"
      />
      <select v-model="filtros.status" class="input">
        <option value="">Todos os Status</option>
        <option value="Efetuado">Efetuado</option>
        <option value="Pendente">Pendente</option>
        <option value="Estornado">Estornado</option>
      </select>
    </div>

    <div v-if="pagamentosFiltrados.length">
      <table class="min-w-full border text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-4 py-2">Cliente</th>
            <th class="border px-4 py-2">Serviço</th>
            <th class="border px-4 py-2">Forma de Pagamento</th>
            <th class="border px-4 py-2">Valor</th>
            <th class="border px-4 py-2">Status</th>
            <th class="border px-4 py-2">Data</th>
            <th class="border px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pagamento in pagamentosFiltrados" :key="pagamento.id">
            <td class="border px-4 py-2">{{ pagamento.cliente }}</td>
            <td class="border px-4 py-2">{{ pagamento.servico }}</td>
            <td class="border px-4 py-2">{{ pagamento.forma }}</td>
            <td class="border px-4 py-2">R$ {{ pagamento.valor }}</td>
            <td class="border px-4 py-2">{{ pagamento.status }}</td>
            <td class="border px-4 py-2">{{ pagamento.data }}</td>
            <td class="border px-4 py-2">
              <router-link
                :to="`/pagamento/editar/${pagamento.id}`"
                class="btn mr-2"
                >Editar</router-link
              >
              <button class="btn-danger" @click="excluir(pagamento)">
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="text-gray-600 mt-4">Nenhum pagamento encontrado.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";

export default defineComponent({
  name: "PagamentoConsultaView",
  setup() {
    const pagamentos = ref([
      {
        id: 1,
        cliente: "João Silva",
        servico: "Corte Masculino",
        forma: "Cartão",
        valor: "35,00",
        status: "Efetuado",
        data: "2024-05-15",
      },
      {
        id: 2,
        cliente: "Maria Santos",
        servico: "Limpeza de Pele",
        forma: "PIX",
        valor: "75,00",
        status: "Pendente",
        data: "2024-05-16",
      },
    ]);

    const filtros = ref({ cliente: "", data: "", status: "" });

    const pagamentosFiltrados = computed(() => {
      return pagamentos.value.filter((p) => {
        return (
          (!filtros.value.cliente ||
            p.cliente
              .toLowerCase()
              .includes(filtros.value.cliente.toLowerCase())) &&
          (!filtros.value.data || p.data === filtros.value.data) &&
          (!filtros.value.status || p.status === filtros.value.status)
        );
      });
    });

    function excluir(pagamento: any) {
      if (pagamento.status !== "Pendente") {
        alert('Apenas pagamentos com status "Pendente" podem ser excluídos.');
        return;
      }
      const confirmado = confirm(
        `Deseja realmente excluir o pagamento de ${pagamento.cliente}?`
      );
      if (confirmado) {
        pagamentos.value = pagamentos.value.filter(
          (p) => p.id !== pagamento.id
        );
      }
    }

    return {
      pagamentosFiltrados,
      filtros,
      excluir,
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
}
.btn-danger {
  background-color: #dc2626;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
}
</style>
