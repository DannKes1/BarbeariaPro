<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Fechar Caixa</h1>

    <form @submit.prevent="fecharCaixa" class="space-y-4">
      <div>
        <label>Saldo Final (R$)</label>
        <input
          type="number"
          v-model.number="saldoFinal"
          step="0.01"
          class="input"
          required
        />
      </div>

      <div v-if="divergencia !== 0">
        <label
          >Justificativa de Divergência (R$ {{ divergencia.toFixed(2) }})</label
        >
        <textarea v-model="justificativa" class="input" required></textarea>
      </div>

      <button class="btn" type="submit">Fechar Caixa</button>

      <p v-if="sucesso" class="text-green-600 mt-2">
        Caixa fechado com sucesso!
      </p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";

export default defineComponent({
  name: "FecharCaixaView",
  setup() {
    const saldoInicial = 100;
    const entradas = 500;
    const saidas = 200;

    const saldoEsperado = computed(() => saldoInicial + entradas - saidas);
    const saldoFinal = ref(0);
    const justificativa = ref("");
    const sucesso = ref(false);

    const divergencia = computed(() => saldoFinal.value - saldoEsperado.value);

    // Simulação de agendamentos pendentes
    const agendamentosPendentes = ref([
      { id: 1, cliente: "João", status: "Pendente" },
      { id: 2, cliente: "Maria", status: "Efetuado" },
    ]);

    const temPendencias = computed(() =>
      agendamentosPendentes.value.some((a) => a.status === "Pendente")
    );

    function fecharCaixa() {
      if (temPendencias.value) {
        alert(
          "Existem agendamentos pendentes de pagamento. Fechamento bloqueado."
        );
        return;
      }

      if (divergencia.value !== 0 && justificativa.value.trim() === "") {
        alert("Justifique a divergência no saldo.");
        return;
      }

      console.log("Caixa fechado com:", {
        saldoFinal: saldoFinal.value,
        esperado: saldoEsperado.value,
        justificativa: justificativa.value,
      });

      sucesso.value = true;
      setTimeout(() => (sucesso.value = false), 3000);
    }

    return {
      saldoFinal,
      justificativa,
      sucesso,
      divergencia,
      fecharCaixa,
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
  background-color: #10b981;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}
</style>
