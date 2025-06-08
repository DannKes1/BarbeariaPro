<template>
  <main class="content">
    <div class="container-fluid p-0">
      <!-- cabeçalho -->
      <div class="mb-3">
        <h1 class="h3 d-inline align-middle">Profile</h1>
        <a class="badge bg-dark text-white ms-2" href="#"
          >Get more page examples</a
        >
      </div>

      <div class="row">
        <!-- COLUNA ESQUERDA -->
        <div class="col-md-4 col-xl-3">
          <div class="card mb-3">
            <!-- Profile Details -->
            <div class="card-header">
              <h5 class="card-title mb-0">Profile Details</h5>
            </div>
            <div class="card-body text-center">
              <img
                src="@/assets/img/avatars/avatar-4.jpg"
                class="img-fluid rounded-circle mb-2"
                width="128"
                height="128"
              />
              <h5 class="card-title mb-0">Christina Mason</h5>
              <div class="text-muted mb-2">Lead Developer</div>
              <button class="btn btn-primary btn-sm">Follow</button>
              <button class="btn btn-primary btn-sm">
                <span data-feather="message-square"></span> Message
              </button>
            </div>

            <!-- separador -->
            <hr class="my-0" />

            <!-- Skills -->
            <div class="card-body">
              <h5 class="h6 card-title">Skills</h5>
              <a href="#" class="badge bg-primary me-1 my-1">HTML</a>
              <a href="#" class="badge bg-primary me-1 my-1">JavaScript</a>
              <a href="#" class="badge bg-primary me-1 my-1">Sass</a>
              <a href="#" class="badge bg-primary me-1 my-1">Angular</a>
              <a href="#" class="badge bg-primary me-1 my-1">Vue</a>
              <a href="#" class="badge bg-primary me-1 my-1">React</a>
              <a href="#" class="badge bg-primary me-1 my-1">Redux</a>
              <a href="#" class="badge bg-primary me-1 my-1">UI</a>
              <a href="#" class="badge bg-primary me-1 my-1">UX</a>
            </div>

            <!-- separador -->
            <hr class="my-0" />

            <!-- About -->
            <div class="card-body">
              <h5 class="h6 card-title">About</h5>
              <ul class="list-unstyled mb-0">
                <li class="mb-1">
                  <span data-feather="home" class="feather-sm me-1"></span>
                  Lives in <a href="#">San Francisco, SA</a>
                </li>
                <li class="mb-1">
                  <span data-feather="briefcase" class="feather-sm me-1"></span>
                  Works at <a href="#">GitHub</a>
                </li>
                <li class="mb-1">
                  <span data-feather="map-pin" class="feather-sm me-1"></span>
                  From <a href="#">Boston</a>
                </li>
              </ul>
            </div>

            <!-- separador -->
            <hr class="my-0" />

            <!-- Elsewhere -->
            <div class="card-body">
              <h5 class="h6 card-title">Elsewhere</h5>
              <ul class="list-unstyled mb-0">
                <li class="mb-1"><a href="#">staciehall.co</a></li>
                <li class="mb-1"><a href="#">Twitter</a></li>
                <li class="mb-1"><a href="#">Facebook</a></li>
                <li class="mb-1"><a href="#">Instagram</a></li>
                <li class="mb-1"><a href="#">LinkedIn</a></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- COLUNA DIREITA -->
        <div class="col-md-8 col-xl-9">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Activities</h5>
            </div>
            <div class="card-body h-100">
              <!-- item 1 -->
              <div class="d-flex align-items-start">
                <img
                  src="@/assets/img/avatars/avatar-2.jpg"
                  class="rounded-circle me-2"
                  width="36"
                  height="36"
                />
                <div class="flex-grow-1">
                  <small class="float-end text-navy">5m ago</small><br />
                  <strong>Vanessa Tucker</strong> started following
                  <strong>Christina Mason</strong><br />
                  <small class="text-muted">Today 7:51 pm</small>
                </div>
              </div>
              <hr />

              <!-- item 2 -->
              <div class="d-flex align-items-start">
                <img
                  src="@/assets/img/avatars/avatar-5.jpg"
                  class="rounded-circle me-2"
                  width="36"
                  height="36"
                />
                <div class="flex-grow-1">
                  <small class="float-end text-navy">30m ago</small><br />
                  <strong>Charles Hall</strong> posted something on
                  <strong>Christina Mason</strong>'s timeline<br />
                  <small class="text-muted">Today 7:21 pm</small>
                  <div class="border text-sm text-muted p-2 mt-1">
                    Etiam rhoncus. Maecenas tempus, tellus eget condimentum
                    rhoncus…
                  </div>
                  <a href="#" class="btn btn-sm btn-danger mt-1">
                    <i data-feather="heart" class="feather-sm me-1"></i>Like
                  </a>
                </div>
              </div>
              <hr />

              <!-- … outros itens … -->

              <!-- botão Load more -->
              <div class="d-grid">
                <a href="#" class="btn btn-primary">Load more</a>
              </div>
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
  name: "ProfileView",
  setup() {
    onMounted(() => feather.replace());
  },
});
</script>

<style scoped>
@import "@/assets/css/app.css";
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap");
</style>
