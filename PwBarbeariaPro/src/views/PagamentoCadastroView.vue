<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Cadastrar Pagamento</h1>

    <div class="mb-4">
      <label class="block mb-1 font-semibold">Selecione o Agendamento</label>
      <select v-model="pagamento.agendamentoId" class="input" required>
        <option disabled value="">Selecione</option>
        <option
          v-for="ag in agendamentosPendentes"
          :key="ag.id"
          :value="ag.id"
        >
          {{ ag.cliente }} - {{ ag.servico }} ({{ ag.data }} {{ ag.horario }})
        </option>
      </select>
    </div>

    <div class="mb-4">
      <label class="block mb-1 font-semibold">Forma de Pagamento</label>
      <select v-model="pagamento.forma" class="input" required>
        <option disabled value="">Selecione</option>
        <option>Dinheiro</option>
        <option>Cartão</option>
        <option>PIX</option>
      </select>
    </div>

    <div class="mb-4">
      <label class="block mb-1 font-semibold">Valor (R$)</label>
      <input
        v-model="pagamento.valor"
        class="input"
        required
        type="text"
        placeholder="R$ 00,00"
      />
    </div>

    <div class="mb-4">
      <label class="block mb-1 font-semibold">Status</label>
      <select v-model="pagamento.status" class="input" required>
        <option disabled value="">Selecione</option>
        <option>Efetuado</option>
        <option>Pendente</option>
      </select>
    </div>

    <button class="btn" @click="registrarPagamento">Registrar Pagamento</button>
    <p v-if="erro" class="text-red-600 mt-2">{{ erro }}</p>
    <p v-if="sucesso" class="text-green-600 mt-2">Pagamento registrado com sucesso!</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'PagamentoCadastroView',
  setup() {
    const agendamentosPendentes = ref([
      { id: 1, cliente: 'João', servico: 'Corte', data: '2024-06-15', horario: '10:00', valor: 50 },
      { id: 2, cliente: 'Maria', servico: 'Barba', data: '2024-06-16', horario: '11:30', valor: 40 },
    ]);

    const pagamento = ref({
      agendamentoId: '',
      forma: '',
      valor: '',
      status: '',
    });

    const sucesso = ref(false);
    const erro = ref('');

    function registrarPagamento() {
      erro.value = '';
      const ag = agendamentosPendentes.value.find(a => a.id === Number(pagamento.value.agendamentoId));
      if (!ag) {
        erro.value = 'Agendamento não encontrado.';
        return;
      }

      const valorNormalizado = pagamento.value.valor.replace(/[R$\s]/g, '').replace(',', '.');
      const valorFloat = parseFloat(valorNormalizado);

      if (isNaN(valorFloat) || valorFloat !== ag.valor) {
        erro.value = `Valor deve ser igual a R$ ${ag.valor.toFixed(2).replace('.', ',')}`;
        return;
      }

      console.log('Pagamento registrado:', pagamento.value);
      sucesso.value = true;
      setTimeout(() => (sucesso.value = false), 3000);
    }

    return {
      agendamentosPendentes,
      pagamento,
      registrarPagamento,
      sucesso,
      erro,
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
