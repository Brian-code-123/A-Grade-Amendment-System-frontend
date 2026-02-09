import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  // Users API
  getUsers() {
    return apiClient.get('/users')
  },
  
  getUserById(id) {
    return apiClient.get(`/users/${id}`)
  },
  
  createUser(userData) {
    return apiClient.post('/users', userData)
  },
  
  updateUser(id, userData) {
    return apiClient.put(`/users/${id}`, userData)
  },
  
  deleteUser(id) {
    return apiClient.delete(`/users/${id}`)
  },
  
  // General API
  get(url) {
    return apiClient.get(url)
  },
  
  post(url, data) {
    return apiClient.post(url, data)
  },
  
  put(url, data) {
    return apiClient.put(url, data)
  },
  
  delete(url) {
    return apiClient.delete(url)
  }
}
