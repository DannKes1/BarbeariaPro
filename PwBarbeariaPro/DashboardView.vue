<!-- src/views/DashboardView.vue -->
<template>
  <main class="content">
    <div class="container-fluid p-0">
      <h1 class="h3 mb-3"><strong>Analytics</strong> Dashboard</h1>

      <div class="row">
        <!-- Sales -->
        <div class="col-sm-6 col-xl-3 d-flex">
          <div class="card flex-fill">
            <div class="card-body">
              <h5 class="card-title">Sales</h5>
              <div class="stat text-primary float-end">
                <i class="align-middle" data-feather="truck"></i>
              </div>
              <h1 class="mt-1 mb-3">2.382</h1>
              <div>
                <span class="text-danger">-3.65%</span>
                <span class="text-muted"> Since last week</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Earnings -->
        <div class="col-sm-6 col-xl-3 d-flex">
          <div class="card flex-fill">
            <div class="card-body">
              <h5 class="card-title">Earnings</h5>
              <div class="stat text-primary float-end">
                <i class="align-middle" data-feather="dollar-sign"></i>
              </div>
              <h1 class="mt-1 mb-3">$21.300</h1>
              <div>
                <span class="text-success">6.65%</span>
                <span class="text-muted"> Since last week</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Visitors -->
        <div class="col-sm-6 col-xl-3 d-flex">
          <div class="card flex-fill">
            <div class="card-body">
              <h5 class="card-title">Visitors</h5>
              <div class="stat text-primary float-end">
                <i class="align-middle" data-feather="users"></i>
              </div>
              <h1 class="mt-1 mb-3">14.212</h1>
              <div>
                <span class="text-success">5.25%</span>
                <span class="text-muted"> Since last week</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Orders -->
        <div class="col-sm-6 col-xl-3 d-flex">
          <div class="card flex-fill">
            <div class="card-body">
              <h5 class="card-title">Orders</h5>
              <div class="stat text-primary float-end">
                <i class="align-middle" data-feather="shopping-cart"></i>
              </div>
              <h1 class="mt-1 mb-3">64</h1>
              <div>
                <span class="text-danger">-2.25%</span>
                <span class="text-muted"> Since last week</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Segunda linha: gráfico Recent Movement -->
      <div class="row">
        <div class="col-xl-6 col-xxl-7 d-flex">
          <div class="card flex-fill w-100">
            <div class="card-header">
              <h5 class="card-title mb-0">Recent Movement</h5>
            </div>
            <div class="card-body py-3">
              <div class="chart chart-sm">
                <canvas ref="lineChart"></canvas>
              </div>
            </div>
          </div>
        </div>
        <!-- se quiser, pode deixar as outras colunas vazias ou remover esse row entirely -->
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default defineComponent({
  name: "DashboardView",
  setup() {
    const lineChart = ref<HTMLCanvasElement | null>(null);

    onMounted(() => {
      if (!lineChart.value) return;
      const ctx = lineChart.value.getContext("2d");
      if (!ctx) return;

      const gradient = ctx.createLinearGradient(0, 0, 0, 225);
      gradient.addColorStop(0, "rgba(215, 227, 244, 1)");
      gradient.addColorStop(1, "rgba(215, 227, 244, 0)");

      new Chart(ctx, {
        type: "line",
        data: {
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Sales ($)",
              fill: true,
              backgroundColor: gradient,
              borderColor: (window as any).theme.primary,
              data: [
                2115, 1562, 1584, 1892, 1587, 1923, 2566, 2448, 2805, 3438,
                2917, 3327,
              ],
              tension: 0.4,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            filler: { propagate: false },
            tooltip: { intersect: false },
          },
          scales: {
            x: {
              reverse: true,
              grid: { color: "rgba(0,0,0,0)" },
            },
            y: {
              ticks: { stepSize: 1000 },
              grid: { color: "rgba(0,0,0,0)" },
            },
          },
        },
      });
    });

    return { lineChart };
  },
});
</script>

<style scoped>
@import "@/assets/css/app.css";
</style>
