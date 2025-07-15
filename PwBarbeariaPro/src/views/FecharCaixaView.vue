<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Fechar Caixa</h1>
    </div>

    <div v-if="!caixaAberto" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
      <strong>⚠️ Nenhum caixa aberto!</strong>
      <p>É necessário abrir um caixa antes de fechá-lo.</p>
      <button class="btn btn-secondary mt-2" @click="$router.push('/caixa/abrir')">Abrir Caixa</button>
    </div>

    <div v-else>
      <div class="bg-blue-50 p-4 rounded mb-4">
        <h3 class="font-semibold text-blue-800 mb-2">📊 Resumo do Caixa</h3>
        <div class="text-blue-700 space-y-1">
          <p><strong>Saldo Inicial:</strong> R$ {{ saldoInicial.toFixed(2) }}</p>
          <p><strong>Saldo Atual/Fim:</strong> R$ {{ saldoFinal.toFixed(2) }}</p>
        </div>
      </div>

      <form @submit.prevent="fecharCaixa" class="space-y-4">
        <div class="bg-red-50 p-4 rounded mb-4">
          <h3 class="font-semibold text-red-800 mb-2">⚠️ Atenção</h3>
          <ul class="text-red-700 text-sm space-y-1">
            <li>• Esta ação não pode ser desfeita</li>
            <li>• O caixa será fechado definitivamente</li>
            <li>• O saldo final será calculado com base nas movimentações</li>
          </ul>
        </div>

        <div class="flex gap-2">
          <button class="btn btn-primary" type="submit" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isLoading ? "Fechando..." : "Fechar Caixa" }}
          </button>
          <button type="button" class="btn btn-secondary" @click="cancelar" :disabled="isLoading">
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
    const saldoFinal = ref(0);
    const usuarioFk = ref(0);
    const dataAbertura = ref("");

    const observacoes = ref("");

    async function fecharCaixa() {
      const confirmado = await confirmAction(
        "Confirmar Fechamento",
        `Deseja realmente fechar o caixa com saldo final de R$ ${saldoFinal.value.toFixed(2)}?`,
        "Sim, fechar"
      );

      if (!confirmado) return;

      isLoading.value = true;
      showLoading("Fechando caixa...");

      try {
        const payload = {
          id: idCaixa.value,
          saldoInicial: saldoInicial.value,
          saldoFinal: saldoFinal.value,
          dataAbertura: dataAbertura.value,
          dataFechamento: new Date().toISOString(),
          status: "Fechado",
          usuarioFk: usuarioFk.value,
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
        saldoFinal.value = caixa.saldoFinal || saldoInicial.value;
        caixaAberto.value = true;
      } catch {
        showError("Erro ao carregar caixa", "Não foi possível buscar o caixa atual.");
      }
    });

    return {
      caixaAberto,
      saldoInicial,
      saldoFinal,
      isLoading,
      observacoes,
      fecharCaixa,
      cancelar
    };
  }
});
</script>

<style scoped>
.form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.bg-yellow-100 {
  background-color: #fefcbf;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-red-50 {
  background-color: #fee2e2;
}

.text-yellow-700 {
  color: #b45309;
}

.text-blue-700 {
  color: #3b82f6;
}

.text-red-700 {
  color: #b91c1c;
}

.text-sm {
  font-size: 0.875rem;
}

.text-2xl {
  font-size: 1.5rem;
}

.font-semibold {
  font-weight: 600;
}

.space-y-4 {
  margin-top: 1rem;
}

.space-y-1 {
  margin-top: 0.25rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: #ffffff;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
  transform: translateY(-1px);
}

.spinner-border {
  border: 2px solid transparent;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}
</style>
