<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Fechar Caixa</h1>

    <div v-if="!caixaAberto" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
      <strong>⚠️ Nenhum caixa aberto!</strong>
      <p>É necessário abrir um caixa antes de fechá-lo.</p>
      <button class="btn mt-2" @click="$router.push('/caixa/abrir')">Abrir Caixa</button>
    </div>

    <div v-else>
      <div class="bg-blue-50 p-4 rounded mb-4">
        <h3 class="font-semibold text-blue-800 mb-2">📊 Resumo do Caixa</h3>
        <div class="text-blue-700 space-y-1">
          <p><strong>Saldo Inicial:</strong> R$ {{ saldoInicial.toFixed(2) }}</p>
          <p><strong>Total Entradas:</strong> R$ {{ entradas.toFixed(2) }}</p>
          <p><strong>Total Saídas:</strong> R$ {{ saidas.toFixed(2) }}</p>
          <p><strong>Saldo Esperado:</strong> R$ {{ saldoEsperado.toFixed(2) }}</p>
        </div>
      </div>

      <form @submit.prevent="fecharCaixa" class="space-y-4">
        <div>
          <label>Observações Finais</label>
          <textarea
            v-model="observacoes"
            class="input"
            rows="2"
            placeholder="Observações sobre o fechamento (opcional)"
            :disabled="isLoading"
          ></textarea>
        </div>

        <div class="bg-red-50 p-4 rounded">
          <h3 class="font-semibold text-red-800 mb-2">⚠️ Atenção</h3>
          <ul class="text-red-700 text-sm space-y-1">
            <li>• Esta ação não pode ser desfeita</li>
            <li>• O caixa será fechado definitivamente</li>
            <li>• O saldo final será calculado com base nas movimentações</li>
          </ul>
        </div>

        <div class="flex gap-2">
          <button class="btn" type="submit" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isLoading ? "Fechando..." : "Fechar Caixa" }}
          </button>
          <button type="button" class="btn-secondary" @click="cancelar" :disabled="isLoading">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { api } from "@/common/http";
import feather from "feather-icons";

export default defineComponent({
  name: "FecharCaixaView",
  setup() {
    const router = useRouter();
    const { showToast, showError, showSuccess, showLoading, hideLoading, confirmAction } = useSweetAlert();

    const isLoading = ref(false);
    const caixaAberto = ref(false);

    const idCaixa = ref(0);
    const saldoInicial = ref(0);
    const entradas = ref(0);
    const saidas = ref(0);
    const usuarioFk = ref(0);
    const nomeUsuario = ref("");
    const dataAbertura = ref("");

    const observacoes = ref("");

    const saldoEsperado = computed(() => saldoInicial.value + entradas.value - saidas.value);

    async function fecharCaixa() {
      const confirmado = await confirmAction(
        "Confirmar Fechamento",
        `Deseja realmente fechar o caixa com saldo final de R$ ${saldoEsperado.value.toFixed(2)}?`,
        "Sim, fechar"
      );

      if (!confirmado) return;

      isLoading.value = true;
      showLoading("Fechando caixa...");

      try {
        const payload = {
          id: idCaixa.value,
          saldoInicial: saldoInicial.value,
          saldoFinal: saldoEsperado.value,
          dataAbertura: dataAbertura.value,
          dataFechamento: new Date().toISOString(),
          status: "Fechado",
          usuarioFk: usuarioFk.value,
          nomeUsuario: nomeUsuario.value
        };

        await api.put(`/api/Caixa/${idCaixa.value}`, payload);

        hideLoading();
        showToast.success("Caixa fechado com sucesso!");
        router.push("/caixa/consulta");
      } catch (error) {
        hideLoading();
        showError("Erro ao fechar caixa", "Tente novamente mais tarde.");
      } finally {
        isLoading.value = false;
      }
    }

    function cancelar() {
      router.push("/caixa/consulta");
    }

    onMounted(async () => {
      feather.replace();

      try {
        const res = await api.get("/api/Caixa/ultimo");
        const caixa = res.data;

        if (!caixa || caixa.status !== "Aberto") {
          caixaAberto.value = false;
          return;
        }
        idCaixa.value = caixa.id;
        saldoInicial.value = caixa.saldoInicial;
        usuarioFk.value = caixa.usuarioFk;
        dataAbertura.value = caixa.dataAbertura;
        entradas.value = caixa.totalEntradas || 0;
        saidas.value = caixa.totalSaidas || 0;

        caixaAberto.value = true;
      } catch {
        showError("Erro ao carregar caixa", "Não foi possível buscar o caixa atual.");
      }
    });

    return {
      caixaAberto,
      saldoInicial,
      entradas,
      saidas,
      saldoEsperado,
      isLoading,
      observacoes,
      fecharCaixa,
      cancelar
    };
  }
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
  border: none;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background-color: #6b7280;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
textarea.input {
  resize: vertical;
  min-height: 80px;
}
</style>
