<!-- src/views/BlankPage.vue -->
<template>
  <main class="content">
    <div class="container-fluid p-0">
      <h1 class="h3 mb-3">Blank Page</h1>
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Empty card</h5>
            </div>
            <div class="card-body">
              <!-- seu conteúdo aqui -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import feather from "feather-icons";

export default defineComponent({
  name: "Blank",
  setup() {
    onMounted(() => {
      feather.replace();
    });
  },
});
</script>

<style scoped>
@import "@/assets/css/app.css";
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap");
</style>
