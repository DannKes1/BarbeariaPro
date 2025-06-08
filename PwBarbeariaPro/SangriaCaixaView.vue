<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Sangria de Caixa</h1>

    <form @submit.prevent="registrarSangria" class="space-y-4">
      <div>
        <label>Tipo de Despesa</label>
        <input v-model="tipoDespesa" class="input" required />
      </div>

      <div>
        <label>Valor (R$)</label>
        <input
          type="number"
          v-model.number="valor"
          step="0.01"
          class="input"
          required
        />
      </div>

      <button class="btn" type="submit">Registrar Sangria</button>

      <p v-if="sucesso" class="text-green-600 mt-2">
        Sangria registrada com sucesso!
      </p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "SangriaCaixaView",
  setup() {
    const tipoDespesa = ref("");
    const valor = ref(0);
    const sucesso = ref(false);

    const caixaAberto = true; // Simulando um caixa aberto

    function registrarSangria() {
      if (!caixaAberto) {
        alert("Não há caixa aberto no momento.");
        return;
      }

      if (valor.value <= 0) {
        alert("Informe um valor válido para a sangria.");
        return;
      }

      console.log("Sangria registrada:", {
        tipoDespesa: tipoDespesa.value,
        valor: valor.value,
      });

      sucesso.value = true;
      setTimeout(() => (sucesso.value = false), 3000);
      tipoDespesa.value = "";
      valor.value = 0;
    }

    return {
      tipoDespesa,
      valor,
      sucesso,
      registrarSangria,
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
  background-color: #f59e0b;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}
</style>
