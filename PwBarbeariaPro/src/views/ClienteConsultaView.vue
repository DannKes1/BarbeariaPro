<template>
  <div class="form-container">
    <div class="form-header">
      <h1 class="form-title">Consultar Clientes</h1>

      <div class="header-actions">
        <button
          class="btn btn-primary"
          @click="$router.push('/cliente/cadastro')"
        >
          <i class="icon-plus"></i>
          Novo Cliente
        </button>
      </div>
    </div>

    <div class="form-section">
      <h2 class="section-title">Filtros de Busca</h2>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Buscar Cliente</label>
          <input
            v-model="filtros.busca"
            type="text"
            placeholder="Buscar por nome, CPF ou email"
            class="form-input"
            @input="aplicarFiltros"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Ordenar por</label>
          <select
            v-model="filtros.ordenarPor"
            class="form-select"
            @change="aplicarFiltros"
          >
            <option value="nome">Nome</option>
            <option value="cpf">CPF</option>
            <option value="email">E-mail</option>
            <option value="dataNascimento">Data de Nascimento</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Itens por página</label>
          <select
            v-model="paginacao.itensPorPagina"
            class="form-select"
            @change="aplicarPaginacao"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>

      <div
        v-if="cookieInfo.hasFilters || cookieInfo.hasPagination"
        class="mt-3 flex items-center justify-between"
      >
        <div class="flex items-center text-sm text-blue-600">
          <i class="icon-info"></i>
          Filtros e configurações foram restaurados dos cookies
        </div>
        <button
          @click="limparFiltrosSalvos"
          class="text-sm text-gray-600 underline"
        >
          Limpar configurações salvas
        </button>
      </div>
    </div>

    <div v-if="clientesPaginados.length" class="form-section">
      <div class="section-header">
        <h2 class="section-title">Resultados da Busca</h2>
        <div class="results-info">
          <span class="results-count">
            Mostrando
            {{ (paginacao.paginaAtual - 1) * paginacao.itensPorPagina + 1 }} a
            {{
              Math.min(
                paginacao.paginaAtual * paginacao.itensPorPagina,
                clientesFiltrados.length
              )
            }}
            de {{ clientesFiltrados.length }} clientes
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
          v-for="cliente in clientesPaginados"
          :key="cliente.id"
          class="professional-card"
        >
          <div class="card-header">
            <div class="avatar">
              {{ cliente.nome.charAt(0) }}{{ cliente.sobrenome.charAt(0) }}
            </div>
            <div class="card-info">
              <h3 class="card-name">
                {{ cliente.nome }} {{ cliente.sobrenome }}
              </h3>
            </div>
          </div>

          <div class="card-body">
            <div class="info-item">
              <i class="icon-phone"></i>
              <span>{{ formatarTelefone(cliente.telefone) }}</span>
            </div>
            <div class="info-item">
              <i class="icon-user"></i>
              <span>{{ formatarCpf(cliente.cpf) }}</span>
            </div>
            <div class="info-item">
              <i class="icon-mail"></i>
              <span>{{ cliente.email || "-" }}</span>
            </div>
            <div class="info-item">
              <i class="icon-calendar"></i>
              <span>{{ formatarData(cliente.dataNascimento) }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn btn-secondary btn-sm" @click="editar(cliente)">
              <i class="icon-edit"></i>
              Editar
            </button>
            <button
              class="btn btn-danger btn-sm"
              @click="excluirCliente(cliente.id)"
            >
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
              <th @click="alternarOrdem('nome')">
                Nome
                <span v-if="filtros.ordenarPor === 'nome'">
                  {{ filtros.ordemCrescente ? "↑" : "↓" }}
                </span>
              </th>
              <th>Telefone</th>
              <th @click="alternarOrdem('cpf')">
                CPF
                <span v-if="filtros.ordenarPor === 'cpf'">
                  {{ filtros.ordemCrescente ? "↑" : "↓" }}
                </span>
              </th>
              <th @click="alternarOrdem('email')">
                E-mail
                <span v-if="filtros.ordenarPor === 'email'">
                  {{ filtros.ordemCrescente ? "↑" : "↓" }}
                </span>
              </th>
              <th @click="alternarOrdem('dataNascimento')">
                Data de Nascimento
                <span v-if="filtros.ordenarPor === 'dataNascimento'">
                  {{ filtros.ordemCrescente ? "↑" : "↓" }}
                </span>
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clientesPaginados" :key="cliente.id">
              <td>
                <div class="table-user">
                  <div class="avatar-sm">
                    {{ cliente.nome.charAt(0)
                    }}{{ cliente.sobrenome.charAt(0) }}
                  </div>
                  <div class="user-info">
                    <span class="user-name"
                      >{{ cliente.nome }} {{ cliente.sobrenome }}</span
                    >
                    <span class="user-cpf">{{ formatarCpf(cliente.cpf) }}</span>
                  </div>
                </div>
              </td>
              <td>{{ formatarTelefone(cliente.telefone) }}</td>
              <td>{{ formatarCpf(cliente.cpf) }}</td>
              <td>{{ cliente.email || "-" }}</td>
              <td>{{ formatarData(cliente.dataNascimento) }}</td>
              <td>
                <div class="table-actions">
                  <button
                    class="action-btn edit-btn"
                    @click="editar(cliente)"
                    title="Editar"
                  >
                    <i class="icon-edit"></i>
                  </button>
                  <button
                    class="action-btn delete-btn"
                    @click="excluirCliente(cliente.id)"
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

      <div class="pagination">
        <button
          class="btn btn-secondary btn-sm"
          @click="irParaPagina(paginacao.paginaAtual - 1)"
          :disabled="paginacao.paginaAtual === 1"
        >
          Anterior
        </button>
        <span>Página {{ paginacao.paginaAtual }} de {{ totalPaginas }}</span>
        <button
          class="btn btn-secondary btn-sm"
          @click="irParaPagina(paginacao.paginaAtual + 1)"
          :disabled="paginacao.paginaAtual === totalPaginas"
        >
          Próxima
        </button>
      </div>
    </div>

    <div v-else class="form-section empty-state">
      <div class="empty-icon">
        <i class="icon-users"></i>
      </div>
      <h3 class="empty-title">
        {{
          filtros.busca
            ? "Nenhum cliente encontrado"
            : "Nenhum cliente cadastrado"
        }}
      </h3>
      <p class="empty-text">
        {{
          filtros.busca
            ? "Tente ajustar os filtros de busca para encontrar clientes."
            : "Comece cadastrando seu primeiro cliente para gerenciar sua base."
        }}
      </p>
      <button
        class="btn btn-primary"
        @click="$router.push('/cliente/cadastro')"
      >
        <i class="icon-plus"></i>
        {{
          filtros.busca
            ? "Cadastrar Novo Cliente"
            : "Cadastrar Primeiro Cliente"
        }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { useFormCookies } from "@/composables/useFormCookies";
import feather from "feather-icons";
import { api } from "@/common/http";

export default defineComponent({
  name: "ClienteConsultaView",
  setup() {
    const router = useRouter();
    const { showToast, showError, confirmAction } = useSweetAlert();
    const viewMode = ref<"cards" | "table">("cards");
    const clientes = ref<any[]>([]);

    const filtros = ref({
      busca: "",
      ordenarPor: "nome",
      ordemCrescente: true,
    });

    const paginacao = ref({
      paginaAtual: 1,
      itensPorPagina: 10,
    });

    const {
      saveFilters,
      loadFilters,
      savePagination,
      loadPagination,
      clearFormCookies,
      getCookieInfo,
    } = useFormCookies(
      {},
      {
        formKey: "cliente_consulta",
        rememberFilters: true,
        rememberPagination: true,
        expirationDays: 30,
      }
    );

    const cookieInfo = computed(() => getCookieInfo());

    const clientesFiltrados = computed(() => {
      let resultado = [...clientes.value];

      if (filtros.value.busca) {
        const termo = filtros.value.busca.toLowerCase();
        resultado = resultado.filter(
          (cliente) =>
            cliente.nome.toLowerCase().includes(termo) ||
            cliente.sobrenome.toLowerCase().includes(termo) ||
            cliente.cpf.includes(termo) ||
            (cliente.email && cliente.email.toLowerCase().includes(termo))
        );
      }

      resultado.sort((a, b) => {
        const campo = filtros.value.ordenarPor as keyof typeof a;
        let valorA = a[campo] || "";
        let valorB = b[campo] || "";

        if (campo === "nome") {
          valorA = `${a.nome} ${a.sobrenome}`;
          valorB = `${b.nome} ${b.sobrenome}`;
        }

        const comparacao = valorA.toString().localeCompare(valorB.toString());
        return filtros.value.ordemCrescente ? comparacao : -comparacao;
      });

      return resultado;
    });

    const totalPaginas = computed(() => {
      return Math.ceil(
        clientesFiltrados.value.length / paginacao.value.itensPorPagina
      );
    });

    const clientesPaginados = computed(() => {
      const inicio =
        (paginacao.value.paginaAtual - 1) * paginacao.value.itensPorPagina;
      const fim = inicio + paginacao.value.itensPorPagina;
      return clientesFiltrados.value.slice(inicio, fim);
    });

    const buscarClientes = async () => {
      try {
        const response = await api.get("/api/Cliente");
        clientes.value = response.data;
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      }
    };

    const excluirCliente = async (id: number) => {
      const confirmado = await confirmAction(
        "Confirmar exclusão",
        `Deseja realmente excluir o cliente?`,
        "Sim, excluir"
      );

      if (confirmado) {
        try {
          await api.delete(`api/Cliente/${id}`);
          buscarClientes();
          showToast.success("Cliente excluído com sucesso!");
        } catch (error) {
          showError("Erro ao excluir o cliente.");
        }
      }
    };

    const editar = (cliente: any) => {
      router.push(`/cliente/editar/${cliente.id}`);
    };

    const formatarCpf = (cpf: string) => {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    };

    const formatarTelefone = (telefone: string) => {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    };

    const formatarData = (data: string) => {
      return new Date(data).toLocaleDateString("pt-BR");
    };

    onMounted(() => {
      buscarClientes();
      feather.replace();
      loadFilters();
      loadPagination();
    });

    function aplicarFiltros() {
      paginacao.value.paginaAtual = 1;
      saveFilters(filtros.value);
    }

    function aplicarPaginacao() {
      savePagination(paginacao.value);
    }

    function alternarOrdem(campo: string) {
      if (filtros.value.ordenarPor === campo) {
        filtros.value.ordemCrescente = !filtros.value.ordemCrescente;
      } else {
        filtros.value.ordenarPor = campo;
        filtros.value.ordemCrescente = true;
      }
      aplicarFiltros();
    }

    function irParaPagina(pagina: number) {
      if (pagina >= 1 && pagina <= totalPaginas.value) {
        paginacao.value.paginaAtual = pagina;
        aplicarPaginacao();
      }
    }

    function limparFiltrosSalvos() {
      clearFormCookies();
      filtros.value = { busca: "", ordenarPor: "nome", ordemCrescente: true };
      paginacao.value = { paginaAtual: 1, itensPorPagina: 10 };
      showToast.info("Configurações de filtros e paginação foram limpas");
    }

    return {
      router,
      filtros,
      paginacao,
      clientes,
      clientesFiltrados,
      clientesPaginados,
      totalPaginas,
      viewMode,
      cookieInfo,
      formatarCpf,
      formatarTelefone,
      formatarData,
      excluirCliente,
      editar,
      aplicarFiltros,
      aplicarPaginacao,
      alternarOrdem,
      irParaPagina,
      limparFiltrosSalvos,
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