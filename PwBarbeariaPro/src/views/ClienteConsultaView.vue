<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Consultar Clientes</h1>

    <input
      v-model="busca"
      type="text"
      placeholder="Buscar por CPF, Nome ou E-mail"
      class="input w-full mb-4"
    />

    <div v-if="clientesFiltrados.length">
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
            <td class="border px-4 py-2">{{ cliente.email }}</td>
            <td class="border px-4 py-2">{{ cliente.dataNascimento }}</td>
            <td class="border px-4 py-2">
              <button class="btn text-sm mr-2" @click="editar(cliente)">
                Editar
              </button>
              <button class="btn-danger text-sm" @click="excluir(cliente)">
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-gray-600 mt-4">Nenhum cliente encontrado.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import feather from "feather-icons";

export default defineComponent({
  name: "ClienteConsultaView",
  setup() {
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

    function editar(cliente: any) {
      console.log("Editar cliente:", cliente);
      // navegar para /cliente/editar/:cpf — depois implementamos
    }

    function excluir(cliente: any) {
      console.log("Excluir cliente:", cliente);
      // show modal ou confirmação
    }

    onMounted(() => {
      feather.replace();
    });

    return {
      busca,
      clientes,
      clientesFiltrados,
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
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
}
.btn-danger {
  background-color: #dc2626;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
}
</style>
