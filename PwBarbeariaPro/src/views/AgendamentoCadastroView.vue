<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Cadastrar Agendamento</h1>
    </div>

    <form @submit.prevent="cadastrarAgendamento" class="client-form">
      <div class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Cliente</label>
            <select
              v-model="agendamento.cliente"
              class="form-select"
              required
              :disabled="isLoading"
            >
              <option disabled value="">Selecione um cliente</option>
              <option v-for="c in clientes" :key="c.id" :value="c.id">
                {{ c.nome }} {{ c.sobrenome }} - {{ c.cpf }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Serviço</label>
            <select
              v-model="agendamento.servico"
              class="form-select"
              required
              @change="filtrarProfissionais"
              :disabled="isLoading"
            >
              <option disabled value="">Selecione um serviço</option>
              <option v-for="s in servicos" :key="s.id" :value="s.id">
                {{ s.nome }} - R$ {{ s.valor }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Profissional</label>
            <select
              v-model="agendamento.profissional"
              class="form-select"
              required
              :disabled="isLoading || !agendamento.servico"
            >
              <option value="">Selecione um Profissional</option>
              <option
                v-for="p in profissionais"
                :key="p.id"
                :value="p.id"
              >
                {{ p.nome }} ({{ p.especialidade }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Data</label>
            <input
              type="date"
              v-model="agendamento.data"
              class="form-input"
              required
              :min="dataMinima"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Horário</label>
            <select
              v-model="agendamento.horario"
              class="form-select"
              required
              :disabled="isLoading || !agendamento.data"
            >
              <option disabled value="">
                {{ agendamento.data ? "Selecione um horário" : "Primeiro selecione uma data" }}
              </option>
              <option v-for="h in horariosDisponiveis" :key="h" :value="h">
                {{ h }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Observações</label>
          <textarea
            v-model="agendamento.observacoes"
            class="form-textarea"
            rows="3"
            placeholder="Observações adicionais (opcional)"
            :disabled="isLoading"
          ></textarea>
        </div>

        <div class="form-actions">
          <div class="actions-group">
            <button
              class="btn btn-primary"
              type="submit"
              :disabled="isLoading || !formularioCompleto"
            >
              <span
                v-if="isLoading"
                class="loading-spinner"
                role="status"
              ></span>
              {{ isLoading ? "Agendando..." : "Confirmar Agendamento" }}
            </button>

            <button
              type="button"
              class="btn btn-secondary"
              @click="limparFormulario"
              :disabled="isLoading"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import feather from "feather-icons";
import { api } from "@/common/http"; 

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
    } = useSweetAlert();

    const isLoading = ref(false);

    const clientes = ref([]);
    const servicos = ref([]);
    const profissionais = ref([]);

    const agendamento = ref({
      cliente: "",
      servico: "",
      profissional: "",
      data: "",
      horario: "",
      observacoes: "",
    });

    const carregarDados = async () => {
      try {
        const clientesResponse = await api.get("/api/Cliente");
        clientes.value = clientesResponse.data;

        const servicosResponse = await api.get("/api/Servico");
        servicos.value = servicosResponse.data;

        const profissionaisResponse = await api.get("/api/Profissional");
        profissionais.value = profissionaisResponse.data;
      } catch (error) {
        showError("Erro ao carregar dados", "Não foi possível carregar os dados necessários.");
      }
    };

    const profissionaisFiltrados = computed(() => {
      if (!agendamento.value.servico) return [];

      const servicoSelecionado = servicos.value.find(
        (s) => s.id === agendamento.value.servico
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
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
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

    function obterNomeServico() {
      const servico = servicos.value.find(s => s.id === agendamento.value.servico);
      return servico ? servico.nome : "";
    }

    function obterNomeProfissional() {
      const profissional = profissionais.value.find(p => p.id === agendamento.value.profissional);
      return profissional ? profissional.nome : "";
    }

    async function cadastrarAgendamento() {
      if (!formularioCompleto.value) {
        showError("Formulário incompleto", "Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      const dataAgendamento = new Date(
        agendamento.value.data + "T" + agendamento.value.horario
      );
      const agora = new Date();

      if (dataAgendamento <= agora) {
        showError("Data inválida", "O agendamento deve ser para uma data e horário futuros.");
        return;
      }

      const confirmed = await confirmAction(
        "Confirmar agendamento",
        `Confirmar agendamento para ${agendamento.value.cliente}?\\n\\n${formatarDataHora()}\\nServiço: ${obterNomeServico()}\\nProfissional: ${obterNomeProfissional() || "Não selecionado"}\\nValor: R$ ${obterPrecoServico()}`,
        "Sim, agendar"
      );

      if (!confirmed) return;

      isLoading.value = true;
      showLoading("Criando agendamento...");

      try {
        const agendamentoApi = {
          DataHorario: dataAgendamento.toISOString(),
          Status: "Agendado",
          Observacoes: agendamento.value.observacoes,
          MotivoCancelamento: null,
          ServicoFk: servicos.value.find(s => s.id === agendamento.value.servico)?.id,
          ClienteFk: clientes.value.find(c => c.id === agendamento.value.cliente)?.id,
          ProfissionalFk: profissionais.value.find(p => p.id === agendamento.value.profissional)?.id
        };

        const response = await api.post("/api/agendamento", agendamentoApi);

        hideLoading();
        showSuccess("Agendamento criado!", `Agendamento para ${agendamento.value.cliente} foi criado com sucesso para ${formatarDataHora()}.`);
        limparFormulario();
        router.push("/agendamento/consulta");
      } catch (error) {
        hideLoading();
        showError("Erro no servidor", "Ocorreu um erro ao criar o agendamento. Tente novamente.");
      } finally {
        isLoading.value = false;
      }
    }

    function formatarDataHora() {
      if (!agendamento.value.data || !agendamento.value.horario) return "";
      const data = new Date(agendamento.value.data);
      const dataFormatada = data.toLocaleDateString("pt-BR");
      return `${dataFormatada} às ${agendamento.value.horario}`;
    }

    function obterPrecoServico() {
      const servico = servicos.value.find(s => s.id === agendamento.value.servico);
      return servico ? servico.preco : "0.00";
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
      carregarDados();
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
      cadastrarAgendamento,
      limparFormulario,
      formatarDataHora,
      obterPrecoServico,
    };
  },
});
</script>

<style scoped>

.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}


.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}


.client-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}


.form-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #d1d5db;
}


.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
}


.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}


.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  background: #ffffff;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled,
.form-select:disabled,
.form-textarea:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}


.input-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-weight: 500;
}


.form-actions {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f3f4f6;
}

.actions-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}


.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  min-width: 160px;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: #ffffff;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}


.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


.icon-check::before {
  content: "✓";
}

.icon-refresh::before {
  content: "↻";
}


@media (max-width: 768px) {
  .form-container {
    padding: 1rem;
    margin: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .actions-group {
    flex-direction: column-reverse;
    gap: 1rem;
  }

  .btn {
    width: 100%;
  }

  .form-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .form-container {
    margin: 0.5rem;
    padding: 0.75rem;
  }

  .form-section {
    padding: 1rem;
  }
}
</style>
