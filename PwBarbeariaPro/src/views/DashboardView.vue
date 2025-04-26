<template>
  <div class="container-fluid p-0">
    <h1 class="h3 mb-3"><strong>Analytics</strong> Dashboard</h1>
    
    <div class="row">
      <div class="col-xl-6 col-xxl-5 d-flex">
        <div class="w-100">
          <div class="row">
            <div class="col-sm-6">
              <div class="card">
                <div class="card-body">
                  <div class="row">
                    <div class="col mt-0">
                      <h5 class="card-title">Sales</h5>
                    </div>
                    <div class="col-auto">
                      <div class="stat text-primary">
                        <i class="align-middle" data-feather="truck"></i>
                      </div>
                    </div>
                  </div>
                  <h1 class="mt-1 mb-3">2.382</h1>
                  <div class="mb-0">
                    <span class="text-danger"> <i class="mdi mdi-arrow-bottom-right"></i> -3.65% </span>
                    <span class="text-muted">Since last week</span>
                  </div>
                </div>
              </div>
              <!-- Outros cards -->
            </div>
          </div>
        </div>
      </div>
      
      <!-- Gráficos e outros componentes -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import feather from 'feather-icons'

export default defineComponent({
  name: 'DashboardView',
  setup() {
    onMounted(() => {
      feather.replace()
      // Inicialize os gráficos aqui
    })
  }
})
</script>

<style scoped>
@import '@/assets/css/app.css';
</style>