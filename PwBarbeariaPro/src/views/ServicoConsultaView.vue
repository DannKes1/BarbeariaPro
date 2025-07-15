<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Consultar Serviços</h1>
      <div class="header-actions">
        <router-link to="/servico/cadastro" class="btn btn-primary">
          <i class="icon-plus"></i>
          Novo Serviço
        </router-link>
      </div>
    </div>

    <div class="form-section">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Buscar por nome</label>
          <input
            v-model="filtro.nome"
            type="text"
            class="form-input"
            placeholder="Nome do serviço"
          />
        </div>
      </div>
    </div>

    <div v-if="servicosFiltrados.length" class="table-container">
      <table class="result-table">
        <thead>
          <tr>
            <th>Serviço</th>
            <th>Descrição</th>
            <th>Preço</th>
            <th>Duração</th>
            <th>Categoria</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="servico in servicosFiltrados" :key="servico.id">
            <td>{{ servico.nome }}</td>
            <td>{{ servico.descricao }}</td>
            <td>R$ {{ servico.valor.toFixed(2) }}</td>
            <td>{{ servico.duracaoMinutos }} min</td>
            <td>{{ servico.categoria }}</td>
            <td>
              <div class="card-actions">
                <router-link
                  :to="`/servico/editar/${servico.id}`"
                  class="btn btn-secondary btn-sm">
                  <i class="icon-edit"></i>
                  Editar
                </router-link>
                <button
                  class="btn btn-danger btn-sm"
                  @click="excluirServico(servico)">
                  <i class="icon-trash"></i>
                  Excluir
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <i class="icon-users"></i>
      </div>
      <h3 class="empty-title">Nenhum serviço encontrado</h3>
      <p class="empty-text">
        Tente ajustar os filtros de busca ou cadastre um novo serviço.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { api } from "@/common/http";
import { useSweetAlert } from "@/composables/useSweetAlert";

export default defineComponent({
  setup() {
    const { showSuccess, showError } = useSweetAlert();
    const filtro = ref({ nome: "" });
    const servicos = ref<any[]>([]);

    const servicosFiltrados = computed(() => {
      const nomeFiltro = filtro.value.nome.toLowerCase();
      return servicos.value.filter((s) => s.nome.toLowerCase().includes(nomeFiltro));
    });

    async function carregarServicos() {
      try {
        const response = await api.get("/api/Servico");
        servicos.value = response.data;
      } catch {
        showError("Erro", "Erro ao carregar serviços.");
      }
    }

    async function excluirServico(servico: any) {
      const confirmado = window.confirm(`Excluir \"${servico.nome}\"?`);
      if (!confirmado) return;
      try {
        await api.delete(`/api/Servico/${servico.id}`);
        servicos.value = servicos.value.filter((s) => s.id !== servico.id);
        showSuccess("Removido", `\"${servico.nome}\" foi excluído.`);
      } catch {
        showError("Erro", "Erro ao excluir.");
      }
    }

    onMounted(carregarServicos);

    return {
      filtro,
      servicosFiltrados,
      excluirServico,
    };
  },
});
</script>

<style scoped>
/* Container Principal */
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
  text-align: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
  position: relative;
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

.form-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}


/* Seções do Formulário */
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

/* Layout dos Campos */
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

/* Labels */
.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

/* Inputs */
.form-input,
.form-select {
  padding: 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  background: #ffffff;
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

/* Botões */
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

/* Toggle de Visualização */
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

/* Grid de Cards */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Card do Profissional */
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

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid;
}

.badge-blue {
  background: #eff6ff;
  color: #1e40af;
  border-color: #bfdbfe;
}

.badge-pink {
  background: #fdf2f8;
  color: #831843;
  border-color: #fbcfe8;
}

.badge-purple {
  background: #f5f3ff;
  color: #5b21b6;
  border-color: #ddd6fe;
}

.badge-green {
  background: #ecfdf5;
  color: #065f46;
  border-color: #6ee7b7;
}

.badge-yellow {
  background: #fefce8;
  color: #78350f;
  border-color: #fde68a;
}

.badge-orange {
  background: #fff7ed;
  color: #9a3412;
  border-color: #fed7aa;
}

.badge-red {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.badge-gray {
  background: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
}

/* Tabela */
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

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-info span:first-child {
  font-weight: 500;
}

.contact-info span:last-child {
  font-size: 0.875rem;
  color: #6b7280;
}

.salary {
  font-weight: 600;
  color: #059669;
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

/* Estado Vazio */
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
.icon-dollar::before {
  content: "💰";
}
.icon-user::before {
  content: "👤";
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

/* Responsividade */
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
