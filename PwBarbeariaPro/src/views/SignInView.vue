<template>
  <main class="d-flex w-100">
    <div class="container d-flex flex-column">
      <div class="row vh-100">
        <div class="col-sm-10 col-md-8 col-lg-6 mx-auto d-table h-100">
          <div class="d-table-cell align-middle">
            <div class="text-center mt-4">
              <h1 class="h2">Welcome back, Charles</h1>
              <p class="lead">
                Sign in to your account to continue
              </p>
            </div>

            <div class="card">
              <div class="card-body">
                <div class="m-sm-4">
                  <div class="text-center">
                    <img src="@/assets/img/avatars/avatar.jpg" alt="Charles Hall" class="img-fluid rounded-circle" width="132" height="132" />
                  </div>
                  <form>
                    <div class="mb-3">
                      <label class="form-label">Email</label>
                      <input class="form-control form-control-lg" type="email" name="email" placeholder="Enter your email" />
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Password</label>
                      <input class="form-control form-control-lg" type="password" name="password" placeholder="Enter your password" />
                      <small>
                        <a href="#">Forgot password?</a>
                      </small>
                    </div>
                    <div>
                      <label class="form-check">
                        <input class="form-check-input" type="checkbox" value="remember-me" checked>
                        <span class="form-check-label">
                          Remember me next time
                        </span>
                      </label>
                    </div>
                    <div class="text-center mt-3">
                      <router-link to="/" class="btn btn-lg btn-primary">Sign in</router-link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SignInView'
})
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}
</style>