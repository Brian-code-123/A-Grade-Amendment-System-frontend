<template>
  <div class="users">
    <h1>Users Management</h1>
    
    <div class="loading" v-if="loading">Loading...</div>
    <div class="error" v-else-if="error">{{ error }}</div>
    
    <div v-else>
      <div class="users-list">
        <h2>Users List</h2>
        <ul v-if="users.length > 0">
          <li v-for="user in users" :key="user.id">
            {{ user.name || user.username || user.id }}
          </li>
        </ul>
        <p v-else>No users found</p>
      </div>
      
      <div class="add-user">
        <h2>Add New User</h2>
        <form @submit.prevent="handleAddUser">
          <input 
            v-model="newUser.name" 
            type="text" 
            placeholder="Name" 
            required 
          />
          <input 
            v-model="newUser.email" 
            type="email" 
            placeholder="Email" 
            required 
          />
          <button type="submit">Add User</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const users = ref([])
const loading = ref(false)
const error = ref(null)
const newUser = ref({
  name: '',
  email: ''
})

const fetchUsers = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.getUsers()
    users.value = response.data
  } catch (err) {
    error.value = 'Failed to fetch users: ' + err.message
  } finally {
    loading.value = false
  }
}

const handleAddUser = async () => {
  try {
    await api.createUser(newUser.value)
    newUser.value = { name: '', email: '' }
    await fetchUsers()
  } catch (err) {
    error.value = 'Failed to add user: ' + err.message
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users {
  max-width: 800px;
  margin: 0 auto;
}

.users-list {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.users-list ul {
  list-style: none;
  padding: 0;
}

.users-list li {
  padding: 0.75rem;
  margin: 0.5rem 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.add-user {
  padding: 1.5rem;
  background-color: #f0f8ff;
  border-radius: 8px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background-color: #0056b3;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error {
  color: #dc3545;
}

h1, h2 {
  color: #333;
  margin-bottom: 1rem;
}
</style>
