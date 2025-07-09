<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Cadastrar Pagamento</h1>

    <form @submit.prevent="registrarPagamento" class="space-y-4">
      <div>
        <label class="block mb-1 font-semibold">Selecione o Agendamento</label>
        <select
          v-model="pagamento.agendamentoId"
          class="input"
          required
          @change="carregarDadosAgendamento"
          :disabled="isLoading"
        >
          <option disabled value="">Selecione um agendamento</option>
          <option
            v-for="ag in agendamentosPendentes"
            :key="ag.id"
            :value="ag.id.toString()"
          >
            {{ ag.cliente }} - {{ ag.servico }} ({{ formatarData(ag.data) }} {{ ag.horario }})
          </option>
        </select>
        <small class="text-gray-600">Apenas agendamentos concluídos e sem pagamento</small>
      </div>

      <div v-if="agendamentoSelecionado" class="bg-blue-50 p-4 rounded">
        <h3 class="font-semibold text-blue-800 mb-2">📋 Detalhes do Agendamento</h3>
        <div class="text-blue-700 space-y-1">
          <p><strong>Cliente:</strong> {{ agendamentoSelecionado.cliente }}</p>
          <p><strong>Serviço:</strong> {{ agendamentoSelecionado.servico }}</p>
          <p><strong>Profissional:</strong> {{ agendamentoSelecionado.profissional }}</p>
          <p><strong>Data/Hora:</strong> {{ formatarData(agendamentoSelecionado.data) }} {{ agendamentoSelecionado.horario }}</p>
          <p><strong>Valor do Serviço:</strong> R$ {{ agendamentoSelecionado.valor.toFixed(2) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-1 font-semibold">Forma de Pagamento</label>
          <select
            v-model="pagamento.forma"
            class="input"
            required
            :disabled="isLoading"
          >
            <option disabled value="">Selecione</option>
            <option value="dinheiro">💵 Dinheiro</option>
            <option value="cartao_debito">💳 Cartão de Débito</option>
            <option value="cartao_credito">💳 Cartão de Crédito</option>
            <option value="pix">📱 PIX</option>
            <option value="transferencia">🏦 Transferência</option>
          </select>
        </div>

        <div>
          <label class="block mb-1 font-semibold">Status do Pagamento</label>
          <select
            v-model="pagamento.status"
            class="input"
            required
            :disabled="isLoading"
          >
            <option disabled value="">Selecione</option>
            <option value="efetuado">✅ Efetuado</option>
            <option value="pendente">⏳ Pendente</option>
            <option value="cancelado">❌ Cancelado</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-1 font-semibold">Valor Pago (R$)</label>
          <input
            v-model.number="pagamento.valor"
            class="input"
            required
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            :disabled="isLoading"
          />
        </div>

        <div v-if="pagamento.valor > 0 && agendamentoSelecionado">
          <label class="block mb-1 font-semibold">Troco (R$)</label>
          <input
            :value="calcularTroco()"
            class="input bg-gray-100"
            readonly
            placeholder="0,00"
          />
        </div>
      </div>

      <div v-if="pagamento.forma === 'cartao_credito'">
        <label class="block mb-1 font-semibold">Número de Parcelas</label>
        <select
          v-model="pagamento.parcelas"
          class="input"
          :disabled="isLoading"
        >
          <option value="1">1x sem juros</option>
          <option value="2">2x sem juros</option>
          <option value="3">3x sem juros</option>
          <option value="4">4x sem juros</option>
          <option value="5">5x sem juros</option>
          <option value="6">6x sem juros</option>
        </select>
      </div>

      <div>
        <label class="block mb-1 font-semibold">Observações</label>
        <textarea
          v-model="pagamento.observacoes"
          class="input"
          rows="3"
          placeholder="Observações sobre o pagamento (opcional)"
          :disabled="isLoading"
        ></textarea>
      </div>

      <div
        v-if="pagamento.valor > 0 && agendamentoSelecionado"
        class="bg-green-50 p-4 rounded"
      >
        <h3 class="font-semibold text-green-800 mb-2">💰 Resumo do Pagamento</h3>
        <div class="text-green-700 space-y-1">
          <p><strong>Valor do Serviço:</strong> R$ {{ agendamentoSelecionado.valor.toFixed(2) }}</p>
          <p><strong>Valor Pago:</strong> R$ {{ pagamento.valor.toFixed(2) }}</p>
          <p><strong>Forma:</strong> {{ obterNomeFormaPagamento() }}</p>
          <p v-if="pagamento.forma === 'cartao_credito'"><strong>Parcelas:</strong> {{ pagamento.parcelas }}x</p>
          <p><strong>Troco:</strong> R$ {{ calcularTroco() }}</p>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          class="btn"
          type="submit"
          :disabled="isLoading || !formularioValido"
        >
          <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          {{ isLoading ? "Registrando..." : "Registrar Pagamento" }}
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
import { defineComponent, ref, computed, onMounted } from "vue";
import { useSweetAlert } from "@/composables/useSweetAlert";
import feather from "feather-icons";

interface Agendamento {
  id: number;
  cliente: string;
  servico: string;
  profissional: string;
  data: string; 
  horario: string; 
  valor: number; 
}

interface Pagamento {
  agendamentoId: string;
  forma: string;
  valor: number;
  status: string;
  parcelas: string; 
  observacoes: string;
}

export default defineComponent({
  name: "PagamentoCadastroView",
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

    
    const agendamentosPendentes = ref<Agendamento[]>([
      {
        id: 1,
        cliente: "João Silva",
        servico: "Corte Masculino",
        profissional: "Carlos",
        data: "2024-01-15",
        horario: "14:00",
        valor: 25.0,
      },
      {
        id: 2,
        cliente: "Maria Santos",
        servico: "Corte Feminino",
        profissional: "Ana",
        data: "2024-01-15",
        horario: "15:30",
        valor: 45.0,
      },
      {
        id: 3,
        cliente: "Pedro Oliveira",
        servico: "Barba",
        profissional: "Carlos",
        data: "2024-01-15",
        horario: "16:00",
        valor: 15.0,
      },
    ]);
    

    const pagamento = ref<Pagamento>({
      agendamentoId: "",
      forma: "",
      valor: 0,
      status: "efetuado",
      parcelas: "1",
      observacoes: "",
    });

    const agendamentoSelecionado = ref<Agendamento | null>(null);

    const formularioValido = computed(() => {
      return (
        pagamento.value.agendamentoId !== "" &&
        pagamento.value.forma !== "" &&
        pagamento.value.valor > 0 &&
        pagamento.value.status !== ""
      );
    });

    function formatarData(dataISO: string) {
      return new Date(dataISO).toLocaleDateString("pt-BR");
    }

    function carregarDadosAgendamento() {
      const agendamento = agendamentosPendentes.value.find(
        (ag) => ag.id.toString() === pagamento.value.agendamentoId
      );

      if (agendamento) {
        agendamentoSelecionado.value = agendamento;
        pagamento.value.valor = agendamento.valor;
      }
    }

    function calcularTroco(): string {
      if (!agendamentoSelecionado.value) return "0,00";

      const valorPago = pagamento.value.valor;
      const valorServico = agendamentoSelecionado.value.valor;
      const troco = valorPago - valorServico;

      return Math.max(0, troco).toFixed(2);
    }

    function obterNomeFormaPagamento() {
      const formas: Record<string, string> = {
        dinheiro: "Dinheiro",
        cartao_debito: "Cartão de Débito",
        cartao_credito: "Cartão de Crédito",
        pix: "PIX",
        transferencia: "Transferência",
      };
      return formas[pagamento.value.forma] || pagamento.value.forma;
    }

    async function registrarPagamento() {
      
      if (!formularioValido.value) {
        showError(
          "Formulário incompleto",
          "Por favor, preencha todos os campos obrigatórios."
        );
        return;
      }

      if (!agendamentoSelecionado.value) return;

      const valorPago = pagamento.value.valor;
      const valorServico = agendamentoSelecionado.value.valor;

      if (valorPago < valorServico) {
        showError(
          "Valor insuficiente",
          `O valor pago (R$ ${valorPago.toFixed(2)}) é menor que o valor do serviço (R$ ${valorServico.toFixed(2)}).`
        );
        return;
      }

      
      const troco = calcularTroco();
      const confirmed = await confirmAction(
        "Confirmar pagamento",
        `Registrar pagamento de R$ ${valorPago.toFixed(2)} para ${agendamentoSelecionado.value.cliente}?\n\nForma: ${obterNomeFormaPagamento()}\nTroco: R$ ${troco}`,
        "Sim, registrar"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Registrando pagamento...");

      try {
        
        await new Promise((resolve) => setTimeout(resolve, 2000));

        hideLoading();

   
        showSuccess(
          "Pagamento registrado!",
          `Pagamento de R$ ${valorPago.toFixed(2)} foi registrado com sucesso.\n\nCliente: ${agendamentoSelecionado.value.cliente}\nTroco: R$ ${troco}`,
          "Continuar"
        );

        
        agendamentosPendentes.value = agendamentosPendentes.value.filter(
          (ag) => ag.id.toString() !== pagamento.value.agendamentoId
        );

       
        limparFormulario();

        showToast.success("Pagamento registrado com sucesso!");
      } catch (error) {
        hideLoading();
        showError(
          "Erro no servidor",
          "Ocorreu um erro ao registrar o pagamento. Tente novamente."
        );
      } finally {
        isLoading.value = false;
      }
    }

    function limparFormulario() {
      Object.assign(pagamento.value, {
        agendamentoId: "",
        forma: "",
        valor: 0,
        status: "efetuado",
        parcelas: "1",
        observacoes: "",
      });

      agendamentoSelecionado.value = null;
      showToast.info("Formulário limpo");
    }

    onMounted(() => {
      feather.replace();
    });

    return {
      agendamentosPendentes,
      pagamento,
      agendamentoSelecionado,
      formularioValido,
      isLoading,
      formatarData,
      carregarDadosAgendamento,
      calcularTroco,
      obterNomeFormaPagamento,
      registrarPagamento,
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
