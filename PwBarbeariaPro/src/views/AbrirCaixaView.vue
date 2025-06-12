<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Abrir Caixa</h1>

    <form @submit.prevent="abrirCaixa" class="space-y-4">
      <div>
        <label>Saldo Inicial (R$)</label>
        <input
          v-model="caixa.saldoInicial"
          type="number"
          step="0.01"
          min="0"
          class="input"
          required
        />
      </div>

      <div>
        <label>Responsável</label>
        <select v-model="caixa.responsavel" class="input" required>
          <option disabled value="">Selecione um profissional</option>
          <option v-for="p in profissionais" :key="p.nome" :value="p.nome">
            {{ p.nome }} ({{ p.especialidade }})
          </option>
        </select>
      </div>

      <button type="submit" class="btn">Abrir Caixa</button>

      <p v-if="mensagem" class="mt-4 text-green-600">{{ mensagem }}</p>
      <p v-if="erro" class="mt-4 text-red-600">{{ erro }}</p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "AbrirCaixaView",
  setup() {
    const profissionais = ref([
      { nome: "Carlos", especialidade: "Barbeiro" },
      { nome: "Ana", especialidade: "Esteticista" },
    ]);

    const caixa = ref({
      saldoInicial: 0,
      responsavel: "",
    });

    const mensagem = ref("");
    const erro = ref("");

    const caixaJaAberto = false; // aqui seria onde consultaria o backend

    function abrirCaixa() {
      if (caixaJaAberto) {
        erro.value = "Já existe um caixa aberto hoje.";
        mensagem.value = "";
        return;
      }

      if (!caixa.value.saldoInicial || !caixa.value.responsavel) {
        erro.value = "Todos os campos são obrigatórios.";
        mensagem.value = "";
        return;
      }

      // Aqui você faria uma chamada para a API para salvar
      console.log("Caixa aberto:", caixa.value);

      erro.value = "";
      mensagem.value = "Caixa aberto com sucesso!";
    }

    return {
      profissionais,
      caixa,
      mensagem,
      erro,
      abrirCaixa,
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
