<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Consultar Clientes</h1>
      <button class="btn" @click="$router.push('/cliente/cadastro')">
        + Novo Cliente
      </button>
    </div>

    <div class="mb-4">
      <input
        v-model="busca"
        type="text"
        placeholder="Buscar por CPF, Nome ou E-mail"
        class="input w-full"
      />
    </div>

    <div v-if="clientesFiltrados.length">
      <div class="overflow-x-auto">
        <table class="min-w-full border text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="border px-4 py-2">Nome</th>
              <th class="border px-4 py-2">Telefone</th>
              <th class="border px-4 py-2">CPF</th>
              <th class="border px-4 py-2">E-mail</th>
              <th class="border px-4 py-2">Data de Nascimento</th>
              <th class="border px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clientesFiltrados" :key="cliente.cpf">
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

      <div class="mt-4 text-sm text-gray-600">
        Mostrando {{ clientesFiltrados.length }} de
        {{ clientes.length }} clientes
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-gray-600 mb-4">
        {{
          busca
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
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSweetAlert } from "@/composables/useSweetAlert";
import feather from "feather-icons";

export default defineComponent({
  name: "ClienteConsultaView",
  setup() {
    const router = useRouter();
    const { showToast, confirmDelete, showSuccess, showError, Swal } =
      useSweetAlert();

    const busca = ref("");

    const clientes = ref([
      {
        nome: "João",
        sobrenome: "Silva",
        telefone: "(11) 99999-1111",
        cpf: "123.456.789-00",
        email: "joao@teste.com",
        dataNascimento: "1990-05-01",
      },
      {
        nome: "Maria",
        sobrenome: "Santos",
        telefone: "(21) 98765-4321",
        cpf: "987.654.321-00",
        email: "maria@teste.com",
        dataNascimento: "1985-03-12",
      },
      {
        nome: "Pedro",
        sobrenome: "Oliveira",
        telefone: "(31) 91234-5678",
        cpf: "456.789.123-00",
        email: "",
        dataNascimento: "1992-08-20",
      },
    ]);

    const clientesFiltrados = computed(() => {
      const filtro = busca.value.toLowerCase();
      return clientes.value.filter((c) => {
        return (
          c.nome.toLowerCase().includes(filtro) ||
          c.sobrenome.toLowerCase().includes(filtro) ||
          c.cpf.includes(filtro) ||
          (c.email && c.email.toLowerCase().includes(filtro))
        );
      });
    });

    function formatarData(data: string) {
      return new Date(data).toLocaleDateString("pt-BR");
    }

    async function visualizar(cliente: any) {
      await Swal.fire({
        title: `${cliente.nome} ${cliente.sobrenome}`,
        html: `
          <div class="text-left">
            <p><strong>CPF:</strong> ${cliente.cpf}</p>
            <p><strong>Telefone:</strong> ${cliente.telefone}</p>
            <p><strong>Email:</strong> ${cliente.email || "Não informado"}</p>
            <p><strong>Data de Nascimento:</strong> ${formatarData(cliente.dataNascimento)}</p>
            <p><strong>Idade:</strong> ${calcularIdade(cliente.dataNascimento)} anos</p>
          </div>
        `,
        confirmButtonText: "Fechar",
        customClass: {
          confirmButton: "btn btn-primary",
        },
        buttonsStyling: false,
        width: "500px",
      });
    }

    function calcularIdade(dataNascimento: string): number {
      const hoje = new Date();
      const nascimento = new Date(dataNascimento);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();

      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }

      return idade;
    }

    function editar(cliente: any) {
      showToast.info("Redirecionando para edição...");
      router.push(`/cliente/editar/${cliente.cpf}`);
    }

    async function excluir(cliente: any) {
      const confirmed = await confirmDelete(
        "Excluir cliente",
        `Tem certeza que deseja excluir o cliente ${cliente.nome} ${cliente.sobrenome}? Esta ação não pode ser desfeita.`,
        "Sim, excluir cliente"
      );

      if (confirmed) {
        try {
          // Simular chamada de API
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Remover da lista
          clientes.value = clientes.value.filter((c) => c.cpf !== cliente.cpf);

          showSuccess(
            "Cliente excluído!",
            `${cliente.nome} ${cliente.sobrenome} foi excluído com sucesso.`
          );

          showToast.success("Cliente excluído com sucesso!");
        } catch (error) {
          showError(
            "Erro ao excluir",
            "Ocorreu um erro ao excluir o cliente. Tente novamente."
          );
        }
      }
    }

    onMounted(() => {
      feather.replace();
    });

    return {
      busca,
      clientes,
      clientesFiltrados,
      formatarData,
      visualizar,
      editar,
      excluir,
    };
  },
});
</script>

<style scoped>
.input {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
}
.btn {
  background-color: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}
.btn-sm {
  background-color: #4f46e5;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
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
.btn-sm:hover,
.btn-danger-sm:hover {
  opacity: 0.8;
}
</style>
