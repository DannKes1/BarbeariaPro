<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Consultar Profissionais</h1>
      <button class="btn" @click="$router.push('/profissional/cadastro')">
        + Novo Profissional
      </button>
    </div>

    <div class="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <input
        v-model="filtros.busca"
        type="text"
        placeholder="Buscar por nome, CPF ou email"
        class="input"
      />

      <select v-model="filtros.especialidade" class="input">
        <option value="">Todas as especialidades</option>
        <option value="Barbeiro">Barbeiro</option>
        <option value="Cabeleireiro">Cabeleireiro</option>
        <option value="Esteticista">Esteticista</option>
        <option value="Manicure">Manicure</option>
        <option value="Pedicure">Pedicure</option>
      </select>

      <select v-model="filtros.status" class="input">
        <option value="">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
        <option value="ferias">Férias</option>
      </select>
    </div>

    <div v-if="profissionaisFiltrados.length">
      <div class="overflow-x-auto">
        <table class="min-w-full border text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="border px-4 py-2">Nome</th>
              <th class="border px-4 py-2">Especialidade</th>
              <th class="border px-4 py-2">Telefone</th>
              <th class="border px-4 py-2">Email</th>
              <th class="border px-4 py-2">Status</th>
              <th class="border px-4 py-2">Salário</th>
              <th class="border px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="profissional in profissionaisFiltrados"
              :key="profissional.cpf"
            >
              <td class="border px-4 py-2">
                {{ profissional.nome }} {{ profissional.sobrenome }}
              </td>
              <td class="border px-4 py-2">
                <span
                  class="badge"
                  :class="getBadgeClass(profissional.especialidade)"
                >
                  {{ profissional.especialidade }}
                </span>
              </td>
              <td class="border px-4 py-2">{{ profissional.telefone }}</td>
              <td class="border px-4 py-2">{{ profissional.email }}</td>
              <td class="border px-4 py-2">
                <span
                  class="badge"
                  :class="getStatusClass(profissional.status)"
                >
                  {{ getStatusText(profissional.status) }}
                </span>
              </td>
              <td class="border px-4 py-2">R$ {{ profissional.salario }}</td>
              <td class="border px-4 py-2">
                <div class="flex gap-2">
                  <button
                    class="btn-sm"
                    @click="visualizar(profissional)"
                    title="Visualizar"
                  >
                    👁️
                  </button>
                  <button
                    class="btn-sm"
                    @click="editar(profissional)"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn-sm"
                    @click="alterarStatus(profissional)"
                    title="Alterar Status"
                  >
                    🔄
                  </button>
                  <button
                    class="btn-danger-sm"
                    @click="excluir(profissional)"
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
        Mostrando {{ profissionaisFiltrados.length }} de
        {{ profissionais.length }} profissionais
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-gray-600 mb-4">
        {{
          filtros.busca || filtros.especialidade || filtros.status
            ? "Nenhum profissional encontrado para os filtros aplicados."
            : "Nenhum profissional cadastrado."
        }}
      </p>
      <button class="btn" @click="$router.push('/profissional/cadastro')">
        Cadastrar Primeiro Profissional
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
  name: "ProfissionalConsultaView",
  setup() {
    const router = useRouter();
    const { showToast, confirmDelete, showSuccess, showError, Swal } =
      useSweetAlert();

    const filtros = ref({
      busca: "",
      especialidade: "",
      status: "",
    });

    const profissionais = ref([
      {
        nome: "Carlos",
        sobrenome: "Silva",
        telefone: "(11) 99999-1111",
        cpf: "123.456.789-00",
        email: "carlos@barbearia.com",
        especialidade: "Barbeiro",
        salario: "2500.00",
        status: "ativo",
        dataNascimento: "1985-03-15",
      },
      {
        nome: "Ana",
        sobrenome: "Santos",
        telefone: "(21) 98765-4321",
        cpf: "987.654.321-00",
        email: "ana@barbearia.com",
        especialidade: "Cabeleireiro",
        salario: "3000.00",
        status: "ativo",
        dataNascimento: "1990-07-22",
      },
      {
        nome: "Pedro",
        sobrenome: "Oliveira",
        telefone: "(31) 91234-5678",
        cpf: "456.789.123-00",
        email: "pedro@barbearia.com",
        especialidade: "Esteticista",
        salario: "2800.00",
        status: "ferias",
        dataNascimento: "1988-12-10",
      },
    ]);

    const profissionaisFiltrados = computed(() => {
      return profissionais.value.filter((p) => {
        const buscaMatch =
          !filtros.value.busca ||
          p.nome.toLowerCase().includes(filtros.value.busca.toLowerCase()) ||
          p.sobrenome
            .toLowerCase()
            .includes(filtros.value.busca.toLowerCase()) ||
          p.cpf.includes(filtros.value.busca) ||
          p.email.toLowerCase().includes(filtros.value.busca.toLowerCase());

        const especialidadeMatch =
          !filtros.value.especialidade ||
          p.especialidade === filtros.value.especialidade;

        const statusMatch =
          !filtros.value.status || p.status === filtros.value.status;

        return buscaMatch && especialidadeMatch && statusMatch;
      });
    });

    function getBadgeClass(especialidade: string) {
      const classes: Record<string, string> = {
        Barbeiro: "bg-blue-100 text-blue-800",
        Cabeleireiro: "bg-pink-100 text-pink-800",
        Esteticista: "bg-purple-100 text-purple-800",
        Manicure: "bg-green-100 text-green-800",
        Pedicure: "bg-yellow-100 text-yellow-800",
      };
      return classes[especialidade] || "bg-gray-100 text-gray-800";
    }

    function getStatusClass(status: string) {
      const classes: Record<string, string> = {
        ativo: "bg-green-100 text-green-800",
        inativo: "bg-red-100 text-red-800",
        ferias: "bg-orange-100 text-orange-800",
      };
      return classes[status] || "bg-gray-100 text-gray-800";
    }

    function getStatusText(status: string) {
      const texts: Record<string, string> = {
        ativo: "Ativo",
        inativo: "Inativo",
        ferias: "Férias",
      };
      return texts[status] || status;
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

    async function visualizar(profissional: any) {
      await Swal.fire({
        title: `${profissional.nome} ${profissional.sobrenome}`,
        html: `
          <div class="text-left">
            <p><strong>CPF:</strong> ${profissional.cpf}</p>
            <p><strong>Telefone:</strong> ${profissional.telefone}</p>
            <p><strong>Email:</strong> ${profissional.email}</p>
            <p><strong>Especialidade:</strong> ${profissional.especialidade}</p>
            <p><strong>Salário:</strong> R$ ${profissional.salario}</p>
            <p><strong>Status:</strong> ${getStatusText(profissional.status)}</p>
            <p><strong>Idade:</strong> ${calcularIdade(profissional.dataNascimento)} anos</p>
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

    function editar(profissional: any) {
      showToast.info("Redirecionando para edição...");
      router.push(`/profissional/editar/${profissional.cpf}`);
    }

    async function alterarStatus(profissional: any) {
      const { value: novoStatus } = await Swal.fire({
        title: `Alterar status de ${profissional.nome}`,
        input: "select",
        inputOptions: {
          ativo: "Ativo",
          inativo: "Inativo",
          ferias: "Férias",
        },
        inputValue: profissional.status,
        showCancelButton: true,
        confirmButtonText: "Alterar",
        cancelButtonText: "Cancelar",
        customClass: {
          confirmButton: "btn btn-primary me-2",
          cancelButton: "btn btn-secondary",
        },
        buttonsStyling: false,
      });

      if (novoStatus && novoStatus !== profissional.status) {
        profissional.status = novoStatus;
        showSuccess(
          "Status alterado!",
          `Status de ${profissional.nome} alterado para ${getStatusText(novoStatus)}.`
        );
        showToast.success("Status alterado com sucesso!");
      }
    }

    async function excluir(profissional: any) {
      const confirmed = await confirmDelete(
        "Excluir profissional",
        `Tem certeza que deseja excluir ${profissional.nome} ${profissional.sobrenome}? Esta ação não pode ser desfeita.`,
        "Sim, excluir profissional"
      );

      if (confirmed) {
        try {
          
          await new Promise((resolve) => setTimeout(resolve, 1000));

          
          profissionais.value = profissionais.value.filter(
            (p) => p.cpf !== profissional.cpf
          );

          showSuccess(
            "Profissional excluído!",
            `${profissional.nome} ${profissional.sobrenome} foi excluído com sucesso.`
          );

          showToast.success("Profissional excluído com sucesso!");
        } catch (error) {
          showError(
            "Erro ao excluir",
            "Ocorreu um erro ao excluir o profissional. Tente novamente."
          );
        }
      }
    }

    onMounted(() => {
      feather.replace();
    });

    return {
      filtros,
      profissionais,
      profissionaisFiltrados,
      getBadgeClass,
      getStatusClass,
      getStatusText,
      visualizar,
      editar,
      alterarStatus,
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
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
