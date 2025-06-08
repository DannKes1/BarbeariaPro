<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Cadastrar Agendamento</h1>

    <form @submit.prevent="cadastrarAgendamento" class="space-y-4">
      <div>
        <label>Cliente</label>
        <select v-model="agendamento.cliente" class="input" required>
          <option disabled value="">Selecione um cliente</option>
          <option v-for="c in clientes" :key="c.cpf" :value="c.nome">
            {{ c.nome }} {{ c.sobrenome }}
          </option>
        </select>
      </div>

      <div>
        <label>Serviço</label>
        <select
          v-model="agendamento.servico"
          class="input"
          required
          @change="filtrarProfissionais"
        >
          <option disabled value="">Selecione um serviço</option>
          <option v-for="s in servicos" :key="s.nome" :value="s.nome">
            {{ s.nome }}
          </option>
        </select>
      </div>

      <div>
        <label>Profissional</label>
        <select v-model="agendamento.profissional" class="input" required>
          <option disabled value="">Selecione um profissional</option>
          <option
            v-for="p in profissionaisFiltrados"
            :key="p.nome"
            :value="p.nome"
          >
            {{ p.nome }} ({{ p.especialidade }})
          </option>
        </select>
      </div>

      <div>
        <label>Data</label>
        <input type="date" v-model="agendamento.data" class="input" required />
      </div>

      <div>
        <label>Horário</label>
        <input
          type="time"
          v-model="agendamento.horario"
          class="input"
          required
        />
      </div>

      <button class="btn" type="submit">Confirmar Agendamento</button>
    </form>

    <p v-if="sucesso" class="text-green-600 mt-4">
      Agendamento realizado com sucesso!
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

interface Cliente {
  nome: string;
  sobrenome: string;
  cpf: string;
}

interface Servico {
  nome: string;
  especialidade: string;
}

interface Profissional {
  nome: string;
  especialidade: string;
}

interface Agendamento {
  cliente: string;
  servico: string;
  profissional: string;
  data: string;
  horario: string;
}

interface AgendamentoExistente {
  profissional: string;
  data: string;
  horario: string;
}

export default defineComponent({
  name: "AgendamentoCadastroView",
  setup() {
    const clientes = ref<Cliente[]>([
      { nome: "João", sobrenome: "Silva", cpf: "123.456.789-00" },
      { nome: "Maria", sobrenome: "Santos", cpf: "987.654.321-00" },
    ]);

    const servicos = ref<Servico[]>([
      { nome: "Corte Masculino", especialidade: "Barbeiro" },
      { nome: "Limpeza de Pele", especialidade: "Esteticista" },
    ]);

    const profissionais = ref<Profissional[]>([
      { nome: "Carlos", especialidade: "Barbeiro" },
      { nome: "Ana", especialidade: "Esteticista" },
      { nome: "Lucas", especialidade: "Barbeiro" },
    ]);

    const profissionaisFiltrados = ref<Profissional[]>([]);

    const agendamentosExistentes = ref<AgendamentoExistente[]>([
      {
        profissional: "Carlos",
        data: "2024-05-15",
        horario: "14:00",
      },
      {
        profissional: "Ana",
        data: "2024-05-16",
        horario: "09:30",
      },
    ]);

    const agendamento = ref<Agendamento>({
      cliente: "",
      servico: "",
      profissional: "",
      data: "",
      horario: "",
    });

    const sucesso = ref(false);

    function filtrarProfissionais() {
      const servicoSelecionado = servicos.value.find(
        (s) => s.nome === agendamento.value.servico
      );
      if (servicoSelecionado) {
        profissionaisFiltrados.value = profissionais.value.filter(
          (p) => p.especialidade === servicoSelecionado.especialidade
        );
        agendamento.value.profissional = "";
      }
    }

    function temConflito() {
      return agendamentosExistentes.value.some(
        (a) =>
          a.profissional === agendamento.value.profissional &&
          a.data === agendamento.value.data &&
          a.horario === agendamento.value.horario
      );
    }

    function cadastrarAgendamento() {
      if (
        !agendamento.value.cliente ||
        !agendamento.value.servico ||
        !agendamento.value.profissional ||
        !agendamento.value.data ||
        !agendamento.value.horario
      ) {
        alert("Preencha todos os campos.");
        return;
      }

      if (temConflito()) {
        alert("Já existe um agendamento com esse profissional nesse horário.");
        return;
      }

      console.log("Agendamento cadastrado:", agendamento.value);
      agendamentosExistentes.value.push({
        profissional: agendamento.value.profissional,
        data: agendamento.value.data,
        horario: agendamento.value.horario,
      });
      sucesso.value = true;
      setTimeout(() => (sucesso.value = false), 3000);
    }

    return {
      clientes,
      servicos,
      profissionais,
      profissionaisFiltrados,
      agendamento,
      sucesso,
      filtrarProfissionais,
      cadastrarAgendamento,
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
}
</style>
