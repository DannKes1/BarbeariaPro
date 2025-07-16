<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Consultar Agendamentos</h1>
      <div class="header-actions"></div>
    </div>

    <div class="form-section">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Buscar por cliente</label>
          <input
            v-model="filtro.nome"
            type="text"
            placeholder="Buscar por cliente"
            class="form-input"
          />
        </div>
      </div>

      <div v-if="agendamentosFiltrados.length">
        <table class="min-w-full border text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="border px-4 py-2">Cliente</th>
              <th class="border px-4 py-2">Serviço</th>
              <th class="border px-4 py-2">Profissional</th>
              <th class="border px-4 py-2">Data</th>
              <th class="border px-4 py-2">Status</th>
              <th class="border px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in agendamentosFiltrados" :key="a.id">
              <td class="border px-4 py-2">
                {{ a.cliente?.nome || "Não disponível" }}
              </td>
              <td class="border px-4 py-2">
                {{ a.servico?.nome || "Não disponível" }}
              </td>
              <td class="border px-4 py-2">
                {{ a.profissional?.nome || "Não disponível" }}
              </td>
              <td class="border px-4 py-2">
                {{ formatarData(a.dataHorario) }}
              </td>
              <td class="border px-4 py-2">
                {{ a.status || "Não disponível" }}
              </td>
              <td class="border px-4 py-2">
                <div class="card-actions">
                  <router-link
                    :to="`/agendamento/editar/${a.id}`"
                    class="btn btn-secondary btn-sm"
                  >
                    <i class="icon-edit"></i>
                    Editar
                  </router-link>
                  <button
                    class="btn btn-danger btn-sm"
                    @click="cancelarAgendamento(a)"
                  >
                    <i class="icon-trash"></i>

                    Cancelar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-gray-600 mt-4">Nenhum agendamento encontrado.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { api } from "@/common/http";
import { useSweetAlert } from "@/composables/useSweetAlert";
import feather from "feather-icons";

export default defineComponent({
  name: "AgendamentoConsultaView",
  setup() {
    const filtro = ref({ nome: "", data: "" });
    const agendamentos = ref<any[]>([]);
    const { showError, showSuccess } = useSweetAlert();

    const agendamentosFiltrados = computed(() => {
      return agendamentos.value.filter((a) => {
        const nomeOk = a.cliente?.nome
          .toLowerCase()
          .includes(filtro.value.nome.toLowerCase());
        const dataOk = !filtro.value.data || a.data === filtro.value.data;
        return nomeOk && dataOk;
      });
    });

    async function carregarAgendamentos() {
      try {
        const { data } = await api.get("/api/Agendamento");

        const agendamentosCompletos = await Promise.all(
          data.map(async (agendamento: any) => {
            const clienteResponse = await api.get(
              `/api/Cliente/${agendamento.clienteFk}`
            );
            const servicoResponse = await api.get(
              `/api/Servico/${agendamento.servicoFk}`
            );
            const profissionalResponse = await api.get(
              `/api/Profissional/${agendamento.profissionalFk}`
            );

            return {
              ...agendamento,
              cliente: clienteResponse.data,
              servico: servicoResponse.data,
              profissional: profissionalResponse.data,
            };
          })
        );

        agendamentos.value = agendamentosCompletos;
      } catch (error) {
        showError("Erro", "Erro ao carregar agendamentos.");
        console.error("Erro ao carregar agendamentos:", error);
      }
    }

    async function cancelarAgendamento(a: any) {
      const confirmado = window.confirm(
        `Cancelar agendamento de ${a.cliente?.nome}?`
      );
      if (!confirmado) return;

      try {
        await api.delete(`/api/Agendamento/${a.id}`);
        agendamentos.value = agendamentos.value.filter((x) => x.id !== a.id);
        showSuccess("Cancelado", "Agendamento cancelado com sucesso.");
      } catch (error) {
        showError("Erro", "Erro ao cancelar o agendamento.");
        console.error("Erro ao cancelar agendamento:", error);
      }
    }

    function formatarData(dataISO: string): string {
      const data = new Date(dataISO);
      const dia = String(data.getDate()).padStart(2, "0");
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    }
    onMounted(() => {
      feather.replace();
      carregarAgendamentos();
    });

    return {
      filtro,
      agendamentosFiltrados,
      cancelarAgendamento,
      formatarData,
    };
  },
});
</script>

<style scoped>
.form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.header-actions {
  margin-top: 0;
  justify-content: flex-end;
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
  margin: 0 0 1.5rem 0;
}

.form-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #d1d5db;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.results-count {
  font-size: 0.875rem;
  color: #6b7280;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: block;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  background: #ffffff;
  width: 100%;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
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

.btn-danger {
  background: #ffffff;
  color: #ef4444;
  border: 2px solid #fecaca;
}

.btn-danger:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #f87171;
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
  background: #ffffff;
  border-radius: 6px;
  padding: 0.25rem;
  border: 1px solid #d1d5db;
}

.toggle-btn {
  padding: 0.5rem;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  color: #6b7280;
}

.toggle-btn.active {
  background: #3b82f6;
  color: #ffffff;
}

.toggle-btn:hover:not(.active) {
  background: #f3f4f6;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}
.professional-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease-in-out;
}

.professional-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
}

.card-info {
  flex: 1;
}

.card-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.card-body {
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
}

.card-actions .btn {
  flex: 1;
}

.table-container {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
}

.result-table th {
  background: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
}

.result-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.result-table tr:hover {
  background: #f9fafb;
}

.table-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-sm {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
}

.user-cpf {
  font-size: 0.875rem;
  color: #6b7280;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
}

.edit-btn {
  background: #e0f2fe;
  color: #0284c7;
}

.edit-btn:hover {
  background: #bae6fd;
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fecaca;
}

/* Paginação */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.empty-text {
  color: #6b7280;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

/* Ícones */
.icon-plus::before {
  content: "+";
}
.icon-grid::before {
  content: "⊞";
}
.icon-list::before {
  content: "☰";
}
.icon-phone::before {
  content: "📞";
}
.icon-mail::before {
  content: "✉️";
}
.icon-user::before {
  content: "👤";
}
.icon-calendar::before {
  content: "📅";
}
.icon-edit::before {
  content: "✏️";
}
.icon-trash::before {
  content: "🗑️";
}
.icon-users::before {
  content: "👥";
}
.icon-info::before {
  content: "ℹ️";
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

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .results-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }

  .table-container {
    overflow-x: auto;
  }

  .result-table {
    min-width: 600px;
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

  .professional-card {
    padding: 1rem;
  }
}
</style>
