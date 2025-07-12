<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Cadastrar Cliente</h1>

    <!-- Indicador de valores lembrados -->
    <div
      v-if="cookieInfo.hasLastValues"
      class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md"
    >
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
          <button
            @click="clearRememberedValues"
            class="text-blue-600 underline ml-1"
          >
            Limpar valores salvos
          </button>
        </span>
      </div>
    </div>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label>Nome</label>
        <input
          v-model="cliente.nome"
          class="input"
          required
          pattern="[A-Za-zÀ-ü ]+"
          :disabled="isLoading"
          @blur="rememberFieldValue('nome')"
        />
        <small v-if="hasRememberedValue('nome')" class="text-gray-500">
          💾 Valor lembrado dos últimos dados inseridos
        </small>
      </div>

      <div>
        <label>Sobrenome</label>
        <input
          v-model="cliente.sobrenome"
          class="input"
          required
          pattern="[A-Za-zÀ-ü ]+"
          :disabled="isLoading"
          @blur="rememberFieldValue('sobrenome')"
        />
        <small v-if="hasRememberedValue('sobrenome')" class="text-gray-500">
          💾 Valor lembrado dos últimos dados inseridos
        </small>
      </div>

      <div>
        <label>Telefone</label>
        <input
          v-model="cliente.telefone"
          class="input"
          required
          placeholder="(11) 98765-4321"
          :disabled="isLoading"
          @input="formatarTelefone"
          @blur="rememberFieldValue('telefone')"
        />
        <small v-if="hasRememberedValue('telefone')" class="text-gray-500">
          💾 Valor lembrado dos últimos dados inseridos
        </small>
      </div>

      <div>
        <label>CPF</label>
        <input
          v-model="cliente.cpf"
          class="input"
          required
          :disabled="isLoading"
          @input="formatarCPF"
        />
        <p v-if="erros.cpf" class="text-red-500 text-sm">{{ erros.cpf }}</p>
      </div>

      <div>
        <label>E-mail</label>
        <input
          v-model="cliente.email"
          class="input"
          type="email"
          :disabled="isLoading"
          @blur="rememberFieldValue('email')"
        />
        <small v-if="hasRememberedValue('email')" class="text-gray-500">
          💾 Valor lembrado dos últimos dados inseridos
        </small>
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

    <!-- Debug info (apenas para demonstração) -->
    <div v-if="showDebugInfo" class="mt-6 p-4 bg-gray-50 border rounded-md">
      <h3 class="font-semibold mb-2">Informações dos Cookies (Debug)</h3>
      <pre class="text-xs">{{ JSON.stringify(cookieInfo, null, 2) }}</pre>
      <button @click="showDebugInfo = false" class="text-sm text-gray-600 mt-2">
        Ocultar debug
      </button>
    </div>

    <button
      v-else
      @click="showDebugInfo = true"
      class="mt-4 text-sm text-gray-500 underline"
    >
      Mostrar informações dos cookies (debug)
    </button>
  </div>
</template>
]
<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useSweetAlert } from '@/composables/useSweetAlert';
import { useFormCookies } from '@/composables/useFormCookies';
import { api } from '@/common/http';

export default defineComponent({
  name: 'ClienteCadastroView',
  setup() {
    const { showToast, showError, showSuccess, showLoading, hideLoading, confirmAction } = useSweetAlert();

    const isLoading = ref(false);
    const showDebugInfo = ref(false);

    const cliente = ref({
      nome: '',
      sobrenome: '',
      telefone: '',
      cpf: '',
      email: '',
      dataNascimento: '',
    });

    const erros = ref({
      cpf: '',
      dataNascimento: '',
    });

    const {
      canUseCookies,
      lastValues,
      saveLastValues,
      loadLastValues,
      clearFormCookies,
      getCookieInfo,
      rememberValue,
      getRememberedValue,
      hasRememberedValue,
    } = useFormCookies(cliente.value, {
      formKey: 'cliente_cadastro',
      rememberFields: ['nome', 'sobrenome', 'telefone', 'email'],
      expirationDays: 30,
    });

    const cookieInfo = computed(() => getCookieInfo());

    
    function validarIdade(): boolean {
      const hoje = new Date();
      const nascimento = new Date(cliente.value.dataNascimento);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mesPassou = hoje.getMonth() > nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() >= nascimento.getDate());
      if (!mesPassou) idade--;

      if (idade < 16) {
        erros.value.dataNascimento = 'Cliente deve ter pelo menos 16 anos.';
        return false;
      }

      erros.value.dataNascimento = '';
      return true;
    }

    async function submitForm() {
      if (!cliente.value.nome || !cliente.value.sobrenome || !cliente.value.telefone || !cliente.value.cpf || !cliente.value.dataNascimento) {
        showError('Campos obrigatórios', 'Preencha todos os campos obrigatórios.');
        return;
      }


      const confirmado = await confirmAction(
        'Confirmar cadastro',
        `Deseja cadastrar ${cliente.value.nome} ${cliente.value.sobrenome}?`,
        'Sim, cadastrar'
      );
      if (!confirmado) return;

      isLoading.value = true;
      showLoading('Cadastrando cliente...');

      try {
        const dataFormatada = cliente.value.dataNascimento
          ? new Date(cliente.value.dataNascimento).toISOString().split('T')[0]
          : null;

        const payload = {
           id: Math.floor(Math.random() * 1000000),
          nome: cliente.value.nome,
          sobrenome: cliente.value.sobrenome,
          telefone: cliente.value.telefone,
          email: cliente.value.email,
          cpf: cliente.value.cpf.replace(/[^\d]/g, ''),
          dataNascimento: dataFormatada,
        };

        await api.post('/api/Cliente', payload);

        saveLastValues();

        showSuccess('Cliente cadastrado!', 'Cadastro realizado com sucesso.');
        showToast.success('Cliente cadastrado com sucesso!');
        limparFormulario();
      } catch (error: any) {
        if (error.response?.status === 409) {
          showError('CPF duplicado', 'Já existe um cliente com esse CPF.');
        } else if (error.response?.data?.errors) {
          const errosAPI = error.response.data.errors;
          showError('Erro de validação', JSON.stringify(errosAPI, null, 2));
        } else {
          showError('Erro ao cadastrar', 'Não foi possível concluir o cadastro.');
        }
      } finally {
        hideLoading();
        isLoading.value = false;
      }
    }

    function limparFormulario() {
      Object.assign(cliente.value, {
        nome: '',
        sobrenome: '',
        telefone: '',
        cpf: '',
        email: '',
        dataNascimento: '',
      });

      erros.value = { cpf: '', dataNascimento: '' };
      showToast.info('Formulário limpo');
    }

    function rememberFieldValue(field: string) {
      if (cliente.value[field as keyof typeof cliente.value]) {
        rememberValue(field, cliente.value[field as keyof typeof cliente.value]);
      }
    }

    function clearRememberedValues() {
      clearFormCookies();
      showToast.info('Valores salvos foram limpos');
    }

    onMounted(() => {
      loadLastValues();
    });

    function formatarTelefone(e: Event) {
      let valor = (e.target as HTMLInputElement).value.replace(/\D/g, '');
      if (valor.length > 11) valor = valor.slice(0, 11);

      if (valor.length <= 10) {
        cliente.value.telefone = valor.replace(
          /(\d{2})(\d{4})(\d{0,4})/,
          '($1) $2-$3'
        );
      } else {
        cliente.value.telefone = valor.replace(
          /(\d{2})(\d{5})(\d{0,4})/,
          '($1) $2-$3'
        );
      }
    }

    function formatarCPF(e: Event) {
      let valor = (e.target as HTMLInputElement).value.replace(/\D/g, '');
      if (valor.length > 11) valor = valor.slice(0, 11);
      cliente.value.cpf = valor.replace(
        /(\d{3})(\d{3})(\d{3})(\d{0,2})/,
        '$1.$2.$3-$4'
      );
    }

    return {
      cliente,
      erros,
      isLoading,
      showDebugInfo,
      cookieInfo,
      validarIdade,
      submitForm,
      limparFormulario,
      rememberFieldValue,
      clearRememberedValues,
      hasRememberedValue,
      canUseCookies,
      formatarCPF,
      formatarTelefone
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
</style>
