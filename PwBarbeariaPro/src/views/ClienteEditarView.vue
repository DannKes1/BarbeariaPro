<template>
  <div class="p-6 max-w-2xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Editar Cliente</h1>
      <button
        class="btn-secondary"
        @click="voltarParaConsulta"
        :disabled="isLoading"
      >
        ← Voltar
      </button>
    </div>

    <div v-if="!cliente && !erro" class="text-center py-8">
      <div class="spinner-border" role="status"></div>
      <p class="mt-2 text-gray-600">Carregando dados do cliente...</p>
    </div>

    <div
      v-if="erro"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
    >
      <strong>Erro!</strong> {{ erro }}
      <button class="btn mt-2" @click="carregarCliente">
        Tentar Novamente
      </button>
    </div>

    <form v-if="cliente" @submit.prevent="submitForm" class="space-y-4">
      <div class="bg-blue-50 p-4 rounded mb-4">
        <h3 class="font-semibold text-blue-800 mb-2">👤 Dados Atuais</h3>
        <p class="text-blue-700">
          Editando:
          <strong
            >{{ clienteOriginal?.nome }}
            {{ clienteOriginal?.sobrenome }}</strong
          >
        </p>
        <p class="text-blue-700">
          CPF: <strong>{{ clienteOriginal?.cpf }}</strong>
        </p>
      </div>

      <div>
        <label>Nome</label>
        <input
          v-model="cliente.nome"
          class="input"
          required
          pattern="[A-Za-zÀ-ü ]+"
          :disabled="isLoading"
        />
      </div>

      <div>
        <label>Sobrenome</label>
        <input
          v-model="cliente.sobrenome"
          class="input"
          required
          pattern="[A-Za-zÀ-ü ]+"
          :disabled="isLoading"
        />
      </div>

      <div>
        <label>Telefone</label>
        <input
          v-model="cliente.telefone"
          class="input"
          required
          pattern="\\(\\d{2}\\) \\d{5}-\\d{4}"
          placeholder="(11) 98765-4321"
          :disabled="isLoading"
        />
      </div>

      <div>
        <label>CPF</label>
        <input
          v-model="cliente.cpf"
          class="input bg-gray-100"
          readonly
          title="CPF não pode ser alterado"
        />
        <small class="text-gray-600">CPF não pode ser alterado</small>
      </div>

      <div>
        <label>E-mail</label>
        <input
          v-model="cliente.email"
          class="input"
          type="email"
          :disabled="isLoading"
        />
      </div>

      <div>
        <label>Data de Nascimento</label>
        <input
          v-model="cliente.dataNascimento"
          class="input"
          required
          type="date"
          @change="validarIdade"
          :disabled="isLoading"
        />
        <p v-if="erros.dataNascimento" class="text-red-500 text-sm">
          {{ erros.dataNascimento }}
        </p>
      </div>

      <div v-if="temAlteracoes" class="bg-yellow-50 p-4 rounded">
        <h3 class="font-semibold text-yellow-800 mb-2">
          ⚠️ Alterações Detectadas
        </h3>
        <ul class="text-yellow-700 text-sm space-y-1">
          <li v-for="alteracao in listarAlteracoes()" :key="alteracao">
            • {{ alteracao }}
          </li>
        </ul>
      </div>

      <div class="flex gap-2">
        <button
          class="btn"
          type="submit"
          :disabled="isLoading || !temAlteracoes"
        >
          <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          {{ isLoading ? "Salvando..." : "Salvar Alterações" }}
        </button>

        <button
          type="button"
          class="btn-secondary"
          @click="resetarFormulario"
          :disabled="isLoading || !temAlteracoes"
        >
          Desfazer
        </button>

        <button
          type="button"
          class="btn-danger"
          @click="excluirCliente"
          :disabled="isLoading"
        >
          Excluir
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import feather from "feather-icons";

export default defineComponent({
  name: "ClienteEditarView",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const {
      showToast,
      showError,
      showSuccess,
      showLoading,
      hideLoading,
      confirmAction,
      confirmDelete,
    } = useSweetAlert();

    const isLoading = ref(false);
    const erro = ref("");

    const cliente = ref(null as any);
    const clienteOriginal = ref(null as any);
    const erros = ref({ dataNascimento: "" });

    const temAlteracoes = computed(() => {
      if (!cliente.value || !clienteOriginal.value) return false;

      return (
        cliente.value.nome !== clienteOriginal.value.nome ||
        cliente.value.sobrenome !== clienteOriginal.value.sobrenome ||
        cliente.value.telefone !== clienteOriginal.value.telefone ||
        cliente.value.email !== clienteOriginal.value.email ||
        cliente.value.dataNascimento !== clienteOriginal.value.dataNascimento
      );
    });

    function listarAlteracoes() {
      const alteracoes = [];

      if (cliente.value.nome !== clienteOriginal.value.nome) {
        alteracoes.push(
          `Nome: "${clienteOriginal.value.nome}" → "${cliente.value.nome}"`
        );
      }
      if (cliente.value.sobrenome !== clienteOriginal.value.sobrenome) {
        alteracoes.push(
          `Sobrenome: "${clienteOriginal.value.sobrenome}" → "${cliente.value.sobrenome}"`
        );
      }
      if (cliente.value.telefone !== clienteOriginal.value.telefone) {
        alteracoes.push(
          `Telefone: "${clienteOriginal.value.telefone}" → "${cliente.value.telefone}"`
        );
      }
      if (cliente.value.email !== clienteOriginal.value.email) {
        alteracoes.push(
          `Email: "${clienteOriginal.value.email}" → "${cliente.value.email}"`
        );
      }
      if (
        cliente.value.dataNascimento !== clienteOriginal.value.dataNascimento
      ) {
        alteracoes.push(
          `Data de Nascimento: "${clienteOriginal.value.dataNascimento}" → "${cliente.value.dataNascimento}"`
        );
      }

      return alteracoes;
    }

    async function carregarCliente() {
      const cpf = route.params.cpf as string;

      if (!cpf) {
        erro.value = "CPF não informado na URL";
        return;
      }

      isLoading.value = true;
      erro.value = "";

      try {
      
        await new Promise((resolve) => setTimeout(resolve, 1500));

        
        const clienteData = {
          nome: "João",
          sobrenome: "Silva",
          telefone: "(11) 99999-1111",
          cpf: cpf,
          email: "joao@teste.com",
          dataNascimento: "1990-05-01",
        };

        cliente.value = { ...clienteData };
        clienteOriginal.value = { ...clienteData };
      } catch (error) {
        erro.value = "Erro ao carregar dados do cliente";
        showError(
          "Erro ao carregar",
          "Não foi possível carregar os dados do cliente."
        );
      } finally {
        isLoading.value = false;
      }
    }

    function validarIdade() {
      const hoje = new Date();
      const nascimento = new Date(cliente.value.dataNascimento);
      const idade = hoje.getFullYear() - nascimento.getFullYear();
      const ajuste =
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() &&
          hoje.getDate() < nascimento.getDate());

      if (idade - (ajuste ? 1 : 0) < 16) {
        erros.value.dataNascimento = "Cliente deve ter pelo menos 16 anos.";
        return false;
      }
      erros.value.dataNascimento = "";
      return true;
    }

    async function submitForm() {
      if (!validarIdade()) {
        showError(
          "Dados inválidos",
          "Por favor, corrija os erros no formulário."
        );
        return;
      }

      
      const alteracoes = listarAlteracoes();
      const confirmed = await confirmAction(
        "Confirmar alterações",
        `Salvar as seguintes alterações?\\n\\n${alteracoes.join("\\n")}`,
        "Sim, salvar"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Salvando alterações...");

      try {
     
        await new Promise((resolve) => setTimeout(resolve, 2000));

        hideLoading();

        
        clienteOriginal.value = { ...cliente.value };

        showSuccess(
          "Cliente atualizado!",
          `Os dados de ${cliente.value.nome} ${cliente.value.sobrenome} foram atualizados com sucesso.`,
          "Continuar"
        );

        showToast.success("Cliente atualizado com sucesso!");
      } catch (error) {
        hideLoading();
        showError(
          "Erro no servidor",
          "Ocorreu um erro ao salvar as alterações. Tente novamente."
        );
      } finally {
        isLoading.value = false;
      }
    }

    function resetarFormulario() {
      cliente.value = { ...clienteOriginal.value };
      erros.value = { dataNascimento: "" };
      showToast.info("Alterações desfeitas");
    }

    async function excluirCliente() {
      const confirmed = await confirmDelete(
        "Excluir cliente",
        `Tem certeza que deseja excluir ${cliente.value.nome} ${cliente.value.sobrenome}? Esta ação não pode ser desfeita.`,
        "Sim, excluir cliente"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Excluindo cliente...");

      try {
        
        await new Promise((resolve) => setTimeout(resolve, 2000));

        hideLoading();

        showSuccess(
          "Cliente excluído!",
          `${cliente.value.nome} ${cliente.value.sobrenome} foi excluído com sucesso.`
        );

        showToast.success("Cliente excluído com sucesso!");

        router.push("/cliente/consulta");
      } catch (error) {
        hideLoading();
        showError(
          "Erro ao excluir",
          "Ocorreu um erro ao excluir o cliente. Tente novamente."
        );
      } finally {
        isLoading.value = false;
      }
    }

    function voltarParaConsulta() {
      if (temAlteracoes.value) {
        confirmAction(
          "Alterações não salvas",
          "Você tem alterações não salvas. Deseja sair mesmo assim?",
          "Sim, sair"
        ).then((confirmed) => {
          if (confirmed) {
            router.push("/cliente/consulta");
          }
        });
      } else {
        router.push("/cliente/consulta");
      }
    }

    onMounted(() => {
      feather.replace();
      carregarCliente();
    });

    return {
      cliente,
      clienteOriginal,
      erros,
      erro,
      isLoading,
      temAlteracoes,
      listarAlteracoes,
      carregarCliente,
      validarIdade,
      submitForm,
      resetarFormulario,
      excluirCliente,
      voltarParaConsulta,
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
.btn-danger {
  background-color: #dc2626;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}
.spinner-border {
  width: 2rem;
  height: 2rem;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}
</style>
