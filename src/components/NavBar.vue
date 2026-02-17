<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container">
      <router-link to="/" class="navbar-brand">
        <i class="bi bi-mortarboard-fill me-2"></i>
        Grade Amendment System
      </router-link>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link to="/" class="nav-link" active-class="active">
              <i class="bi bi-house-door me-1"></i>
              首頁
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/amendments" class="nav-link" active-class="active">
              <i class="bi bi-table me-1"></i>
              修改記錄
            </router-link>
          </li>
          <li class="nav-item dropdown">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              id="userDropdown" 
              role="button" 
              data-bs-toggle="dropdown"
            >
              <i class="bi bi-person-circle me-1"></i>
              {{ amendmentStore.currentUser.name }}
              <span class="badge bg-light text-primary ms-2">{{ amendmentStore.currentUser.role }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><h6 class="dropdown-header">切換角色（測試）</h6></li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="switchRole('Teacher', 'John Doe')">
                  <i class="bi bi-person me-2"></i>Teacher
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="switchRole('Programme Director', 'Jane Smith')">
                  <i class="bi bi-person-badge me-2"></i>Programme Director
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="switchRole('Admin', 'Admin User')">
                  <i class="bi bi-shield-lock me-2"></i>Admin
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAmendmentStore } from '@/stores/amendmentStore'

const amendmentStore = useAmendmentStore()

const switchRole = (role, name) => {
  amendmentStore.setUserRole(role, name)
}
</script>

<style scoped>
.navbar {
  margin-bottom: 0;
}

.navbar-brand {
  font-weight: 600;
  font-size: 1.25rem;
}

.nav-link {
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-link:hover {
  transform: translateY(-2px);
}

.nav-link.active {
  font-weight: 700;
}

.dropdown-item {
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #4472C4;
  color: white;
}

.badge {
  font-weight: 600;
}
</style>
