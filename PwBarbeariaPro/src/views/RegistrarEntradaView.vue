<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Registrar Entrada</h1>

    <form @submit.prevent="registrarEntrada" class="space-y-4">
      <div>
        <label>Origem</label>
        <select v-model="entrada.origem" class="input" required>
          <option disabled value="">Selecione</option>
          <option>Pagamento de Agendamento</option>
          <option>Venda de Produto</option>
          <option>Outros</option>
        </select>
      </div>

      <div>
        <label>Valor</label>
        <input
          type="number"
          v-model.number="entrada.valor"
          step="0.01"
          class="input"
          required
        />
      </div>

      <div>
        <label>Forma de Pagamento</label>
        <select v-model="entrada.formaPagamento" class="input" required>
          <option disabled value="">Selecione</option>
          <option>Dinheiro</option>
          <option>Cartão</option>
          <option>PIX</option>
        </select>
      </div>

      <button type="submit" class="btn">Registrar</button>

      <p v-if="sucesso" class="text-green-600 mt-2">
        Entrada registrada com sucesso!
      </p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "RegistrarEntradaView",
  setup() {
    const entrada = ref({
      origem: "",
      valor: 0,
      formaPagamento: "",
    });

    const sucesso = ref(false);

    function registrarEntrada() {
      if (
        !entrada.value.origem ||
        !entrada.value.formaPagamento ||
        entrada.value.valor <= 0
      ) {
        alert("Preencha todos os campos corretamente.");
        return;
      }

      console.log("Entrada registrada:", entrada.value);
      sucesso.value = true;
      setTimeout(() => (sucesso.value = false), 3000);
    }

    return {
      entrada,
      sucesso,
      registrarEntrada,
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
