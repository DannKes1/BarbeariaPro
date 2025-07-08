<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Abrir Caixa</h1>

    <div v-if="caixaAberto" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <strong>Caixa já está aberto!</strong>
      <p>Responsável: {{ caixaAtual.responsavel }}</p>
      <p>Aberto em: {{ formatarDataHora(caixaAtual.dataAbertura) }}</p>
      <p>Saldo inicial: R$ {{ caixaAtual.saldoInicial }}</p>
      <button class="btn-danger mt-2" @click="fecharCaixa">
        Fechar Caixa
      </button>
    </div>

    <form v-else @submit.prevent="abrirCaixa" class="space-y-4">
      <div>
        <label>Saldo Inicial (R$)</label>
        <input
          v-model="caixa.saldoInicial"
          type="number"
          step="0.01"
          min="0"
          class="input"
          required
          placeholder="0,00"
          :disabled="isLoading"
        />
        <small class="text-gray-600">Valor em dinheiro disponível no início do expediente</small>
      </div>

      <div>
        <label>Responsável</label>
        <select 
          v-model="caixa.responsavel" 
          class="input" 
          required
          :disabled="isLoading"
        >
          <option disabled value="">Selecione um profissional</option>
          <option v-for="p in profissionais" :key="p.nome" :value="p.nome">
            {{ p.nome }} ({{ p.especialidade }})
          </option>
        </select>
      </div>

      <div>
        <label>Observações</label>
        <textarea
          v-model="caixa.observacoes"
          class="input"
          rows="3"
          placeholder="Observações sobre a abertura do caixa (opcional)"
          :disabled="isLoading"
        ></textarea>
      </div>

      <div class="bg-blue-50 p-4 rounded">
        <h3 class="font-semibold text-blue-800 mb-2">ℹ️ Informações Importantes</h3>
        <ul class="text-blue-700 text-sm space-y-1">
          <li>• O caixa deve ser aberto no início de cada expediente</li>
          <li>• Apenas um caixa pode estar aberto por vez</li>
          <li>• O responsável será registrado para auditoria</li>
          <li>• Confira o saldo inicial antes de confirmar</li>
        </ul>
      </div>

      <div class="flex gap-2">
        <button 
          type="submit" 
          class="btn"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ isLoading ? 'Abrindo...' : 'Abrir Caixa' }}
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
import { defineComponent, ref, onMounted } from "vue";
import { useSweetAlert } from '@/composables/useSweetAlert'
import feather from "feather-icons";

export default defineComponent({
  name: "AbrirCaixaView",
  setup() {
    const { 
      showToast, 
      showError, 
      showSuccess, 
      showLoading, 
      hideLoading,
      confirmAction,
      confirmWithInput
    } = useSweetAlert()
    
    const isLoading = ref(false)
    const caixaAberto = ref(false)

    const profissionais = ref([
      { nome: "Carlos Silva", especialidade: "Barbeiro" },
      { nome: "Ana Santos", especialidade: "Esteticista" },
      { nome: "Pedro Oliveira", especialidade: "Gerente" },
    ]);

    const caixa = ref({
      saldoInicial: "",
      responsavel: "",
      observacoes: ""
    });

    const caixaAtual = ref({
      responsavel: "",
      saldoInicial: "",
      dataAbertura: "",
      observacoes: ""
    });

    function formatarDataHora(dataISO: string) {
      if (!dataISO) return "";
      return new Date(dataISO).toLocaleString('pt-BR');
    }

    async function abrirCaixa() {
      // Validações
      if (!caixa.value.saldoInicial || parseFloat(caixa.value.saldoInicial) < 0) {
        showError('Saldo inválido', 'Por favor, informe um saldo inicial válido.');
        return;
      }

      if (!caixa.value.responsavel) {
        showError('Responsável obrigatório', 'Por favor, selecione um responsável.');
        return;
      }

      // Confirmar abertura
      const confirmed = await confirmAction(
        'Confirmar abertura do caixa',
        `Abrir caixa com saldo inicial de R$ ${caixa.value.saldoInicial}?\\n\\nResponsável: ${caixa.value.responsavel}`,
        'Sim, abrir caixa'
      );
      
      if (!confirmed) return;

      isLoading.value = true;
      showLoading('Abrindo caixa...');

      try {
        // Simular chamada de API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular abertura do caixa
        caixaAtual.value = {
          responsavel: caixa.value.responsavel,
          saldoInicial: caixa.value.saldoInicial,
          dataAbertura: new Date().toISOString(),
          observacoes: caixa.value.observacoes
        };
        
        caixaAberto.value = true;
        
        hideLoading();
        
        // Mostrar sucesso
        showSuccess(
          'Caixa aberto!',
          `Caixa aberto com sucesso por ${caixa.value.responsavel}.\\nSaldo inicial: R$ ${caixa.value.saldoInicial}`,
          'Continuar'
        );
        
        // Limpar formulário
        limparFormulario();
        
        // Toast de confirmação
        showToast.success('Caixa aberto com sucesso!');
        
      } catch (error) {
        hideLoading();
        showError('Erro no servidor', 'Ocorreu um erro ao abrir o caixa. Tente novamente.');
      } finally {
        isLoading.value = false;
      }
    }

    async function fecharCaixa() {
      // Solicitar saldo final
      const result = await confirmWithInput(
        'Fechar caixa',
        'Digite o saldo final em dinheiro (R$)',
        'Fechar caixa'
      );
      
      if (!result.isConfirmed) return;
      
      const saldoFinal = parseFloat(result.value);
      if (isNaN(saldoFinal) || saldoFinal < 0) {
        showError('Saldo inválido', 'Por favor, digite um valor válido.');
        return;
      }

      isLoading.value = true;
      showLoading('Fechando caixa...');

      try {
        // Simular chamada de API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const saldoInicial = parseFloat(caixaAtual.value.saldoInicial);
        const diferenca = saldoFinal - saldoInicial;
        
        hideLoading();
        
        // Mostrar resultado do fechamento
        showSuccess(
          'Caixa fechado!',
          `Caixa fechado com sucesso.\\n\\nSaldo inicial: R$ ${saldoInicial.toFixed(2)}\\nSaldo final: R$ ${saldoFinal.toFixed(2)}\\nDiferença: R$ ${diferenca.toFixed(2)}`,
          'Continuar'
        );
        
        caixaAberto.value = false;
        caixaAtual.value = {
          responsavel: "",
          saldoInicial: "",
          dataAbertura: "",
          observacoes: ""
        };
        
        showToast.success('Caixa fechado com sucesso!');
        
      } catch (error) {
        hideLoading();
        showError('Erro no servidor', 'Ocorreu um erro ao fechar o caixa. Tente novamente.');
      } finally {
        isLoading.value = false;
      }
    }

    function limparFormulario() {
      Object.assign(caixa.value, {
        saldoInicial: "",
        responsavel: "",
        observacoes: ""
      });
      
      showToast.info('Formulário limpo');
    }

    onMounted(() => {
      feather.replace();
      
      // Simular verificação se já existe caixa aberto
      // Em produção, isso viria de uma API
      const caixaExistente = localStorage.getItem('caixaAberto');
      if (caixaExistente) {
        caixaAtual.value = JSON.parse(caixaExistente);
        caixaAberto.value = true;
      }
    });

    return {
      profissionais,
      caixa,
      caixaAtual,
      caixaAberto,
      isLoading,
      formatarDataHora,
      abrirCaixa,
      fecharCaixa,
      limparFormulario
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
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
textarea.input {
  resize: vertical;
  min-height: 80px;
}
</style>