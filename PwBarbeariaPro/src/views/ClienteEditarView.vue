<template>
  <div class="p-6 md:p-10 max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl">
    <div class="mb-8 border-b pb-4 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Editar Cliente</h1>
        <button
          class="btn btn-secondary btn-sm mt-2"
          @click="voltarParaConsulta"
          :disabled="isLoading"
        >
          ← Voltar
        </button>
      </div>
    </div>

    <div v-if="!cliente && !erro" class="text-center py-12">
      <div class="spinner-border mx-auto mb-4" role="status"></div>
      <p class="text-gray-600">Carregando dados do cliente...</p>
    </div>

    <div v-if="erro" class="alert alert-danger text-sm">
      <strong>Erro:</strong> {{ erro }}
      <button class="btn btn-outline-secondary btn-sm mt-3" @click="carregarCliente">
        Tentar Novamente
      </button>
    </div>

    <form v-if="cliente" @submit.prevent="submitForm" class="space-y-6">
      <div class="form-group">
        <label for="nome">Nome</label>
        <input
          v-model="cliente.nome"
          id="nome"
          class="form-control"
          required
          pattern="[A-Za-zÀ-ÿ ]+"
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="sobrenome">Sobrenome</label>
        <input
          v-model="cliente.sobrenome"
          id="sobrenome"
          class="form-control"
          required
          pattern="[A-Za-zÀ-ÿ ]+"
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="telefone">Telefone</label>
        <input
          v-model="cliente.telefone"
          @input="formatarTelefone"
          id="telefone"
          class="form-control"
          maxlength="15"
          required
          placeholder="(11) 98765-4321"
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="cpf">CPF</label>
          <input
            v-model="cliente.cpf"
            @input="formatarCPF"
            id="cpf"
            class="form-control bg-light"
            maxlength="14"
            readonly
          />
        <small class="form-text text-muted">CPF não pode ser alterado</small>
      </div>

      <div class="form-group">
        <label for="email">E-mail</label>
        <input
          v-model="cliente.email"
          id="email"
          class="form-control"
          type="email"
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="dataNascimento">Data de Nascimento</label>
        <input
          v-model="cliente.dataNascimento"
          id="dataNascimento"
          class="form-control"
          type="date"
          required
          @change="validarIdade"
          :disabled="isLoading"
        />
        <div v-if="erros.dataNascimento" class="text-danger mt-2 text-sm">
          {{ erros.dataNascimento }}
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 justify-start mt-4">
        <button
          class="btn btn-primary"
          type="submit"
          :disabled="isLoading || !temAlteracoes"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ isLoading ? 'Salvando...' : 'Salvar Alterações' }}
        </button>

        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="resetarFormulario"
          :disabled="isLoading || !temAlteracoes"
        >
          Desfazer
        </button>

        <button
          type="button"
          class="btn btn-outline-danger"
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
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSweetAlert } from '@/composables/useSweetAlert';
import { api } from '@/common/http';

export default defineComponent({
  name: 'ClienteEditarView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { showToast, showError, showSuccess, showLoading, hideLoading, confirmAction, confirmDelete } = useSweetAlert();
    const isLoading = ref(false);
    const erro = ref('');
    const cliente = ref<any>(null);
    const clienteOriginal = ref<any>(null);
    const erros = ref<{ dataNascimento: string }>({ dataNascimento: '' });

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

    const carregarCliente = async () => {
      const id = String(route.params.id || '');
      if (!id) {
        erro.value = 'ID não informado na URL';
        return;
      }
      isLoading.value = true;
      erro.value = '';
      try {
        const response = await api.get(`/api/Cliente/${id}`);
        cliente.value = response.data;
        clienteOriginal.value = { ...response.data };
      } catch {
        erro.value = 'Erro ao carregar dados do cliente';
        showError('Erro ao carregar', 'Não foi possível carregar dados do cliente.');
      } finally {
        isLoading.value = false;
      }
    };

    const validarIdade = (): boolean => {
      const hoje = new Date();
      const nascimento = new Date(cliente.value.dataNascimento);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mesAtraso = hoje.getMonth() < nascimento.getMonth() || (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
      if (mesAtraso) idade--;
      if (idade < 16) {
        erros.value.dataNascimento = 'Cliente deve ter pelo menos 16 anos.';
        return false;
      }
      erros.value.dataNascimento = '';
      return true;
    };

    const submitForm = async () => {
      if (!validarIdade()) {
        showError('Dados inválidos', 'Por favor, corrija os erros no formulário.');
        return;
      }
      const confirmado = await confirmAction('Confirmar alterações', 'Salvar alterações deste cliente?', 'Sim, salvar');
      if (!confirmado) return;

      isLoading.value = true;
      showLoading('Salvando alterações...');
      try {
        await api.put(`/api/Cliente/${cliente.value.id}`, cliente.value);
        clienteOriginal.value = { ...cliente.value };
        showSuccess('Cliente atualizado!', 'Os dados foram salvos com sucesso.');
        showToast('Cliente atualizado com sucesso!');
      } catch {
        showError('Erro no servidor', 'Não foi possível salvar alterações.');
      } finally {
        hideLoading();
        isLoading.value = false;
      }
    };

    const resetarFormulario = () => {
      if (clienteOriginal.value) cliente.value = { ...clienteOriginal.value };
      erros.value.dataNascimento = '';
      showToast('Alterações desfeitas');
    };

    const excluirCliente = async () => {
      const confirmado = await confirmDelete('Excluir cliente', `Tem certeza que deseja excluir ${cliente.value.nome}?`, 'Sim, excluir');
      if (!confirmado) return;

      isLoading.value = true;
      showLoading('Excluindo cliente...');
      try {
        await api.delete(`/api/Cliente/${cliente.value.id}`);
        showSuccess('Cliente excluído!', 'O cliente foi removido com sucesso');
        showToast('Cliente excluído com sucesso!');
        router.push('/cliente/consulta');
      } catch {
        showError('Erro ao excluir', 'Não foi possível excluir o cliente.');
      } finally {
        hideLoading();
        isLoading.value = false;
      }
    };

    const voltarParaConsulta = async () => {
      if (temAlteracoes.value) {
        const confirmado = await confirmAction('Alterações não salvas', 'Você tem alterações não salvas. Deseja sair mesmo assim?', 'Sim, sair');
        if (!confirmado) return;
      }
      router.push('/cliente/consulta');
    };

    onMounted(() => carregarCliente());

      const formatarCPF = (e: Event) => {
      const input = e.target as HTMLInputElement;
      let value = input.value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      input.value = value;
      cliente.value.cpf = value;
    };

    const formatarTelefone = (e: Event) => {
      const input = e.target as HTMLInputElement;
      let value = input.value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
      input.value = value;
      cliente.value.telefone = value;
    };

    return {
      cliente,
      formatarTelefone,
      formatarCPF,
      clienteOriginal,
      erros,
      erro,
      isLoading,
      temAlteracoes,
      carregarCliente,
      validarIdade,
      submitForm,
      resetarFormulario,
      excluirCliente,
      voltarParaConsulta
    };
  }
});
</script>

<style scoped>
.input {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.75rem;
  width: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
}

.btn {
  background-color: #4f46e5;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  display: inline-block;
}

.btn-secondary {
  background-color: #6b7280;
}

.btn-danger {
  background-color: #dc2626;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-danger-sm {
  background-color: #dc2626;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
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
  to { transform: rotate(360deg); }
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  display: block;
}

.text-sm { font-size: 0.875rem; }

.text-gray-600 { color: #4b5563; }

.text-gray-700 { color: #374151; }

.text-blue-700 { color: #3b82f6; }

.text-blue-800 { color: #1d4ed8; }

.bg-blue-50 { background-color: #eff6ff; }

.bg-red-100 { background-color: #fee2e2; }

.border { border: 1px solid #e5e7eb; }

.rounded-lg { border-radius: 8px; }

.shadow-xl { box-shadow: 0 10px 15px rgba(0,0,0,0.1); }

.cursor-pointer:hover { background-color: #f3f4f6; }
</style>
