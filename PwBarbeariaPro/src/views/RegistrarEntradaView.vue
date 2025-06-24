<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Registrar Entrada</h1>

    <form @submit.prevent="registrarEntrada" class="space-y-4">
      <div>
        <label>Descrição</label>
        <input
          v-model="entrada.descricao"
          class="input"
          required
          placeholder="Ex: Venda de produto"
        />
      </div>

      <div>
        <label>Valor (R$)</label>
        <input
          v-model="entrada.valor"
          type="number"
          step="0.01"
          class="input"
          required
        />
      </div>

      <div>
        <label>Categoria</label>
        <select v-model="entrada.categoria" class="input" required>
          <option value="">Selecione</option>
          <option value="servico">Serviço</option>
          <option value="produto">Produto</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      <div>
        <label>Observações</label>
        <textarea
          v-model="entrada.observacoes"
          class="input"
          rows="3"
        ></textarea>
      </div>

      <button class="btn w-full" type="submit" :disabled="isLoading">
        {{ isLoading ? "Registrando..." : "Registrar Entrada" }}
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useSweetAlert } from "@/composables/useSweetAlert";

export default defineComponent({
  name: "RegistrarEntradaView",
  setup() {
    const { showSuccess, showLoading, hideLoading } = useSweetAlert();

    const isLoading = ref(false);
    const entrada = ref({
      descricao: "",
      valor: "",
      categoria: "",
      observacoes: "",
    });

    async function registrarEntrada() {
      isLoading.value = true;
      showLoading("Registrando entrada...");

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        hideLoading();
        showSuccess(
          "Entrada registrada!",
          `Entrada de R$ ${entrada.value.valor} foi registrada com sucesso.`
        );

        // Limpar formulário
        entrada.value = {
          descricao: "",
          valor: "",
          categoria: "",
          observacoes: "",
        };
      } catch (error) {
        hideLoading();
      } finally {
        isLoading.value = false;
      }
    }

    return { entrada, isLoading, registrarEntrada };
  },
});
</script>
