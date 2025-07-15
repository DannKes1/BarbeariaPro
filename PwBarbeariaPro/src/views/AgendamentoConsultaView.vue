<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Consultar Agendamentos</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <input
        v-model="filtro.nome"
        type="text"
        placeholder="Buscar por cliente"
        class="input"
      />
      <input v-model="filtro.data" type="date" class="input" />
    </div>

    <div v-if="agendamentosFiltrados.length">
      <table class="min-w-full border text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-4 py-2">Cliente</th>
            <th class="border px-4 py-2">Serviço</th>
            <th class="border px-4 py-2">Profissional</th>
            <th class="border px-4 py-2">Data</th>
            <th class="border px-4 py-2">Horário</th>
            <th class="border px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in agendamentosFiltrados" :key="a.id">
            <td class="border px-4 py-2">{{ a.cliente }}</td>
            <td class="border px-4 py-2">{{ a.servico }}</td>
            <td class="border px-4 py-2">{{ a.profissional }}</td>
            <td class="border px-4 py-2">{{ formatarData(a.data) }}</td>
            <td class="border px-4 py-2">{{ a.horario }}</td>
            <td class="border px-4 py-2">
              <router-link
                :to="`/agendamento/editar/${a.id}`"
                class="btn text-sm mr-2"
              >
                Editar
              </router-link>
              <button
                class="btn-danger text-sm"
                @click="cancelarAgendamento(a)"
              >
                Cancelar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-gray-600 mt-4">Nenhum agendamento encontrado.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { api } from "@/common/http";
import { useSweetAlert } from "@/composables/useSweetAlert";
import feather from "feather-icons";

export default defineComponent({
  name: "AgendamentoConsultaView",
  setup() {
    const filtro = ref({ nome: "", data: "" });
    const agendamentos = ref<any[]>([]);
    const { showError, showSuccess } = useSweetAlert();

    const agendamentosFiltrados = computed(() => {
      return agendamentos.value.filter((a) => {
        const nomeOk = a.cliente
          .toLowerCase()
          .includes(filtro.value.nome.toLowerCase());
        const dataOk = !filtro.value.data || a.data === filtro.value.data;
        return nomeOk && dataOk;
      });
    });

    async function carregarAgendamentos() {
      try {
        const { data } = await api.get("/api/Agendamento");
        agendamentos.value = data;
      } catch {
        showError("Erro", "Erro ao carregar agendamentos.");
      }
    }

    async function cancelarAgendamento(a: any) {
      const confirmado = window.confirm(`Cancelar agendamento de ${a.cliente}?`);
      if (!confirmado) return;

      try {
        await api.delete(`/api/Agendamento/${a.id}`);
        agendamentos.value = agendamentos.value.filter((x) => x.id !== a.id);
        showSuccess("Cancelado", "Agendamento cancelado com sucesso.");
      } catch {
        showError("Erro", "Erro ao cancelar o agendamento.");
      }
    }

    function formatarData(dataISO: string): string {
      const [ano, mes, dia] = dataISO.split("-");
      return `${dia}/${mes}/${ano}`;
    }

    onMounted(() => {
      feather.replace();
      carregarAgendamentos();
    });

    return {
      filtro,
      agendamentosFiltrados,
      cancelarAgendamento,
      formatarData,
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
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  display: inline-block;
  cursor: pointer;
}
.btn-danger {
  background-color: #dc2626;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  display: inline-block;
  cursor: pointer;
}
</style>

