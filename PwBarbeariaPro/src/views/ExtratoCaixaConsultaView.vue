<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Consultar Extrato de Caixa</h1>

 
    <form
      @submit.prevent="filtrarExtrato"
      class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
    >
      <div>
        <label>Data Inicial</label>
        <input type="date" v-model="filtros.dataInicio" class="input" />
      </div>
      <div>
        <label>Data Final</label>
        <input type="date" v-model="filtros.dataFim" class="input" />
      </div>
      <div>
        <label>Tipo de Movimento</label>
        <select v-model="filtros.tipo" class="input">
          <option value="">Todos</option>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
      </div>
      <div>
        <label>Responsável</label>
        <select v-model="filtros.responsavel" class="input">
          <option value="">Todos</option>
          <option v-for="p in profissionais" :key="p" :value="p">
            {{ p }}
          </option>
        </select>
      </div>
      <div class="col-span-1 md:col-span-3">
        <button class="btn" type="submit">Filtrar</button>
      </div>
    </form>

  
    <table class="w-full text-left border">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2">Data</th>
          <th class="p-2">Tipo</th>
          <th class="p-2">Descrição</th>
          <th class="p-2">Valor</th>
          <th class="p-2">Responsável</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in extratoFiltrado" :key="item.id" class="border-t">
          <td class="p-2">{{ item.data }}</td>
          <td class="p-2 capitalize">{{ item.tipo }}</td>
          <td class="p-2">{{ item.descricao }}</td>
          <td class="p-2">R$ {{ item.valor.toFixed(2) }}</td>
          <td class="p-2">{{ item.responsavel }}</td>
        </tr>
        <tr v-if="extratoFiltrado.length === 0">
          <td colspan="5" class="p-4 text-center text-gray-500">
            Nenhum registro encontrado.
          </td>
        </tr>
      </tbody>
    </table>

  
    <div class="mt-6 border-t pt-4">
      <h2 class="text-xl font-semibold mb-2">Resumo do Dia</h2>
      <ul>
        <li>Saldo Inicial: R$ {{ resumo.saldoInicial.toFixed(2) }}</li>
        <li>Total de Entradas: R$ {{ resumo.entradas.toFixed(2) }}</li>
        <li>Total de Saídas: R$ {{ resumo.saidas.toFixed(2) }}</li>
        <li>
          <strong>Saldo Final: R$ {{ resumo.final.toFixed(2) }}</strong>
        </li>
      </ul>
    </div>

   
    <div class="mt-4 flex gap-2">
      <button class="btn">Exportar PDF</button>
      <button class="btn">Exportar Excel</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";

export default defineComponent({
  name: "ExtratoCaixaConsultaView",
  setup() {
    const profissionais = ref(["Carlos", "Ana", "Lucas"]);

    const extrato = ref([
      {
        id: 1,
        data: "2024-06-01",
        tipo: "entrada",
        descricao: "Agendamento",
        valor: 150,
        responsavel: "Carlos",
      },
      {
        id: 2,
        data: "2024-06-01",
        tipo: "saida",
        descricao: "Troco",
        valor: 20,
        responsavel: "Ana",
      },
    ]);

    const filtros = ref({
      dataInicio: "",
      dataFim: "",
      tipo: "",
      responsavel: "",
    });

    const extratoFiltrado = computed(() => {
      return extrato.value.filter((item) => {
        const matchDataInicio =
          !filtros.value.dataInicio || item.data >= filtros.value.dataInicio;
        const matchDataFim =
          !filtros.value.dataFim || item.data <= filtros.value.dataFim;
        const matchTipo =
          !filtros.value.tipo || item.tipo === filtros.value.tipo;
        const matchResponsavel =
          !filtros.value.responsavel ||
          item.responsavel === filtros.value.responsavel;
        return matchDataInicio && matchDataFim && matchTipo && matchResponsavel;
      });
    });

    const resumo = computed(() => {
      const saldoInicial = 100;
      const entradas = extratoFiltrado.value
        .filter((e) => e.tipo === "entrada")
        .reduce((sum, e) => sum + e.valor, 0);
      const saidas = extratoFiltrado.value
        .filter((e) => e.tipo === "saida")
        .reduce((sum, e) => sum + e.valor, 0);
      return {
        saldoInicial,
        entradas,
        saidas,
        final: saldoInicial + entradas - saidas,
      };
    });

    function filtrarExtrato() {
      
    }

    return {
      profissionais,
      filtros,
      extratoFiltrado,
      resumo,
      filtrarExtrato,
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
