<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Cadastrar Serviço</h1>

    <div
      v-if="cookieInfo.hasLastValues"
      class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg
            class="w-4 h-4 text-blue-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm text-blue-700">
            Alguns campos foram preenchidos com valores anteriores.
          </span>
        </div>
        <button
          @click="clearRememberedValues"
          class="text-blue-600 underline text-sm"
        >
          Limpar valores salvos
        </button>
      </div>
    </div>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label>Nome do Serviço</label>
        <input
          v-model="servico.nome"
          class="input"
          required
          placeholder="Ex: Corte de Cabelo Masculino"
          :disabled="isLoading"
          @blur="rememberFieldValue('nome')"
        />
        <small v-if="hasRememberedValue('nome')" class="text-gray-500 text-xs">
          💾 Valor lembrado dos últimos dados inseridos
        </small>
      </div>

      <div>
        <label>Descrição</label>
        <textarea
          v-model="servico.descricao"
          class="input"
          rows="3"
          placeholder="Descreva o serviço..."
          :disabled="isLoading"
          @blur="rememberFieldValue('descricao')"
        ></textarea>
        <small
          v-if="hasRememberedValue('descricao')"
          class="text-gray-500 text-xs"
        >
          💾 Valor lembrado dos últimos dados inseridos
        </small>
      </div>

      <div>
        <label>Categoria</label>
        <select
          v-model="servico.categoria"
          class="input"
          required
          :disabled="isLoading"
          @change="rememberFieldValue('categoria')"
        >
          <option value="">Selecione uma categoria</option>
          <option value="Cabelo">Cabelo</option>
          <option value="Barba">Barba</option>
          <option value="Estética">Estética</option>
          <option value="Unhas">Unhas</option>
          <option value="Massagem">Massagem</option>
          <option value="Combo">Combo</option>
        </select>
        <small
          v-if="hasRememberedValue('categoria')"
          class="text-gray-500 text-xs"
        >
          💾 Categoria lembrada dos últimos dados inseridos
        </small>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label>Preço (R$)</label>
          <input
            v-model="servico.preco"
            class="input"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="0,00"
            :disabled="isLoading"
            @blur="rememberFieldValue('preco')"
          />
          <small
            v-if="hasRememberedValue('preco')"
            class="text-gray-500 text-xs"
          >
            💾 Preço lembrado dos últimos dados inseridos
          </small>
        </div>

        <div>
          <label>Duração (minutos)</label>
          <input
            v-model="servico.duracao"
            class="input"
            type="number"
            min="15"
            step="15"
            required
            placeholder="60"
            :disabled="isLoading"
            @blur="rememberFieldValue('duracao')"
          />
          <small
            v-if="hasRememberedValue('duracao')"
            class="text-gray-500 text-xs"
          >
            💾 Duração lembrada dos últimos dados inseridos
          </small>
        </div>
      </div>

      <div>
        <label>Profissionais Habilitados</label>
        <div class="space-y-2">
          <label
            v-for="prof in profissionaisDisponiveis"
            :key="prof.id"
            class="flex items-center"
          >
            <input
              type="checkbox"
              :value="prof.id"
              v-model="servico.profissionais"
              class="mr-2"
              :disabled="isLoading"
              @change="rememberFieldValue('profissionais')"
            />
            {{ prof.nome }} - {{ prof.especialidade }}
          </label>
        </div>
        <p
          v-if="servico.profissionais.length === 0"
          class="text-yellow-600 text-sm mt-1"
        >
          ⚠️ Selecione pelo menos um profissional
        </p>
        <small
          v-if="hasRememberedValue('profissionais')"
          class="text-gray-500 text-xs block mt-1"
        >
          💾 Profissionais lembrados dos últimos dados inseridos
        </small>
      </div>

      <div class="flex items-center">
        <input
          type="checkbox"
          v-model="servico.ativo"
          class="mr-2"
          :disabled="isLoading"
          @change="rememberFieldValue('ativo')"
        />
        <label>Serviço ativo (disponível para agendamento)</label>
        <small
          v-if="hasRememberedValue('ativo')"
          class="text-gray-500 text-xs ml-2"
        >
          💾 Status lembrado
        </small>
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

        <button
          type="button"
          class="btn-secondary"
          @click="limparFormulario"
          :disabled="isLoading"
        >
          Limpar
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from "vue";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { useFormCookies } from "@/composables/useFormCookies";
import feather from "feather-icons";

export default defineComponent({
  name: "ServicoCadastroView",
  setup() {
    const {
      showToast,
      showError,
      showSuccess,
      showLoading,
      hideLoading,
      confirmAction,
    } = useSweetAlert();

    const isLoading = ref(false);
    const showDebugInfo = ref(false);

    const servico = ref({
      nome: "",
      descricao: "",
      categoria: "",
      preco: "",
      duracao: "",
      profissionais: [] as number[],
      ativo: true,
    });

    const formPreferences = ref({
      autoSaveEnabled: true,
      rememberCategory: true,
      rememberProfessionals: true,
    });

    const profissionaisDisponiveis = ref([
      { id: 1, nome: "João Silva", especialidade: "Barbeiro" },
      { id: 2, nome: "Maria Santos", especialidade: "Cabeleireira" },
      { id: 3, nome: "Pedro Oliveira", especialidade: "Esteticista" },
    ]);

    const {
      canUseCookies,
      saveLastValues,
      loadLastValues,
      clearFormCookies,
      getCookieInfo,
      rememberValue,
      getRememberedValue,
      hasRememberedValue,
    } = useFormCookies(servico.value, {
      formKey: "servico_cadastro",
      rememberFields: [
        "nome",
        "descricao",
        "categoria",
        "preco",
        "duracao",
        "profissionais",
        "ativo",
      ],
      expirationDays: 30,
    });

    const { saveLastValues: savePreferences, loadLastValues: loadPreferences } =
      useFormCookies(formPreferences.value, {
        formKey: "servico_form_preferences",
        rememberFields: [
          "autoSaveEnabled",
          "rememberCategory",
          "rememberProfessionals",
        ],
        expirationDays: 90,
      });

    const cookieInfo = computed(() => getCookieInfo());

    function rememberFieldValue(field: string) {
      if (!formPreferences.value.autoSaveEnabled) return;

      if (field === "categoria" && !formPreferences.value.rememberCategory)
        return;
      if (
        field === "profissionais" &&
        !formPreferences.value.rememberProfessionals
      )
        return;

      const value = servico.value[field as keyof typeof servico.value];
      if (
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        rememberValue(field, value);
      }
    }

    function saveFormPreferences() {
      if (canUseCookies.value) {
        savePreferences();
        showToast.info("Preferências do formulário salvas!");
      }
    }

    function clearRememberedValues() {
      clearFormCookies();
      showToast.info("Valores salvos foram limpos");
    }

    async function submitForm() {
      if (!servico.value.nome.trim()) {
        showError("Campo obrigatório", "Por favor, informe o nome do serviço.");
        return;
      }

      if (!servico.value.categoria) {
        showError("Campo obrigatório", "Por favor, selecione uma categoria.");
        return;
      }

      if (!servico.value.preco || parseFloat(servico.value.preco) <= 0) {
        showError("Preço inválido", "Por favor, informe um preço válido.");
        return;
      }

      if (!servico.value.duracao || parseInt(servico.value.duracao) < 15) {
        showError("Duração inválida", "A duração mínima é de 15 minutos.");
        return;
      }

      if (servico.value.profissionais.length === 0) {
        showError(
          "Profissionais obrigatórios",
          "Selecione pelo menos um profissional habilitado."
        );
        return;
      }

      const profissionaisSelecionados = profissionaisDisponiveis.value
        .filter((p) => servico.value.profissionais.includes(p.id))
        .map((p) => p.nome)
        .join(", ");

      const confirmed = await confirmAction(
        "Confirmar cadastro",
        `Deseja cadastrar o serviço "${servico.value.nome}" por R$ ${servico.value.preco}?\n\nProfissionais: ${profissionaisSelecionados}`,
        "Sim, cadastrar"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Cadastrando serviço...");

      try {
        if (formPreferences.value.autoSaveEnabled) {
          saveLastValues();
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));

        hideLoading();

        showSuccess(
          "Serviço cadastrado!",
          `"${servico.value.nome}" foi cadastrado com sucesso por R$ ${servico.value.preco}.`,
          "Continuar"
        );

        limparFormulario();

        showToast.success("Serviço cadastrado com sucesso!");
      } catch (error) {
        hideLoading();
        showError(
          "Erro no servidor",
          "Ocorreu um erro ao cadastrar o serviço. Tente novamente."
        );
      } finally {
        isLoading.value = false;
      }
    }

    function limparFormulario() {
      Object.assign(servico.value, {
        nome: "",
        descricao: "",
        categoria: "",
        preco: "",
        duracao: "",
        profissionais: [],
        ativo: true,
      });

      showToast.info("Formulário limpo");
    }

    watch(
      servico,
      () => {
        if (formPreferences.value.autoSaveEnabled && canUseCookies.value) {
          setTimeout(() => {
            saveLastValues();
          }, 2000);
        }
      },
      { deep: true }
    );

    onMounted(() => {
      feather.replace();

      if (canUseCookies.value) {
        loadPreferences();
        loadLastValues();
      }
    });

    return {
      servico,
      profissionaisDisponiveis,
      formPreferences,
      isLoading,
      showDebugInfo,
      cookieInfo,
      submitForm,
      limparFormulario,
      rememberFieldValue,
      saveFormPreferences,
      clearRememberedValues,
      hasRememberedValue,
      canUseCookies,
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
