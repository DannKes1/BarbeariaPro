<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Consultar Pagamentos</h1>
      <div class="header-actions">
      </div>
    </div>

    <div class="form-section">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cliente</label>
          <input
            v-model="filtros.cliente"
            class="form-input"
            placeholder="Filtrar por Cliente"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select v-model="filtros.status" class="form-select">
            <option value="">Todos os Status</option>
            <option value="Efetuado">Efetuado</option>
            <option value="Pendente">Pendente</option>
            <option value="Estornado">Estornado</option>
          </select>
        </div>
      </div>
    </div>


    <div v-if="pagamentosFiltrados.length">
      <table class="min-w-full border text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-4 py-2">Cliente</th>
            <th class="border px-4 py-2">Serviço</th>
            <th class="border px-4 py-2">Forma de Pagamento</th>
            <th class="border px-4 py-2">Valor</th>
            <th class="border px-4 py-2">Status</th>
            <th class="border px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pagamento in pagamentosFiltrados" :key="pagamento.id">
            <td class="border px-4 py-2">{{ pagamento.cliente }}</td>
            <td class="border px-4 py-2">{{ pagamento.servico }}</td>
            <td class="border px-4 py-2">{{ pagamento.formaPagamento }}</td>
            <td class="border px-4 py-2">R$ {{ pagamento.valor.toFixed(2) }}</td>
            <td class="border px-4 py-2">{{ pagamento.status ? 'Efetuado' : 'Pendente' }}</td>
              <td class="border px-4 py-2">
                 <div class="card-actions">
                    <router-link
                      :to="`/pagamento/editar/${pagamento.id}`"
                      class="btn btn-secondary btn-sm"
                      title="Editar"
                    >
                      ✏️
                      Editar
                    </router-link>
                      <button class="action-btn delete-btn" @click="excluir(pagamento.id)">
                        🗑️
                      </button>
                 </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="text-gray-600 mt-4">Nenhum pagamento encontrado.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { api } from "@/common/http";

export default defineComponent({
  name: "PagamentoConsultaView",
  setup() {
    const pagamentos = ref<any[]>([]);
    const filtros = ref({ cliente: "", data: "", status: "" });

    const pagamentosFiltrados = computed(() => {
      return pagamentos.value.filter((p) => {
        return (
          (!filtros.value.cliente ||
            p.cliente.toLowerCase().includes(filtros.value.cliente.toLowerCase())) &&
          (!filtros.value.status ||
            (filtros.value.status === "Efetuado" && p.status === true) ||
            (filtros.value.status === "Pendente" && p.status === false) ||
            (filtros.value.status === "Estornado" && p.status === "Estornado"))
        );
      });
    });

    const formatarData = (data: string) => {
      return new Date(data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const carregarPagamentos = async () => {
      try {
        const { data: lista } = await api.get("/api/Pagamento");

        const enriquecidos = await Promise.all(
          lista.map(async (p: any) => {
            const { data: agendamento } = await api.get(`/api/Agendamento/${p.agendamentoFk}`);
            const { data: cliente } = await api.get(`/api/Cliente/${agendamento.clienteFk}`);
            const { data: servico } = await api.get(`/api/Servico/${agendamento.servicoFk}`);

            return {
              ...p,
              cliente: `${cliente.nome} ${cliente.sobrenome}`,
              servico: servico.nome,
              createdAt: agendamento.dataHorario,
            };
          })
        );

        pagamentos.value = enriquecidos;
      } catch (error) {
        console.error("Erro ao carregar pagamentos", error);
      }
    };

    const excluir = async (id: number) => {
      const pagamento = pagamentos.value.find((p) => p.id === id);

      if (!pagamento || pagamento.status !== false) {
        alert('Apenas pagamentos com status "Pendente" podem ser excluídos.');
        return;
      }

      const confirmado = confirm(`Deseja realmente excluir o pagamento de ${pagamento.cliente}?`);
      if (confirmado) {
        try {
          await api.delete(`/api/Pagamento/${id}`);
          pagamentos.value = pagamentos.value.filter((p) => p.id !== id);
        } catch (error) {
          alert("Erro ao excluir o pagamento.");
        }
      }
    };

    onMounted(() => {
      carregarPagamentos();
    });

    return {
      pagamentosFiltrados,
      filtros,
      excluir,
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