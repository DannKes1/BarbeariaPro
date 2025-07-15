<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Editar Serviço</h1>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label>Nome do Serviço</label>
        <input
          v-model="servico.nome"
          class="input"
          required
          :disabled="isLoading"
        />
      </div>

      <div>
        <label>Descrição</label>
        <textarea
          v-model="servico.descricao"
          class="input"
          rows="3"
          :disabled="isLoading"
        ></textarea>
      </div>

      <div>
        <label>Categoria</label>
        <select
          v-model="servico.categoria"
          class="input"
          required
          :disabled="isLoading"
        >
          <option value="">Selecione uma categoria</option>
          <option value="Cabelo">Cabelo</option>
          <option value="Barba">Barba</option>
          <option value="Estética">Estética</option>
          <option value="Unhas">Unhas</option>
          <option value="Massagem">Massagem</option>
          <option value="Combo">Combo</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label>Preço (R$)</label>
          <input
            v-model.number="servico.valor"
            class="input"
            type="number"
            min="0"
            step="0.01"
            required
            :disabled="isLoading"
          />
        </div>

        <div>
          <label>Duração (minutos)</label>
          <input
            v-model.number="servico.duracaoMinutos"
            class="input"
            type="number"
            min="15"
            step="15"
            required
            :disabled="isLoading"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <button class="btn" type="submit" :disabled="isLoading">
          <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          {{ isLoading ? "Salvando..." : "Salvar Alterações" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { api } from "@/common/http";

export default defineComponent({
  name: "ServicoEdicaoView",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const id = Number(route.params.id);

    const { showError, showSuccess, showLoading, hideLoading, confirmAction } =
      useSweetAlert();

    const isLoading = ref(false);

    const servico = ref({
      id: id,
      nome: "",
      descricao: "",
      categoria: "",
      valor: 0,
      duracaoMinutos: 0,
    });

    async function carregarServico() {
      try {
        const { data } = await api.get(`/api/Servico/${id}`);
        servico.value = {
          id: data.id,
          nome: data.nome,
          descricao: data.descricao,
          categoria: data.categoria,
          valor: data.valor,
          duracaoMinutos: data.duracaoMinutos,
        };
      } catch {
        showError("Erro", "Erro ao carregar o serviço.");
        router.push("/servico");
      }
    }

    async function submitForm() {
      if (!servico.value.nome.trim()) {
        showError("Campo obrigatório", "Informe o nome do serviço.");
        return;
      }

      if (!servico.value.categoria) {
        showError("Campo obrigatório", "Selecione uma categoria.");
        return;
      }

      if (!servico.value.valor || servico.value.valor <= 0) {
        showError("Preço inválido", "Informe um preço válido.");
        return;
      }

      if (!servico.value.duracaoMinutos || servico.value.duracaoMinutos < 15) {
        showError("Duração inválida", "A duração mínima é de 15 minutos.");
        return;
      }

      const confirmado = await confirmAction(
        "Confirmar alterações",
        `Deseja salvar as alterações no serviço "${servico.value.nome}"?`,
        "Salvar"
      );

      if (!confirmado) return;

      isLoading.value = true;
      showLoading("Salvando alterações...");

      try {
        const payload = {
          ...servico.value,
          duracaoEstimada: new Date().toISOString(),
        };

        await api.put(`/api/Servico/${id}`, payload);

        hideLoading();

        showSuccess("Sucesso", "Serviço atualizado com sucesso.");
        router.push("/servico/consulta");
      } catch {
        hideLoading();
        showError("Erro", "Erro ao atualizar o serviço.");
      } finally {
        isLoading.value = false;
      }
    }

    onMounted(carregarServico);

    return {
      servico,
      isLoading,
      submitForm,
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
  border: none;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
