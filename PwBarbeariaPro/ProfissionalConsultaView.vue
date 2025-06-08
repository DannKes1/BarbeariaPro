<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Consultar Profissionais</h1>

    <input
      v-model="busca"
      type="text"
      placeholder="Buscar por nome, CPF, e-mail ou especialidade"
      class="input w-full mb-4"
    />

    <div v-if="profissionaisFiltrados.length">
      <table class="min-w-full border text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-4 py-2">Nome</th>
            <th class="border px-4 py-2">Telefone</th>
            <th class="border px-4 py-2">CPF</th>
            <th class="border px-4 py-2">E-mail</th>
            <th class="border px-4 py-2">Nascimento</th>
            <th class="border px-4 py-2">Especialidade</th>
            <th class="border px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prof in profissionaisFiltrados" :key="prof.cpf">
            <td class="border px-4 py-2">
              {{ prof.nome }} {{ prof.sobrenome }}
            </td>
            <td class="border px-4 py-2">{{ prof.telefone }}</td>
            <td class="border px-4 py-2">{{ prof.cpf }}</td>
            <td class="border px-4 py-2">{{ prof.email }}</td>
            <td class="border px-4 py-2">{{ prof.dataNascimento }}</td>
            <td class="border px-4 py-2">{{ prof.especialidade }}</td>
            <td class="border px-4 py-2">
              <button
                class="btn text-sm mr-2"
                @click="$router.push(`/profissional/editar/${prof.cpf}`)"
              >
                Editar
              </button>
              <button class="btn-danger text-sm" @click="excluir(prof)">
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-gray-600 mt-4">Nenhum profissional encontrado.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import feather from "feather-icons";

export default defineComponent({
  name: "ProfissionalConsultaView",
  setup() {
    const busca = ref("");

    const profissionais = ref([
      {
        nome: "Lucas",
        sobrenome: "Oliveira",
        telefone: "(11) 91234-5678",
        cpf: "111.222.333-44",
        email: "lucas@barber.com",
        dataNascimento: "1990-07-10",
        especialidade: "Barbeiro",
      },
      {
        nome: "Ana",
        sobrenome: "Lima",
        telefone: "(21) 99876-5432",
        cpf: "555.666.777-88",
        email: "ana@spa.com",
        dataNascimento: "1988-02-25",
        especialidade: "Esteticista",
      },
    ]);

    const profissionaisFiltrados = computed(() => {
      const filtro = busca.value.toLowerCase();
      return profissionais.value.filter((p) => {
        return (
          p.nome.toLowerCase().includes(filtro) ||
          p.sobrenome.toLowerCase().includes(filtro) ||
          p.cpf.includes(filtro) ||
          (p.email && p.email.toLowerCase().includes(filtro)) ||
          (p.especialidade && p.especialidade.toLowerCase().includes(filtro))
        );
      });
    });

    function excluir(prof: any) {
      const temAgendamentosFuturos = false; // simulação descarada

      if (temAgendamentosFuturos) {
        alert(
          `Não é possível excluir ${prof.nome} pois há agendamentos futuros.`
        );
        return;
      }

      const confirmar = window.confirm(
        `Deseja realmente excluir ${prof.nome} ${prof.sobrenome}?`
      );
      if (confirmar) {
        profissionais.value = profissionais.value.filter(
          (p) => p.cpf !== prof.cpf
        );
        console.log(
          `Profissional ${prof.nome} marcado como inativo (soft delete).`
        );
        // Aqui entraria o código para notificar cliente por e-mail. Mas você sabe... não temos servidor.
      }
    }

    onMounted(() => {
      feather.replace();
    });

    return {
      busca,
      profissionais,
      profissionaisFiltrados,
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
