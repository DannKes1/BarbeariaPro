<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Consulta de Caixa</h1>
    </div>

    <div class="form-section">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Data</label>
          <input v-model="filtros.data" type="date" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <select v-model="filtros.tipo" class="form-select">
            <option value="">Todos os tipos</option>
            <option value="entrada">Entradas</option>
            <option value="saida">Saídas</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="movimentosFiltrados.length" class="table-container">
      <table class="result-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movimento in movimentosFiltrados" :key="movimento.id">
            <td>{{ movimento.id }}</td>
            <td>
              <span :class="movimento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'">
                {{ movimento.tipo === 'entrada' ? '↗️ Entrada' : '↙️ Saída' }}
              </span>
            </td>
            <td>R$ {{ movimento.valor.toFixed(2) }}</td>
            <td>{{ movimento.categoria }}</td>
            <td>{{ movimento.descricao }}</td>
            <td class="table-actions">
              <button class="action-btn edit-btn" @click="verDetalhes(movimento)">👁️</button>
              <button class="action-btn delete-btn" @click="excluirMovimento(movimento)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🗂️</div>
      <div class="empty-title">Nenhuma movimentação encontrada</div>
      <p class="empty-text">Ajuste os filtros acima ou tente novamente mais tarde.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { api } from "@/common/http";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "CaixaConsultaView",
  setup() {
    const { showSuccess, showError, Swal } = useSweetAlert();
    const router = useRouter();

    const filtros = ref({ data: "", tipo: "" });
    const movimentos = ref<any[]>([]);

    function normalizeTipo(tipo: string) {
      return tipo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    }

    const buscarMovimentacoes = async () => {
      try {
        const caixaResponse = await api.get("/api/Caixa/ultimo");
        const caixaAberto = caixaResponse.data;

        if (!caixaAberto?.id || caixaAberto.status !== "Aberto") {
          showError("Caixa Fechado", "Abra o caixa antes de visualizar movimentações.");
          setTimeout(() => {
            router.push({ path: "/caixa/abrir" });
          }, 2000);
          movimentos.value = [];
          return;
        }

        const movResponse = await api.get(`/api/MovimentacaoCaixa/caixa/${caixaAberto.id}`);

        movimentos.value = movResponse.data.map((m: any) => ({
          ...m,
          tipo: normalizeTipo(m.tipo),
        }));
      } catch (err) {
        console.error("Erro ao buscar movimentações:", err);
        showError("Erro", "Não foi possível carregar as movimentações.");
      }
    };

    const movimentosFiltrados = computed(() => {
      return movimentos.value.filter((m) => {
        const dataMatch = !filtros.value.data || m.dataHora?.includes(filtros.value.data);
        const tipoMatch = !filtros.value.tipo || m.tipo === filtros.value.tipo;
        return dataMatch && tipoMatch;
      });
    });

    async function verDetalhes(movimento: any) {
      await Swal.fire({
        title: "Detalhes da Movimentação",
        html: `
          <div class="text-left">
            <p><strong>ID:</strong> ${movimento.id}</p>
            <p><strong>Tipo:</strong> ${movimento.tipo}</p>
            <p><strong>Valor:</strong> R$ ${movimento.valor.toFixed(2)}</p>
            <p><strong>Categoria:</strong> ${movimento.categoria}</p>
            <p><strong>Descrição:</strong> ${movimento.descricao}</p>
          </div>
        `,
        confirmButtonText: "Fechar",
      });
    }

    async function excluirMovimento(movimento: any) {
      const result = await Swal.fire({
        title: "Confirma exclusão?",
        text: `Deseja excluir a movimentação de R$ ${movimento.valor.toFixed(2)} (${movimento.tipo})?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        try {
          await api.delete(`/api/MovimentacaoCaixa/${movimento.id}`);

          const caixaResponse = await api.get("/api/Caixa/ultimo");
          const caixa = caixaResponse.data;

          let novoSaldoFinal = caixa.saldoFinal;

          if (movimento.tipo === "entrada") {
            novoSaldoFinal -= movimento.valor;
          } else if (movimento.tipo === "saida") {
            novoSaldoFinal += movimento.valor;
          }

          await api.put(`/api/Caixa/${caixa.id}`, {
            ...caixa,
            saldoFinal: novoSaldoFinal,
          });

          showSuccess("Movimentação excluída com sucesso!");
          buscarMovimentacoes();
        } catch (error) {
          console.error("Erro ao excluir movimentação:", error);
          showError("Erro", "Não foi possível excluir a movimentação.");
        }
      }
    }

    onMounted(() => {
      buscarMovimentacoes();
    });

    return {
      filtros,
      movimentosFiltrados,
      verDetalhes,
      excluirMovimento,
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