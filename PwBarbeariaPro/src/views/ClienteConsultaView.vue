<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Consultar Clientes</h1>
      <button class="btn" @click="$router.push('/cliente/cadastro')">
        + Novo Cliente
      </button>
    </div>

    <div class="mb-4 p-4 bg-gray-50 border rounded-md">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Buscar</label>
          <input
            v-model="filtros.busca"
            type="text"
            placeholder="CPF, Nome ou E-mail"
            class="input w-full"
            @input="aplicarFiltros"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Ordenar por</label>
          <select
            v-model="filtros.ordenarPor"
            class="input w-full"
            @change="aplicarFiltros"
          >
            <option value="nome">Nome</option>
            <option value="cpf">CPF</option>
            <option value="email">E-mail</option>
            <option value="dataNascimento">Data de Nascimento</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Itens por página</label>
          <select
            v-model="paginacao.itensPorPagina"
            class="input w-full"
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
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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

    <div v-if="clientesPaginados.length">
      <div class="overflow-x-auto">
        <table class="min-w-full border text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th
                class="border px-4 py-2 cursor-pointer"
                @click="alternarOrdem('nome')"
              >
                Nome
                <span v-if="filtros.ordenarPor === 'nome'">
                  {{ filtros.ordemCrescente ? "↑" : "↓" }}
                </span>
              </th>
              <th class="border px-4 py-2">Telefone</th>
              <th
                class="border px-4 py-2 cursor-pointer"
                @click="alternarOrdem('cpf')"
              >
                CPF
                <span v-if="filtros.ordenarPor === 'cpf'">
                  {{ filtros.ordemCrescente ? "↑" : "↓" }}
                </span>
              </th>
              <th
                class="border px-4 py-2 cursor-pointer"
                @click="alternarOrdem('email')"
              >
                E-mail
                <span v-if="filtros.ordenarPor === 'email'">
                  {{ filtros.ordemCrescente ? "↑" : "↓" }}
                </span>
              </th>
              <th
                class="border px-4 py-2 cursor-pointer"
                @click="alternarOrdem('dataNascimento')"
              >
                Data de Nascimento
                <span v-if="filtros.ordenarPor === 'dataNascimento'">
                  {{ filtros.ordemCrescente ? "↑" : "↓" }}
                </span>
              </th>
              <th class="border px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clientesPaginados" :key="cliente.cpf">
              <td class="border px-4 py-2">
                {{ cliente.nome }} {{ cliente.sobrenome }}
              </td>
              <td class="border px-4 py-2">{{ cliente.telefone }}</td>
              <td class="border px-4 py-2">{{ cliente.cpf }}</td>
              <td class="border px-4 py-2">{{ cliente.email || "-" }}</td>
              <td class="border px-4 py-2">
                {{ formatarData(cliente.dataNascimento) }}
              </td>
              <td class="border px-4 py-2">
                <div class="flex gap-2">
                  <button
                    class="btn-sm"
                    @click="visualizar(cliente)"
                    title="Visualizar"
                  >
                    👁️
                  </button>
                  <button
                    class="btn-sm"
                    @click="editar(cliente)"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn-danger-sm"
                    @click="excluir(cliente)"
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          Mostrando
          {{ (paginacao.paginaAtual - 1) * paginacao.itensPorPagina + 1 }} a
          {{
            Math.min(
              paginacao.paginaAtual * paginacao.itensPorPagina,
              clientesFiltrados.length
            )
          }}
          de {{ clientesFiltrados.length }} clientes
        </div>

        <div class="flex gap-2">
          <button
            class="btn-sm"
            @click="irParaPagina(paginacao.paginaAtual - 1)"
            :disabled="paginacao.paginaAtual === 1"
          >
            ← Anterior
          </button>

          <span class="px-3 py-1 text-sm">
            Página {{ paginacao.paginaAtual }} de {{ totalPaginas }}
          </span>

          <button
            class="btn-sm"
            @click="irParaPagina(paginacao.paginaAtual + 1)"
            :disabled="paginacao.paginaAtual === totalPaginas"
          >
            Próxima →
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-gray-600 mb-4">
        {{
          filtros.busca
            ? "Nenhum cliente encontrado para a busca."
            : "Nenhum cliente cadastrado."
        }}
      </p>
      <button class="btn" @click="$router.push('/cliente/cadastro')">
        Cadastrar Primeiro Cliente
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import { useFormCookies } from "@/composables/useFormCookies";
import feather from "feather-icons";

export default defineComponent({
  name: "ClienteConsultaView",
  setup() {
    const router = useRouter();
    const { showToast, showError, confirmAction } = useSweetAlert();
    const showDebugInfo = ref(false);

    const clientes = ref([
      {
        nome: "João",
        sobrenome: "Silva",
        telefone: "(11) 98765-4321",
        cpf: "123.456.789-01",
        email: "joao@email.com",
        dataNascimento: "1990-05-15",
      },
      {
        nome: "Maria",
        sobrenome: "Santos",
        telefone: "(11) 87654-3210",
        cpf: "987.654.321-09",
        email: "maria@email.com",
        dataNascimento: "1985-08-22",
      },
      {
        nome: "Pedro",
        sobrenome: "Oliveira",
        telefone: "(11) 76543-2109",
        cpf: "456.789.123-45",
        email: "pedro@email.com",
        dataNascimento: "1992-12-03",
      },
    ]);

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
      canUseCookies,
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

      filtros.value = {
        busca: "",
        ordenarPor: "nome",
        ordemCrescente: true,
      };

      paginacao.value = {
        paginaAtual: 1,
        itensPorPagina: 10,
      };

      showToast.info("Configurações de filtros e paginação foram limpas");
    }

    function carregarConfiguracoesSalvas() {
      if (canUseCookies.value) {
        const filtrosSalvos = loadFilters();
        const paginacaoSalva = loadPagination();

        if (Object.keys(filtrosSalvos).length > 0) {
          Object.assign(filtros.value, filtrosSalvos);
        }

        if (Object.keys(paginacaoSalva).length > 0) {
          Object.assign(paginacao.value, paginacaoSalva);
        }
      }
    }

    function formatarData(data: string) {
      return new Date(data).toLocaleDateString("pt-BR");
    }

    function visualizar(cliente: any) {
      showToast.info(`Visualizando ${cliente.nome} ${cliente.sobrenome}`);
    }

    function editar(cliente: any) {
      router.push(`/cliente/editar/${cliente.cpf}`);
    }

    async function excluir(cliente: any) {
      const confirmado = await confirmAction(
        "Confirmar exclusão",
        `Deseja realmente excluir o cliente ${cliente.nome} ${cliente.sobrenome}?`,
        "Sim, excluir"
      );

      if (confirmado) {
        const index = clientes.value.findIndex((c) => c.cpf === cliente.cpf);
        if (index > -1) {
          clientes.value.splice(index, 1);
          showToast.success("Cliente excluído com sucesso!");
        }
      }
    }

    watch(
      filtros,
      () => {
        if (canUseCookies.value) {
          saveFilters(filtros.value);
        }
      },
      { deep: true }
    );

    watch(
      paginacao,
      () => {
        if (canUseCookies.value) {
          savePagination(paginacao.value);
        }
      },
      { deep: true }
    );

    onMounted(() => {
      feather.replace();
      carregarConfiguracoesSalvas();
    });

    return {
      clientes,
      filtros,
      paginacao,
      clientesFiltrados,
      clientesPaginados,
      totalPaginas,
      showDebugInfo,
      cookieInfo,
      aplicarFiltros,
      aplicarPaginacao,
      alternarOrdem,
      irParaPagina,
      limparFiltrosSalvos,
      formatarData,
      visualizar,
      editar,
      excluir,
      canUseCookies,
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

.btn-sm {
  background-color: #6b7280;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-sm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-danger-sm {
  background-color: #dc2626;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: #f3f4f6;
}
</style>
