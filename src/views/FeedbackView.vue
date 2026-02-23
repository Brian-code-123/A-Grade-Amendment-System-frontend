<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const feedbacks = ref([])
const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const form = ref({
  category: 'General',
  subject: '',
  message: '',
  rating: 0
})

const categories = ['General', 'Bug Report', 'Feature Request', 'UI/UX', 'Performance', 'Other']
const hoverRating = ref(0)

async function submitFeedback() {
  errorMsg.value = ''
  if (!form.value.subject || !form.value.message) {
    errorMsg.value = 'Subject and message are required'
    return
  }
  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: auth.authHeaders(),
      body: JSON.stringify(form.value)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)
    successMsg.value = 'Feedback submitted successfully!'
    form.value = { category: 'General', subject: '', message: '', rating: 0 }
    fetchFeedbacks()
  } catch (e) {
    errorMsg.value = e.message
  }
}

async function fetchFeedbacks() {
  loading.value = true
  try {
    const res = await fetch('/api/feedback', { headers: auth.authHeaders() })
    if (res.ok) feedbacks.value = await res.json()
  } catch (e) { /* ignore */ } finally {
    loading.value = false
  }
}

onMounted(() => fetchFeedbacks())
</script>

<template>
  <div class="container py-4">
    <h3 class="fw-bold mb-3"><i class="bi bi-chat-dots"></i> Feedback</h3>

    <div class="row g-4">
      <div class="col-lg-6">
        <div class="card shadow-sm">
          <div class="card-header fw-bold">Submit Feedback</div>
          <div class="card-body">
            <div v-if="successMsg" class="alert alert-success small">{{ successMsg }}</div>
            <div v-if="errorMsg" class="alert alert-danger small">{{ errorMsg }}</div>

            <form @submit.prevent="submitFeedback">
              <div class="mb-3">
                <label class="form-label">Category</label>
                <select v-model="form.category" class="form-select">
                  <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Subject</label>
                <input v-model="form.subject" class="form-control" placeholder="Brief summary..." required />
              </div>
              <div class="mb-3">
                <label class="form-label">Message</label>
                <textarea v-model="form.message" class="form-control" rows="4" placeholder="Describe your feedback in detail..." required></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Rating</label>
                <div class="d-flex gap-1">
                  <i v-for="i in 5" :key="i"
                    class="bi fs-4 cursor-pointer"
                    :class="(hoverRating || form.rating) >= i ? 'bi-star-fill text-warning' : 'bi-star text-muted'"
                    @mouseenter="hoverRating = i"
                    @mouseleave="hoverRating = 0"
                    @click="form.rating = i"
                    style="cursor:pointer"></i>
                </div>
              </div>
              <button type="submit" class="btn btn-primary"><i class="bi bi-send"></i> Submit Feedback</button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card shadow-sm">
          <div class="card-header fw-bold">Your Feedback History</div>
          <div class="card-body p-0">
            <div v-if="loading" class="text-center py-3"><div class="spinner-border spinner-border-sm"></div></div>
            <div v-else-if="feedbacks.length === 0" class="text-center text-muted py-3">No feedback yet</div>
            <div v-for="f in feedbacks" :key="f._id" class="border-bottom px-3 py-2">
              <div class="d-flex justify-content-between">
                <span class="fw-semibold">{{ f.subject }}</span>
                <span class="badge bg-secondary">{{ f.category }}</span>
              </div>
              <div class="small text-muted">{{ f.message }}</div>
              <div class="d-flex justify-content-between mt-1">
                <div>
                  <i v-for="i in 5" :key="i" class="bi small" :class="f.rating >= i ? 'bi-star-fill text-warning' : 'bi-star text-muted'"></i>
                </div>
                <small class="text-muted">{{ new Date(f.created_at).toLocaleDateString() }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
