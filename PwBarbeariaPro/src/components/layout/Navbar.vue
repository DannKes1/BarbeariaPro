<template>
    <nav class="navbar navbar-expand navbar-light navbar-bg">
      <a class="sidebar-toggle js-sidebar-toggle" @click="toggleSidebar">
        <i class="hamburger align-self-center"></i>
      </a>
  
      <div class="navbar-collapse collapse">
        <ul class="navbar-nav navbar-align">
          <li class="nav-item dropdown">
            <a class="nav-icon dropdown-toggle" href="#" id="alertsDropdown" data-bs-toggle="dropdown">
              <div class="position-relative">
                <i class="align-middle" data-feather="bell"></i>
                <span class="indicator">4</span>
              </div>
            </a>
            <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end py-0" aria-labelledby="alertsDropdown">
              <div class="dropdown-menu-header">4 New Notifications</div>
              <div class="list-group">
                <a href="#" class="list-group-item">
                  <div class="row g-0 align-items-center">
                    <div class="col-2">
                      <i class="text-danger" data-feather="alert-circle"></i>
                    </div>
                    <div class="col-10">
                      <div class="text-dark">Update completed</div>
                      <div class="text-muted small mt-1">Restart server 12 to complete the update.</div>
                      <div class="text-muted small mt-1">30m ago</div>
                    </div>
                  </div>
                </a>
                <!-- Outros itens de notificação -->
              </div>
              <div class="dropdown-menu-footer">
                <a href="#" class="text-muted">Show all notifications</a>
              </div>
            </div>
          </li>
  
          <!-- Dropdown de mensagens -->
          <li class="nav-item dropdown">
            <a class="nav-icon dropdown-toggle" href="#" id="messagesDropdown" data-bs-toggle="dropdown">
              <div class="position-relative">
                <i class="align-middle" data-feather="message-square"></i>
              </div>
            </a>
            <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end py-0" aria-labelledby="messagesDropdown">
              <div class="dropdown-menu-header">
                <div class="position-relative">4 New Messages</div>
              </div>
              <div class="list-group">
                <a href="#" class="list-group-item">
                  <div class="row g-0 align-items-center">
                    <div class="col-2">
                      <img src="@/assets/img/avatars/avatar-5.jpg" class="avatar img-fluid rounded-circle" alt="Vanessa Tucker">
                    </div>
                    <div class="col-10 ps-2">
                      <div class="text-dark">Vanessa Tucker</div>
                      <div class="text-muted small mt-1">Nam pretium turpis et arcu. Duis arcu tortor.</div>
                      <div class="text-muted small mt-1">15m ago</div>
                    </div>
                  </div>
                </a>
                <!-- Outras mensagens -->
              </div>
              <div class="dropdown-menu-footer">
                <a href="#" class="text-muted">Show all messages</a>
              </div>
            </div>
          </li>
  
          <!-- Dropdown de usuário -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle d-none d-sm-inline-block" href="#" data-bs-toggle="dropdown">
              <img src="@/assets/img/avatars/avatar.jpg" class="avatar img-fluid rounded me-1" alt="Charles Hall" />
              <span class="text-dark">Charles Hall</span>
            </a>
            <div class="dropdown-menu dropdown-menu-end">
              <router-link class="dropdown-item" to="/profile">
                <i class="align-middle me-1" data-feather="user"></i> Profile
              </router-link>
              <a class="dropdown-item" href="#">
                <i class="align-middle me-1" data-feather="pie-chart"></i> Analytics
              </a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#">
                <i class="align-middle me-1" data-feather="settings"></i> Settings & Privacy
              </a>
              <a class="dropdown-item" href="#">
                <i class="align-middle me-1" data-feather="help-circle"></i> Help Center
              </a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#">Log out</a>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue'
//   import feather from 'feather-icons'
  
  export default defineComponent({
    name: 'Navbar',
    methods: {
      toggleSidebar() {
        // Implemente a lógica para alternar a sidebar
        document.body.classList.toggle('sidebar-collapsed')
      }
    },
    mounted() {
    //   feather.replace()
    }
  })
  </script>
  
  <style scoped>
  @import '@/assets/css/app.css';
  </style>