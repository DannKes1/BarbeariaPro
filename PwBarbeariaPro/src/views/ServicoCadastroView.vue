<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Cadastrar Serviço</h1>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label>Nome do Serviço</label>
        <input
          v-model="servico.nome"
          class="input"
          required
          placeholder="Ex: Corte de Cabelo Masculino"
          :disabled="isLoading"
        />
      </div>

      <div>
        <label>Descrição</label>
        <textarea
          v-model="servico.descricao"
          class="input"
          rows="3"
          placeholder="Descreva o serviço..."
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
            placeholder="0,00"
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
            placeholder="60"
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
          {{ isLoading ? "Cadastrando..." : "Cadastrar" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { api } from "@/common/http";

export default defineComponent({
  name: "ServicoCadastroView",
  setup() {
    const { showError, showSuccess, showLoading, hideLoading, confirmAction } =
      useSweetAlert();

    const isLoading = ref(false);

    const servico = ref({
      nome: "",
      descricao: "",
      categoria: "",
      valor: 0,
      duracaoMinutos: 0,
    });

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
        "Confirmar cadastro",
        `Deseja cadastrar o serviço "${servico.value.nome}" por R$ ${servico.value.valor}?`,
        "Sim, cadastrar"
      );

      if (!confirmado) return;

      isLoading.value = true;
      showLoading("Cadastrando serviço...");

      try {
        const payload = {
          id: 0,
          nome: servico.value.nome,
          descricao: servico.value.descricao,
          categoria: servico.value.categoria,
          valor: servico.value.valor,
          duracaoMinutos: servico.value.duracaoMinutos,
          duracaoEstimada: new Date().toISOString(),
        };

        await api.post("/api/Servico", payload);

        hideLoading();

        showSuccess(
          "Serviço cadastrado!",
          `"${servico.value.nome}" foi cadastrado com sucesso.`
        );

        limparFormulario();
      } catch (err) {
        hideLoading();
        showError("Erro", "Erro ao cadastrar o serviço. Tente novamente.");
      } finally {
        isLoading.value = false;
      }
    }

    function limparFormulario() {
      servico.value = {
        nome: "",
        descricao: "",
        categoria: "",
        valor: 0,
        duracaoMinutos: 0,
      };
    }

    return {
      servico,
      isLoading,
      submitForm,
      limparFormulario,
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
