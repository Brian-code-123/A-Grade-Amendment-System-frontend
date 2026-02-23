<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const isOpen = ref(false)
const route = useRoute()

const helpContent = computed(() => {
  const path = route.path
  if (path === '/' || path === '/home') {
    return {
      title: 'Home Page',
      tips: [
        'View the HKBU 2026 Academic Calendar with holidays and important dates.',
        'Use the arrow buttons to navigate between months.',
        'Check your notifications on the right sidebar.',
        'See recent submission history and their status.',
        'Use Quick Actions to create amendments or upload Excel files.'
      ]
    }
  }
  if (path === '/amendments') {
    return {
      title: 'Amendments Page',
      tips: [
        'Click "New Amendment" to create a grade change request.',
        'Fill in all required fields: Student ID, Name, Course Code, Grades, and Reason.',
        'Use the edit button to modify pending amendments.',
        'Delete amendments that are no longer needed.',
        'Download the Excel template for bulk imports.'
      ]
    }
  }
  if (path === '/excel-upload') {
    return {
      title: 'Excel Upload',
      tips: [
        'Download the template first to see the expected format.',
        'Drag & drop your Excel file or click Browse to select.',
        'Each row will be validated before import.',
        'Invalid rows will be shown with specific error messages.',
        'Valid grades: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F, I, W, P, NP'
      ]
    }
  }
  if (path === '/submissions') {
    return {
      title: 'Submissions',
      tips: [
        'Create a submission by selecting pending amendments.',
        'Give your submission a descriptive title.',
        'Click "Submit to Admin" to send for review.',
        'The admin will receive an email notification.',
        'Track the status: Draft > Submitted > Approved/Rejected.'
      ]
    }
  }
  if (path === '/admin') {
    return {
      title: 'Admin Panel',
      tips: [
        'Review submitted grade amendments.',
        'Click the eye icon to view amendment details.',
        'Approve or reject submissions with reasons.',
        'Print approved submissions for records.',
        'All actions are logged and tracked.'
      ]
    }
  }
  if (path === '/feedback') {
    return {
      title: 'Feedback',
      tips: [
        'Select a category that best describes your feedback.',
        'Provide a clear subject and detailed message.',
        'Rate your experience using the star rating.',
        'View your previous feedback in the history section.'
      ]
    }
  }
  if (path === '/login') {
    return {
      title: 'Login / Register',
      tips: [
        'Use your HKBU email to login or register.',
        'Choose your role: Programme Director or Admin.',
        'Programme Directors can create and submit amendments.',
        'Admins can review, approve, and print submissions.'
      ]
    }
  }
  return {
    title: 'Help',
    tips: ['Navigate using the menu bar above.', 'Click the help button anytime for page-specific guidance.']
  }
})
</script>

<template>
  <!-- Floating help button -->
  <div class="help-assistant">
    <button class="help-btn btn btn-primary rounded-circle shadow-lg" @click="isOpen = !isOpen" :title="isOpen ? 'Close Help' : 'Need Help?'">
      <i class="bi" :class="isOpen ? 'bi-x-lg' : 'bi-question-lg'" style="font-size:1.3rem"></i>
    </button>

    <!-- Help panel -->
    <transition name="slide-up">
      <div v-if="isOpen" class="help-panel card shadow-lg">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <span class="fw-bold"><i class="bi bi-robot"></i> Assistant</span>
          <button class="btn btn-sm btn-outline-light" @click="isOpen = false"><i class="bi bi-x"></i></button>
        </div>
        <div class="card-body">
          <h6 class="fw-bold">{{ helpContent.title }}</h6>
          <ul class="list-unstyled mb-0">
            <li v-for="(tip, idx) in helpContent.tips" :key="idx" class="mb-2 d-flex">
              <i class="bi bi-lightbulb text-warning me-2 mt-1"></i>
              <span class="small">{{ tip }}</span>
            </li>
          </ul>
        </div>
        <div class="card-footer text-center">
          <router-link to="/feedback" class="btn btn-sm btn-outline-primary" @click="isOpen = false">
            <i class="bi bi-chat-dots"></i> Send Feedback
          </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.help-assistant {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1050;
}
.help-btn {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.help-panel {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
}
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
