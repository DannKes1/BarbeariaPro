<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Cadastrar Agendamento</h1>

    <form @submit.prevent="cadastrarAgendamento" class="space-y-4">
      <div>
        <label>Cliente</label>
        <select
          v-model="agendamento.cliente"
          class="input"
          required
          :disabled="isLoading"
        >
          <option disabled value="">Selecione um cliente</option>
          <option v-for="c in clientes" :key="c.cpf" :value="c.nome">
            {{ c.nome }} {{ c.sobrenome }} - {{ c.cpf }}
          </option>
        </select>
        <button
          type="button"
          class="text-blue-600 text-sm mt-1"
          @click="adicionarNovoCliente"
          :disabled="isLoading"
        >
          + Cadastrar novo cliente
        </button>
      </div>

      <div>
        <label>Serviço</label>
        <select
          v-model="agendamento.servico"
          class="input"
          required
          @change="filtrarProfissionais"
          :disabled="isLoading"
        >
          <option disabled value="">Selecione um serviço</option>
          <option v-for="s in servicos" :key="s.nome" :value="s.nome">
            {{ s.nome }} - R$ {{ s.preco }} ({{ s.duracao }}min)
          </option>
        </select>
      </div>

      <div>
        <label>Profissional</label>
        <select
          v-model="agendamento.profissional"
          class="input"
          required
          :disabled="isLoading || !agendamento.servico"
        >
          <option disabled value="">
            {{
              agendamento.servico
                ? "Selecione um profissional"
                : "Primeiro selecione um serviço"
            }}
          </option>
          <option
            v-for="p in profissionaisFiltrados"
            :key="p.nome"
            :value="p.nome"
          >
            {{ p.nome }} ({{ p.especialidade }})
          </option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label>Data</label>
          <input
            type="date"
            v-model="agendamento.data"
            class="input"
            required
            :min="dataMinima"
            :disabled="isLoading"
          />
        </div>

        <div>
          <label>Horário</label>
          <select
            v-model="agendamento.horario"
            class="input"
            required
            :disabled="isLoading || !agendamento.data"
          >
            <option disabled value="">
              {{
                agendamento.data
                  ? "Selecione um horário"
                  : "Primeiro selecione uma data"
              }}
            </option>
            <option v-for="h in horariosDisponiveis" :key="h" :value="h">
              {{ h }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <label>Observações</label>
        <textarea
          v-model="agendamento.observacoes"
          class="input"
          rows="3"
          placeholder="Observações adicionais (opcional)"
          :disabled="isLoading"
        ></textarea>
      </div>

      <div class="bg-gray-100 p-4 rounded">
        <h3 class="font-semibold mb-2">Resumo do Agendamento</h3>
        <div
          v-if="agendamento.servico && agendamento.data && agendamento.horario"
        >
          <p><strong>Serviço:</strong> {{ agendamento.servico }}</p>
          <p>
            <strong>Profissional:</strong>
            {{ agendamento.profissional || "Não selecionado" }}
          </p>
          <p><strong>Data/Hora:</strong> {{ formatarDataHora() }}</p>
          <p><strong>Valor:</strong> R$ {{ obterPrecoServico() }}</p>
        </div>
        <p v-else class="text-gray-500">Preencha os campos para ver o resumo</p>
      </div>

      <div class="flex gap-2">
        <button
          class="btn"
          type="submit"
          :disabled="isLoading || !formularioCompleto"
        >
          <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          {{ isLoading ? "Agendando..." : "Confirmar Agendamento" }}
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
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import feather from "feather-icons";

export default defineComponent({
  name: "AgendamentoCadastroView",
  setup() {
    const router = useRouter();
    const {
      showToast,
      showError,
      showSuccess,
      showLoading,
      hideLoading,
      confirmAction,
      showInput,
    } = useSweetAlert();

    const isLoading = ref(false);

    const clientes = ref([
      { nome: "João", sobrenome: "Silva", cpf: "123.456.789-00" },
      { nome: "Maria", sobrenome: "Santos", cpf: "987.654.321-00" },
    ]);

    const servicos = ref([
      {
        nome: "Corte Masculino",
        preco: "25.00",
        duracao: "30",
        especialidade: "Barbeiro",
      },
      {
        nome: "Corte Feminino",
        preco: "45.00",
        duracao: "60",
        especialidade: "Cabeleireiro",
      },
      {
        nome: "Barba",
        preco: "15.00",
        duracao: "20",
        especialidade: "Barbeiro",
      },
    ]);

    const profissionais = ref([
      { nome: "Carlos", especialidade: "Barbeiro" },
      { nome: "Ana", especialidade: "Cabeleireiro" },
      { nome: "Pedro", especialidade: "Barbeiro" },
    ]);

    const agendamento = ref({
      cliente: "",
      servico: "",
      profissional: "",
      data: "",
      horario: "",
      observacoes: "",
    });

    const profissionaisFiltrados = computed(() => {
      if (!agendamento.value.servico) return [];

      const servicoSelecionado = servicos.value.find(
        (s) => s.nome === agendamento.value.servico
      );
      if (!servicoSelecionado) return [];

      return profissionais.value.filter(
        (p) => p.especialidade === servicoSelecionado.especialidade
      );
    });

    const dataMinima = computed(() => {
      return new Date().toISOString().split("T")[0];
    });

    const horariosDisponiveis = computed(() => {
      return [
        "08:00",
        "08:30",
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
      ];
    });

    const formularioCompleto = computed(() => {
      return (
        agendamento.value.cliente &&
        agendamento.value.servico &&
        agendamento.value.profissional &&
        agendamento.value.data &&
        agendamento.value.horario
      );
    });

    function filtrarProfissionais() {
      agendamento.value.profissional = "";
    }

    function formatarDataHora() {
      if (!agendamento.value.data || !agendamento.value.horario) return "";

      const data = new Date(agendamento.value.data);
      const dataFormatada = data.toLocaleDateString("pt-BR");
      return `${dataFormatada} às ${agendamento.value.horario}`;
    }

    function obterPrecoServico() {
      const servico = servicos.value.find(
        (s) => s.nome === agendamento.value.servico
      );
      return servico ? servico.preco : "0.00";
    }

    async function adicionarNovoCliente() {
      const nome = await showInput(
        "Cadastro rápido de cliente",
        "Digite o nome completo do cliente",
        "text"
      );

      if (nome) {
        showToast.info("Redirecionando para cadastro completo...");
        router.push(`/cliente/cadastro?nome=${encodeURIComponent(nome)}`);
      }
    }

    async function cadastrarAgendamento() {
      if (!formularioCompleto.value) {
        showError(
          "Formulário incompleto",
          "Por favor, preencha todos os campos obrigatórios."
        );
        return;
      }

      const dataAgendamento = new Date(
        agendamento.value.data + "T" + agendamento.value.horario
      );
      const agora = new Date();

      if (dataAgendamento <= agora) {
        showError(
          "Data inválida",
          "O agendamento deve ser para uma data e horário futuros."
        );
        return;
      }

      const confirmed = await confirmAction(
        "Confirmar agendamento",
        `Confirmar agendamento para ${agendamento.value.cliente}?\\n\\n${formatarDataHora()}\\nServiço: ${agendamento.value.servico}\\nProfissional: ${agendamento.value.profissional}\\nValor: R$ ${obterPrecoServico()}`,
        "Sim, agendar"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Criando agendamento...");

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        hideLoading();

        showSuccess(
          "Agendamento criado!",
          `Agendamento para ${agendamento.value.cliente} foi criado com sucesso para ${formatarDataHora()}.`,
          "Continuar"
        );

        limparFormulario();

        showToast.success("Agendamento criado com sucesso!");
      } catch (error) {
        hideLoading();
        showError(
          "Erro no servidor",
          "Ocorreu um erro ao criar o agendamento. Tente novamente."
        );
      } finally {
        isLoading.value = false;
      }
    }

    function limparFormulario() {
      Object.assign(agendamento.value, {
        cliente: "",
        servico: "",
        profissional: "",
        data: "",
        horario: "",
        observacoes: "",
      });

      showToast.info("Formulário limpo");
    }

    onMounted(() => {
      feather.replace();
    });

    return {
      clientes,
      servicos,
      profissionais,
      agendamento,
      profissionaisFiltrados,
      dataMinima,
      horariosDisponiveis,
      formularioCompleto,
      isLoading,
      filtrarProfissionais,
      formatarDataHora,
      obterPrecoServico,
      adicionarNovoCliente,
      cadastrarAgendamento,
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
