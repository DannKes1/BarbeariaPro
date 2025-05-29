<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Registrar Saída</h1>

    <form @submit.prevent="registrarSaida" class="space-y-4">
      <div>
        <label>Tipo de Despesa</label>
        <select v-model="saida.tipo" class="input" required>
          <option disabled value="">Selecione</option>
          <option>Salário</option>
          <option>Manutenção</option>
          <option>Compras</option>
          <option>Outros</option>
        </select>
      </div>

      <div>
        <label>Valor</label>
        <input
          type="number"
          v-model.number="saida.valor"
          step="0.01"
          class="input"
          required
        />
      </div>

      <div>
        <label>Responsável</label>
        <select v-model="saida.responsavel" class="input" required>
          <option disabled value="">Selecione</option>
          <option>Ana</option>
          <option>Carlos</option>
          <option>João</option>
        </select>
      </div>

      <div>
        <label>Comprovante (opcional)</label>
        <input type="file" @change="handleFileUpload" class="input" />
      </div>

      <button class="btn" type="submit">Registrar</button>

      <p v-if="sucesso" class="text-green-600 mt-2">
        Saída registrada com sucesso!
      </p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "RegistrarSaidaView",
  setup() {
    const saida = ref({
      tipo: "",
      valor: 0,
      responsavel: "",
      comprovante: null as File | null,
    });

    const sucesso = ref(false);

    function handleFileUpload(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        saida.value.comprovante = target.files[0];
      }
    }

    function registrarSaida() {
      if (
        !saida.value.tipo ||
        saida.value.valor <= 0 ||
        !saida.value.responsavel
      ) {
        alert("Preencha todos os campos obrigatórios corretamente.");
        return;
      }

      console.log("Saída registrada:", saida.value);
      sucesso.value = true;
      setTimeout(() => (sucesso.value = false), 3000);
    }

    return {
      saida,
      sucesso,
      registrarSaida,
      handleFileUpload,
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
  background-color: #dc2626;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}
</style>
