<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Editar Pagamento</h1>

    <form v-if="pagamento" @submit.prevent="salvarAlteracoes" class="space-y-4">
      <div>
        <label>Agendamento</label>
        <input class="input" :value="pagamento.agendamentoId" readonly />
      </div>

      <div>
        <label>Forma de Pagamento</label>
        <select v-model="pagamento.forma" class="input" required>
          <option disabled value="">Selecione</option>
          <option value="Dinheiro">Dinheiro</option>
          <option value="Cartão">Cartão</option>
          <option value="PIX">PIX</option>
        </select>
      </div>

      <div>
        <label>Status</label>
        <select v-model="pagamento.status" class="input" required>
          <option disabled value="">Selecione</option>
          <option value="Efetuado">Efetuado</option>
          <option value="Pendente">Pendente</option>
          <option value="Estornado">Estornado</option>
        </select>
      </div>

      <div>
        <label>Valor</label>
        <input class="input" :value="pagamento.valor" readonly />
      </div>

      <button class="btn" type="submit">Salvar</button>
    </form>

    <p v-else class="text-red-600">
      Pagamento não encontrado ou agendamento cancelado.
    </p>
    <p v-if="sucesso" class="text-green-600 mt-4">
      Pagamento atualizado com sucesso!
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRoute } from "vue-router";

interface Pagamento {
  id: number;
  agendamentoId: number;
  forma: string;
  valor: string;
  status: string;
  agendamentoCancelado: boolean;
}

export default defineComponent({
  name: "PagamentoEditarView",
  setup() {
    const route = useRoute();
    const sucesso = ref(false);

    const pagamentosMock: Pagamento[] = [
      {
        id: 1,
        agendamentoId: 101,
        forma: "Dinheiro",
        valor: "R$ 75,00",
        status: "Efetuado",
        agendamentoCancelado: false,
      },
      {
        id: 2,
        agendamentoId: 102,
        forma: "PIX",
        valor: "R$ 60,00",
        status: "Pendente",
        agendamentoCancelado: true,
      },
    ];

    const pagamento = ref<Pagamento | null>(null);

    onMounted(() => {
      const id = parseInt(route.params.id as string);
      const encontrado = pagamentosMock.find(
        (p) => p.id === id && !p.agendamentoCancelado
      );
      if (encontrado) {
        pagamento.value = { ...encontrado };
      }
    });

    function salvarAlteracoes() {
      console.log("Pagamento atualizado:", pagamento.value);
      sucesso.value = true;
      setTimeout(() => (sucesso.value = false), 3000);
    }

    return {
      pagamento,
      sucesso,
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
