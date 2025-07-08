<template>
  <div>
    <div class="mb-3">
      <h1 class="h3 d-inline align-middle">Feather</h1>
      <a class="badge bg-dark text-white ms-2" href="#"> Get more icons </a>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Feather Icons</h3>
        <h6 class="card-subtitle text-muted">
          Simply beautiful open source icons
        </h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div
            v-for="icon in icons"
            :key="icon"
            class="col-12 col-md-6 col-lg-3 mb-2"
          >
            <i class="align-middle me-2" :data-feather="icon"></i>
            <span class="align-middle">{{ icon }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import feather from "feather-icons";
import iconList from "@/data/feather-icons.json";

export default defineComponent({
  name: "IconsFeatherView",
  setup() {
    onMounted(() => {
      feather.replace();
    });

    return {
      icons: iconList,
    };
  },
});
</script>

<style scoped>
/* scoped styles se precisar customizar */
</style>
