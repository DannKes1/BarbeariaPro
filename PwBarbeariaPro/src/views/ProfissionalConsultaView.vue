<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Consultar Profissionais</h1>
      <div class="header-actions">
        <button
          class="btn btn-primary"
          @click="router.push('/profissional/cadastro')"
        >
          <i class="icon-plus"></i>
          Novo Profissional
        </button>
      </div>
    </div>

    
    <div class="form-section">
      <h2 class="section-title">Filtros de Busca</h2>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Buscar Profissional</label>
          <input
            v-model="filtros.busca"
            type="text"
            placeholder="Buscar por nome, CPF ou email"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Especialidade</label>
          <select v-model="filtros.especialidade" class="form-select">
            <option value="">Todas as especialidades</option>
            <option value="Cabeleireiro">Cabeleireiro</option>
            <option value="Barbeiro">Barbeiro</option>
            <option value="Esteticista">Esteticista</option>
            <option value="Manicure">Manicure</option>
            <option value="Pedicure">Pedicure</option>
            <option value="Massagista">Massagista</option>
            <option value="Depilador">Depilador</option>
          </select>
        </div>
      </div>
    </div>

    
    <div v-if="profissionaisFiltrados.length" class="form-section">
      <div class="section-header">
        <h2 class="section-title">Resultados da Busca</h2>
        <div class="results-info">
          <span class="results-count">
            Mostrando {{ profissionaisFiltrados.length }} de
            {{ profissionais.length }} profissionais
          </span>
          <div class="view-toggle">
            <button
              @click="viewMode = 'cards'"
              :class="{ active: viewMode === 'cards' }"
              class="toggle-btn"
            >
              <i class="icon-grid"></i>
            </button>
            <button
              @click="viewMode = 'table'"
              :class="{ active: viewMode === 'table' }"
              class="toggle-btn"
            >
              <i class="icon-list"></i>
            </button>
          </div>
        </div>
      </div>

      
      <div v-if="viewMode === 'cards'" class="cards-grid">
        <div
          v-for="p in profissionaisFiltrados"
          :key="p.id"
          class="professional-card"
        >
          <div class="card-header">
            <div class="avatar">
              {{ p.nome.charAt(0) }}{{ p.sobrenome.charAt(0) }}
            </div>
            <div class="card-info">
              <h3 class="card-name">{{ p.nome }} {{ p.sobrenome }}</h3>
              <span class="badge" :class="badgeClass(p.especialidade)">
                {{ p.especialidade }}
              </span>
            </div>
          </div>

          <div class="card-body">
            <div class="info-item">
              <i class="icon-phone"></i>
              <span>{{ p.telefone }}</span>
            </div>
            <div class="info-item">
              <i class="icon-mail"></i>
              <span>{{ p.email }}</span>
            </div>
            <div class="info-item">
              <i class="icon-user"></i>
              <span>{{ p.cpf }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn btn-secondary btn-sm" @click="editar(p)">
              <i class="icon-edit"></i>
              Editar
            </button>
            <button class="btn btn-danger btn-sm" @click="excluir(p)">
              <i class="icon-trash"></i>
              Excluir
            </button>
          </div>
        </div>
      </div>

      
      <div v-if="viewMode === 'table'" class="table-container">
        <table class="result-table">
          <thead>
            <tr>
              <th>Profissional</th>
              <th>Especialidade</th>
              <th>Contato</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in profissionaisFiltrados" :key="p.id">
              <td>
                <div class="table-user">
                  <div class="avatar-sm">
                    {{ p.nome.charAt(0) }}{{ p.sobrenome.charAt(0) }}
                  </div>
                  <div class="user-info">
                    <span class="user-name"
                      >{{ p.nome }} {{ p.sobrenome }}</span
                    >
                    <span class="user-cpf">{{ p.cpf }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge" :class="badgeClass(p.especialidade)">
                  {{ p.especialidade }}
                </span>
              </td>
              <td>
                <div class="contact-info">
                  <span>{{ p.telefone }}</span>
                  <span>{{ p.email }}</span>
                </div>
              </td>
              <td>
                <div class="table-actions">
                  <button
                    class="action-btn edit-btn"
                    @click="editar(p)"
                    title="Editar"
                  >
                    <i class="icon-edit"></i>
                  </button>
                  <button
                    class="action-btn delete-btn"
                    @click="excluir(p)"
                    title="Excluir"
                  >
                    <i class="icon-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

   
    <div v-else class="form-section empty-state">
      <div class="empty-icon">
        <i class="icon-users"></i>
      </div>
      <h3 class="empty-title">
        {{
          filtros.busca || filtros.especialidade
            ? "Nenhum profissional encontrado"
            : "Nenhum profissional cadastrado"
        }}
      </h3>
      <p class="empty-text">
        {{
          filtros.busca || filtros.especialidade
            ? "Tente ajustar os filtros de busca para encontrar profissionais."
            : "Comece cadastrando seu primeiro profissional para gerenciar sua equipe."
        }}
      </p>
      <button
        class="btn btn-primary"
        @click="router.push('/profissional/cadastro')"
      >
        <i class="icon-plus"></i>
        {{
          filtros.busca || filtros.especialidade
            ? "Cadastrar Novo Profissional"
            : "Cadastrar Primeiro Profissional"
        }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { api } from "@/common/http";
import feather from "feather-icons";

interface Profissional {
  id: number;
  nome: string;
  sobrenome: string;
  telefone: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  especialidade: string;
  salario: number;
}

interface Filtros {
  busca: string;
  especialidade: string;
}

type ViewMode = "cards" | "table";

export default defineComponent({
  name: "ProfissionalConsultaView",
  setup() {
    const router = useRouter();
    const { showToast, showError, showSuccess, confirmAction } =
      useSweetAlert();

    const filtros = ref<Filtros>({ busca: "", especialidade: "" });
    const profissionais = ref<Profissional[]>([]);
    const viewMode = ref<ViewMode>("cards");

    const profissionaisFiltrados = computed(() =>
      profissionais.value.filter((p) => {
        const termo = filtros.value.busca.toLowerCase();
        const buscaOk =
          !termo ||
          p.nome.toLowerCase().includes(termo) ||
          p.sobrenome.toLowerCase().includes(termo) ||
          p.cpf.includes(filtros.value.busca) ||
          p.email.toLowerCase().includes(termo);
        const espeOk =
          !filtros.value.especialidade ||
          p.especialidade === filtros.value.especialidade;
        return buscaOk && espeOk;
      })
    );

    function badgeClass(especialidade: string): string {
      const classes: Record<string, string> = {
        Barbeiro: "badge-blue",
        Cabeleireiro: "badge-pink",
        Esteticista: "badge-purple",
        Manicure: "badge-green",
        Pedicure: "badge-yellow",
        Massagista: "badge-orange",
        Depilador: "badge-red",
      };
      return classes[especialidade] || "badge-gray";
    }

    async function editar(p: Profissional) {
      showToast.info("Redirecionando para edição...");
      router.push(`/profissional/editar/${p.id}`);
    }

    async function excluir(p: Profissional) {
      const confirmed = await confirmAction(
        "Confirmar exclusão",
        `Tem certeza que deseja excluir ${p.nome} ${p.sobrenome}?`,
        "Sim, excluir"
      );
      if (!confirmed) return;

      try {
        await api.delete(`/api/Profissional/${p.id}`);
        profissionais.value = profissionais.value.filter((x) => x.id !== p.id);
        showSuccess(
          "Profissional excluído!",
          `${p.nome} removido com sucesso.`
        );
        showToast.success("Profissional excluído com sucesso!");
      } catch {
        showError(
          "Erro ao excluir",
          "Não foi possível excluir o profissional."
        );
      }
    }

    onMounted(async () => {
      try {
        const res = await api.get<Profissional[]>("/api/Profissional");
        profissionais.value = res.data || [];
      } catch {
        showError("Erro ao carregar profissionais", "Não foi possível buscar.");
      }
      feather.replace();
    });

    return {
      router,
      filtros,
      profissionais,
      profissionaisFiltrados,
      viewMode,
      badgeClass,
      editar,
      excluir,
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
