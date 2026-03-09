<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAmendmentStore } from '@/stores/amendmentStore'

const auth = useAuthStore()
const notif = useNotificationStore()
const subStore = useSubmissionStore()
const amStore = useAmendmentStore()

const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

// HKBU Academic Calendar 2025-2026 — from official calendar
const calendarEvents = {
  // ===== August 2025 =====
  '2025-08-08': { label: 'Enrolment Begins (New UG Students)', type: 'academic' },
  '2025-08-12': { label: 'Orientation Activities Begin (New UG Students)', type: 'academic' },
  '2025-08-20': { label: 'Orientation Day for New Academic & Admin Staff', type: 'academic' },
  '2025-08-25': { label: 'Registration (New Research PG Students)', type: 'academic' },
  '2025-08-29': { label: '70th Convocation', type: 'event' },

  // ===== September 2025 =====
  '2025-09-01': { label: 'Academic Year Begins / Semester 1 Classes Begin', type: 'academic' },
  '2025-09-04': { label: 'Semester 1 / Trimester I Tuition Payment Due', type: 'academic' },
  '2025-09-13': { label: 'Last Day to Add/Drop (Semester 1 / Trimester I)', type: 'academic' },
  '2025-09-22': { label: 'Senate Meeting', type: 'meeting' },

  // ===== October 2025 =====
  '2025-10-01': { label: 'National Day', type: 'holiday' },
  '2025-10-04': { label: 'Information Day for UG Admissions (2026 Entry)', type: 'event' },
  '2025-10-07': { label: 'Day following Mid-Autumn Festival', type: 'holiday' },
  '2025-10-09': { label: 'Tuition Payment Due (New Students)', type: 'academic' },
  '2025-10-14': { label: 'Council Meeting', type: 'meeting' },
  '2025-10-29': { label: 'Chung Yeung Festival', type: 'holiday' },

  // ===== November 2025 =====
  '2025-11-05': { label: 'Trimester II Tuition Payment Due', type: 'academic' },
  '2025-11-11': { label: 'Court Meeting', type: 'meeting' },
  '2025-11-17': { label: '66th Commencement (Honorary & Research PG Degrees)', type: 'event' },
  '2025-11-24': { label: 'Trimester I Examinations Begin (24 Nov - 6 Dec)', type: 'exam' },
  '2025-11-29': { label: 'Last Day of Classes (First Semester)', type: 'academic' },

  // ===== December 2025 =====
  '2025-12-05': { label: 'First Semester Examinations Begin (5-18 Dec)', type: 'exam' },
  '2025-12-08': { label: 'Trimester II Classes Begin', type: 'academic' },
  '2025-12-09': { label: 'Council Meeting', type: 'meeting' },
  '2025-12-11': { label: 'Second Semester Tuition Payment Due', type: 'academic' },
  '2025-12-18': { label: 'First Semester Examinations End', type: 'exam' },
  '2025-12-20': { label: 'Last Day to Add/Drop (Trimester II)', type: 'academic' },
  '2025-12-25': { label: 'Christmas Day', type: 'holiday' },
  '2025-12-26': { label: 'Day after Christmas', type: 'holiday' },

  // ===== January 2026 =====
  '2026-01-01': { label: "New Year's Day", type: 'holiday' },
  '2026-01-09': { label: 'Exchange Student Orientation (9-10 Jan)', type: 'academic' },
  '2026-01-10': { label: 'First Semester Ends', type: 'academic' },
  '2026-01-12': { label: 'Second Semester Begins / Classes Begin', type: 'academic' },
  '2026-01-16': { label: 'First Semester Make-up Exams Begin (16-22 Jan)', type: 'exam' },
  '2026-01-22': { label: 'First Semester Make-up Exams End', type: 'exam' },
  '2026-01-24': { label: 'Last Day to Add/Drop (Second Semester)', type: 'academic' },
  '2026-01-26': { label: 'Senate Meeting', type: 'meeting' },

  // ===== February 2026 =====
  '2026-02-04': { label: 'Creative Arts School Board Meeting', type: 'meeting' },
  '2026-02-05': { label: 'Arts & Social Sciences Faculty Board Meeting', type: 'meeting' },
  '2026-02-17': { label: 'Lunar New Year Holiday', type: 'holiday' },
  '2026-02-18': { label: 'Lunar New Year Holiday', type: 'holiday' },
  '2026-02-19': { label: 'Lunar New Year Holiday', type: 'holiday' },
  '2026-02-27': { label: 'Communication School Board Meeting', type: 'meeting' },

  // ===== March 2026 =====
  '2026-03-01': { label: 'Christian Emphasis Week Begins (1-7 Mar)', type: 'event' },
  '2026-03-04': { label: 'Trimester III Tuition Payment Due', type: 'academic' },
  '2026-03-09': { label: 'Trimester II Examinations Begin (9-21 Mar)', type: 'exam' },
  '2026-03-16': { label: 'Senate Meeting', type: 'meeting' },
  '2026-03-21': { label: 'Trimester II Examinations End', type: 'exam' },
  '2026-03-23': { label: 'Trimester III Classes Begin / Add/Drop Opens', type: 'academic' },
  '2026-03-24': { label: 'Council Meeting', type: 'meeting' },

  // ===== April 2026 =====
  '2026-04-01': { label: 'Last Day to Add/Drop (Trimester III)', type: 'academic' },
  '2026-04-03': { label: 'Good Friday (Easter Holiday)', type: 'holiday' },
  '2026-04-04': { label: 'Day after Good Friday (Easter Holiday)', type: 'holiday' },
  '2026-04-06': { label: 'Day following Ching Ming Festival', type: 'holiday' },
  '2026-04-07': { label: 'Easter Monday', type: 'holiday' },
  '2026-04-22': { label: 'Baccalaureate Service', type: 'event' },
  '2026-04-25': { label: 'Last Day of Classes (Second Semester)', type: 'academic' },

  // ===== May 2026 =====
  '2026-05-01': { label: 'Labour Day', type: 'holiday' },
  '2026-05-02': { label: 'Second Semester Examinations Begin (2-15 May)', type: 'exam' },
  '2026-05-12': { label: 'Court Meeting', type: 'meeting' },
  '2026-05-15': { label: 'Second Semester Examinations End', type: 'exam' },
  '2026-05-18': { label: 'Summer Term Begins (Taught PG)', type: 'academic' },
  '2026-05-25': { label: 'Day following Birthday of the Buddha', type: 'holiday' },
  '2026-05-29': { label: 'Last Day to Add/Drop (Summer Term)', type: 'academic' },

  // ===== June 2026 =====
  '2026-06-05': { label: '67th Commencement Begins (5-18 Jun, Tentative)', type: 'event' },
  '2026-06-09': { label: 'Second Semester Make-up Exams Begin (9-15 Jun)', type: 'exam' },
  '2026-06-15': { label: 'Second Semester Ends / Make-up Exams End', type: 'academic' },
  '2026-06-16': { label: 'Council Meeting', type: 'meeting' },
  '2026-06-19': { label: 'Tuen Ng Festival', type: 'holiday' },
  '2026-06-29': { label: 'Senate Meeting', type: 'meeting' },

  // ===== July 2026 =====
  '2026-07-01': { label: 'HKSAR Establishment Day', type: 'holiday' },
  '2026-07-03': { label: 'Summer Programme Begins (3-30 Jul, Tentative)', type: 'academic' },
  '2026-07-10': { label: 'Summer Term Ends (Taught PG)', type: 'academic' }
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const calendarDays = computed(() => {
  const y = currentYear.value
  const m = currentMonth.value
  const firstDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ day: d, date: dateStr, event: calendarEvents[dateStr] || null })
  }
  return days
})

const monthEvents = computed(() => {
  const m = String(currentMonth.value + 1).padStart(2, '0')
  const prefix = `${currentYear.value}-${m}`
  return Object.entries(calendarEvents)
    .filter(([key]) => key.startsWith(prefix))
    .map(([date, evt]) => ({ date, ...evt }))
    .sort((a, b) => a.date.localeCompare(b.date))
})

// Stats
const stats = computed(() => {
  const ams = amStore.amendments
  const subs = subStore.submissions
  return {
    totalAmendments: ams.length,
    pending: ams.filter(a => a.status === 'Pending').length,
    approved: ams.filter(a => a.status === 'Approved').length,
    rejected: ams.filter(a => a.status === 'Rejected').length,
    totalSubmissions: subs.length,
    draftSubmissions: subs.filter(s => s.status === 'Draft').length,
    submittedSubmissions: subs.filter(s => s.status === 'Submitted').length
  }
})

// Admin Performance Stats
const performanceStats = computed(() => {
  const ams = amStore.amendments
  const processed = ams.filter(a => a.status !== 'Pending').length
  const avgTime = processed > 0 ? Math.floor(Math.random() * 30) + 5 : 0 // Mock: 5-35 days
  const approvalRate = processed > 0 ? Math.round((ams.filter(a => a.status === 'Approved').length / processed) * 100) : 0
  
  return {
    pending: ams.filter(a => a.status === 'Pending').length,
    processed: processed,
    avgProcessingDays: avgTime,
    approvalRate: approvalRate
  }
})

// FAQ/Help Links
const faqItems = [
  {
    icon: 'bi-question-circle',
    title: 'How to Submit?',
    description: 'View detailed steps and requirements',
    link: '/help/submit-amendments'
  },
  {
    icon: 'bi-search',
    title: 'Track My Request',
    description: 'Check your application status',
    link: '/submissions'
  },
  {
    icon: 'bi-envelope',
    title: 'Contact Admin',
    description: 'Get technical support and help',
    link: '#'
  }
]

// System Announcements
const announcements = [
  {
    id: 1,
    type: 'info',
    icon: 'bi-info-circle',
    title: 'Latest Update',
    message: 'Grade Amendment System updated to latest version with new features.',
    date: '2026-03-10'
  },
  {
    id: 2,
    type: 'warning',
    icon: 'bi-exclamation-triangle',
    title: 'System Maintenance',
    message: 'Regular system maintenance every Sunday 23:00-24:00.',
    date: '2026-03-10'
  },
  {
    id: 3,
    type: 'danger',
    icon: 'bi-exclamation-circle',
    title: 'Important Notice',
    message: 'Please submit your applications before the deadline. Late submissions will not be accepted.',
    date: '2026-03-09'
  }
]

const getAnnouncementBadgeClass = (type) => {
  const map = {
    'info': 'bg-info',
    'warning': 'bg-warning text-dark',
    'danger': 'bg-danger'
  }
  return map[type] || 'bg-secondary'
}

const getAnnouncementBorderClass = (type) => {
  const map = {
    'info': 'border-info',
    'warning': 'border-warning',
    'danger': 'border-danger'
  }
  return map[type] || 'border-secondary'
}

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}

const eventTypeLabel = (type) => {
  const map = { holiday: 'Holiday', academic: 'Academic', exam: 'Exam', event: 'Event', meeting: 'Meeting' }
  return map[type] || type
}

const eventTypeBadge = (type) => {
  const map = { holiday: 'bg-danger', academic: 'bg-primary', exam: 'bg-warning text-dark', event: 'bg-success', meeting: 'bg-secondary' }
  return map[type] || 'bg-secondary'
}

onMounted(() => {
  if (auth.isLoggedIn) {
    subStore.fetchSubmissions()
    notif.fetchNotifications()
    amStore.fetchAmendments()
  }
})
</script>

<template>
  <div class="home-panel">
    <!-- Header -->
    <div class="home-hdr anim-in d-flex align-items-center justify-content-between">
      <div>
        <h4 class="fw-bold mb-0">Grade Amendment System</h4>
        <small class="text-muted">Academic Registry · Hong Kong Baptist University</small>
      </div>
      <span class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill" style="font-size:0.75rem">
        <i class="bi bi-calendar3 me-1"></i>{{ months[currentMonth] }} {{ currentYear }}
      </span>
    </div>

    <!-- Stats -->
    <div v-if="auth.isLoggedIn" class="home-stats anim-in-d1">
      <div class="stat-card-item">
        <div class="stat-number text-primary count-num">{{ stats.totalAmendments }}</div>
        <div class="stat-label">Amendments</div>
      </div>
      <div class="stat-card-item">
        <div class="stat-number text-warning count-num">{{ stats.pending }}</div>
        <div class="stat-label">Pending</div>
      </div>
      <div class="stat-card-item">
        <div class="stat-number text-success count-num">{{ stats.approved }}</div>
        <div class="stat-label">Approved</div>
      </div>
      <div class="stat-card-item">
        <div class="stat-number text-info count-num">{{ stats.totalSubmissions }}</div>
        <div class="stat-label">Submissions</div>
      </div>
    </div>

    <div class="home-body">
      <!-- Calendar -->
      <div class="home-col-main anim-in-d2">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <button class="btn btn-sm btn-outline-secondary" @click="prevMonth"><i class="bi bi-chevron-left"></i></button>
            <span class="fw-semibold small">{{ months[currentMonth] }} {{ currentYear }} · HKBU Academic Calendar</span>
            <button class="btn btn-sm btn-outline-secondary" @click="nextMonth"><i class="bi bi-chevron-right"></i></button>
          </div>
          <div class="card-body p-2">
            <div class="calendar-grid">
              <div v-for="wd in weekDays" :key="wd" class="calendar-header text-center fw-bold small py-1">{{ wd }}</div>
              <div v-for="(d, idx) in calendarDays" :key="idx" class="calendar-cell text-center p-1" :class="{
                'calendar-empty': !d,
                'calendar-holiday': d?.event?.type === 'holiday',
                'calendar-academic': d?.event?.type === 'academic',
                'calendar-exam': d?.event?.type === 'exam',
                'calendar-event': d?.event?.type === 'event',
                'calendar-today': d && d.date === new Date().toISOString().split('T')[0]
              }">
                <template v-if="d">
                  <div class="small fw-semibold">{{ d.day }}</div>
                  <div v-if="d.event" class="calendar-event-dot" :class="'dot-' + d.event.type" :title="d.event.label"></div>
                </template>
              </div>
            </div>

            <!-- Legend -->
            <div class="d-flex flex-wrap gap-3 mt-3 px-2 small">
              <span><span class="legend-dot bg-danger"></span> Holiday</span>
              <span><span class="legend-dot bg-primary"></span> Academic</span>
              <span><span class="legend-dot bg-warning"></span> Exam</span>
              <span><span class="legend-dot bg-success"></span> Event</span>
              <span><span class="legend-dot bg-secondary"></span> Meeting</span>
            </div>

            <div v-if="monthEvents.length" class="mt-2 px-2">
              <div class="text-muted small fw-semibold mb-1">Events this month</div>
              <div style="max-height:160px;overflow-y:auto">
                <div v-for="evt in monthEvents" :key="evt.date" class="d-flex align-items-center mb-1">
                  <span class="badge me-2" :class="eventTypeBadge(evt.type)" style="width:64px;font-size:0.68rem;flex-shrink:0">{{ eventTypeLabel(evt.type) }}</span>
                  <span class="text-muted me-2" style="font-size:0.72rem;min-width:36px">{{ evt.date.split('-').slice(1).join('/') }}</span>
                  <span class="small text-truncate">{{ evt.label }}</span>
                </div>
              </div>
            </div>
            <div v-else class="mt-2 px-2 text-muted small">No events this month.</div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="home-col-side anim-in-d3">

        <!-- Quick Actions + Admin performance stats -->
        <div v-if="auth.isLoggedIn" class="card">
          <div class="card-header-plain d-flex align-items-center gap-2">
            <i class="bi bi-lightning-charge text-warning" style="font-size:0.9rem"></i>
            <span class="fw-semibold small">Quick Actions</span>
          </div>
          <!-- Admin mini-stats (only for admin role) -->
          <div v-if="auth.isAdmin" class="admin-stats-row">
            <div class="admin-stat-item text-center">
              <div class="admin-stat-val text-danger">{{ performanceStats.pending }}</div>
              <div class="admin-stat-label">Pending</div>
            </div>
            <div class="admin-stat-item text-center">
              <div class="admin-stat-val text-success">{{ performanceStats.processed }}</div>
              <div class="admin-stat-label">Done</div>
            </div>
            <div class="admin-stat-item text-center">
              <div class="admin-stat-val text-info">{{ performanceStats.avgProcessingDays }}</div>
              <div class="admin-stat-label">Avg Days</div>
            </div>
            <div class="admin-stat-item text-center">
              <div class="admin-stat-val text-primary">{{ performanceStats.approvalRate }}%</div>
              <div class="admin-stat-label">Approval</div>
            </div>
          </div>
          <div class="d-grid gap-2 p-3">
            <router-link to="/amendments" class="btn btn-primary btn-sm"><i class="bi bi-pencil-square me-1"></i>New Amendment</router-link>
            <router-link to="/excel-upload" class="btn btn-outline-success btn-sm"><i class="bi bi-file-earmark-excel me-1"></i>Excel Upload</router-link>
            <router-link to="/submissions" class="btn btn-outline-secondary btn-sm"><i class="bi bi-send me-1"></i>View Submissions</router-link>
            <router-link v-if="auth.isAdmin" to="/admin" class="btn btn-outline-dark btn-sm"><i class="bi bi-shield-lock me-1"></i>Admin Panel</router-link>
          </div>
        </div>

        <!-- Activity: Notifications + Recent Submissions merged -->
        <div v-if="auth.isLoggedIn" class="card">
          <div class="card-header-plain d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-bell text-primary" style="font-size:0.9rem"></i>
              <span class="fw-semibold small">Notifications</span>
            </div>
            <span v-if="notif.unreadCount > 0" class="badge bg-danger rounded-pill" style="font-size:0.65rem">{{ notif.unreadCount }}</span>
          </div>
          <div v-if="notif.notifications.length === 0" class="text-center text-muted py-3 small">No notifications</div>
          <div
            v-for="n in notif.notifications.slice(0, 3)"
            :key="n._id"
            class="activity-item d-flex align-items-start gap-2"
            :class="{ 'activity-unread': !n.read }"
          >
            <i class="bi flex-shrink-0 mt-1" :class="n.read ? 'bi-envelope-open text-muted' : 'bi-envelope-fill text-primary'" style="font-size:0.8rem"></i>
            <div class="min-w-0 flex-grow-1">
              <div class="small fw-semibold text-truncate">{{ n.title }}</div>
              <div class="text-muted small text-truncate">{{ n.message }}</div>
            </div>
          </div>
          <div class="section-divider mx-3">
            <i class="bi bi-clock-history text-secondary me-1" style="font-size:0.78rem"></i>
            <span class="text-muted" style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Recent</span>
          </div>
          <div v-if="subStore.submissions.length === 0" class="text-center text-muted py-2 small">No submissions</div>
          <div v-for="s in subStore.submissions.slice(0, 3)" :key="s._id" class="activity-item d-flex justify-content-between align-items-start gap-2">
            <div class="min-w-0 flex-grow-1">
              <div class="small fw-semibold text-truncate">{{ s.title }}</div>
              <div class="text-muted" style="font-size:0.7rem">{{ s.amendment_count }} amendment(s) · {{ new Date(s.created_at).toLocaleDateString() }}</div>
            </div>
            <span
              class="badge flex-shrink-0"
              style="font-size:0.65rem"
              :class="{ 'bg-warning text-dark': s.status==='Draft', 'bg-info': s.status==='Submitted', 'bg-success': s.status==='Approved', 'bg-danger': s.status==='Rejected' }"
            >{{ s.status }}</span>
          </div>
          <div style="height:6px"></div>
        </div>

        <!-- Help & Announcements merged -->
        <div class="card">
          <div class="card-header-plain d-flex align-items-center gap-2">
            <i class="bi bi-question-circle text-info" style="font-size:0.9rem"></i>
            <span class="fw-semibold small">Help & Updates</span>
          </div>
          <div class="px-3 pt-2 pb-1">
            <div
              v-for="(item, idx) in faqItems"
              :key="idx"
              class="help-row d-flex align-items-center gap-2 py-2"
              :class="{ 'border-bottom': idx < faqItems.length - 1 }"
            >
              <i class="bi flex-shrink-0" :class="item.icon" style="color:#0c8eeb;font-size:0.95rem"></i>
              <div class="min-w-0">
                <router-link :to="item.link === '#' ? '/submissions' : item.link" class="text-decoration-none">
                  <div class="small fw-semibold">{{ item.title }}</div>
                </router-link>
                <div class="text-muted" style="font-size:0.72rem">{{ item.description }}</div>
              </div>
            </div>
          </div>
          <div class="section-divider mx-3">
            <i class="bi bi-megaphone text-secondary me-1" style="font-size:0.78rem"></i>
            <span class="text-muted" style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.4px">Announcements</span>
          </div>
          <div class="px-3 pb-3 pt-1">
            <div v-for="ann in announcements.slice(0, 2)" :key="ann.id" class="ann-row border-start ps-2 mb-2" :class="'border-' + ann.type">
              <div class="d-flex justify-content-between align-items-start gap-1">
                <div class="small fw-semibold">{{ ann.title }}</div>
                <small class="text-muted flex-shrink-0">{{ ann.date }}</small>
              </div>
              <div class="text-muted small">{{ ann.message }}</div>
            </div>
          </div>
        </div>

        <!-- Guest welcome (not logged in) -->
        <div v-if="!auth.isLoggedIn" class="card text-center py-4 px-3">
          <i class="bi bi-mortarboard fs-1 text-primary mb-2 d-block"></i>
          <h6 class="fw-bold mb-1">Grade Amendment System</h6>
          <p class="text-muted small mb-3">Login to manage and track your grade amendment requests.</p>
          <router-link to="/login" class="btn btn-primary btn-sm"><i class="bi bi-box-arrow-in-right me-1"></i>Login</router-link>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* === VIEWPORT LAYOUT === */
.home-panel {
  height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  padding: 12px 20px 8px;
  gap: 10px;
  overflow: hidden;
  box-sizing: border-box;
}

.home-hdr { flex-shrink: 0; }

.home-stats {
  flex-shrink: 0;
  display: flex;
  gap: 10px;
}
.stat-card-item {
  flex: 1;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.07);
  border-radius: 10px;
  padding: 10px 12px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
[data-bs-theme="dark"] .stat-card-item {
  background: #152338;
  border-color: rgba(255,255,255,0.08);
}

.home-body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 14px;
}
.home-col-main {
  flex: 0 0 62%;
  min-height: 0;
  overflow-y: auto;
}
.home-col-side {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* === STATS === */
.stat-number { font-size: 1.6rem; font-weight: 700; line-height: 1; }
.stat-label  { font-size: 0.72rem; color: var(--bs-secondary); font-weight: 500; margin-top: 3px; }

/* === CARDS — clean white, minimal shadow === */
.card {
  border: 1px solid rgba(0,0,0,0.08);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.05);
  overflow: hidden;
}
[data-bs-theme="dark"] .card {
  background: #152338;
  border-color: rgba(255,255,255,0.08);
  box-shadow: 0 1px 8px rgba(0,0,0,0.3);
}

/* Bootstrap .card-header already has bg — override for consistency */
.card-header {
  background: #f8fafd;
  border-bottom: 1px solid rgba(0,0,0,0.07);
  padding: 10px 14px;
}
[data-bs-theme="dark"] .card-header {
  background: #0f1e30;
  border-color: rgba(255,255,255,0.06);
}

/* Custom plain header used in sidebar cards */
.card-header-plain {
  padding: 10px 14px;
  background: #f8fafd;
  border-bottom: 1px solid rgba(0,0,0,0.07);
}
[data-bs-theme="dark"] .card-header-plain {
  background: #0f1e30;
  border-color: rgba(255,255,255,0.06);
}

/* === CALENDAR === */
.calendar-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; }

.calendar-header {
  background: #1a7fcc;
  color: #fff;
  border-radius: 5px;
  font-size: 0.74rem;
  padding: 4px 0;
  text-align: center;
  font-weight: 600;
}
.calendar-cell {
  min-height: 40px;
  border-radius: 5px;
  cursor: default;
  transition: background 0.15s;
}
.calendar-cell:hover:not(.calendar-empty) { background: rgba(12,142,235,0.10) !important; }
.calendar-holiday  { background: rgba(220,53,69,0.07); }
.calendar-academic { background: rgba(12,142,235,0.06); }
.calendar-exam     { background: rgba(255,193,7,0.09); }
.calendar-event    { background: rgba(25,135,84,0.07); }
.calendar-today    { border: 2px solid #1a7fcc; font-weight: 700; }

.calendar-event-dot { width: 5px; height: 5px; border-radius: 50%; margin: 1px auto 0; }
.dot-holiday { background: var(--bs-danger); }
.dot-academic { background: var(--bs-primary); }
.dot-exam    { background: var(--bs-warning); }
.dot-event   { background: var(--bs-success); }
.dot-meeting { background: var(--bs-secondary); }

.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 3px; vertical-align: middle; }

[data-bs-theme="dark"] .calendar-cell    { background: rgba(255,255,255,0.03); }
[data-bs-theme="dark"] .calendar-holiday { background: rgba(220,53,69,0.11); }
[data-bs-theme="dark"] .calendar-academic{ background: rgba(12,142,235,0.09); }
[data-bs-theme="dark"] .calendar-exam    { background: rgba(255,193,7,0.10); }
[data-bs-theme="dark"] .calendar-event   { background: rgba(25,135,84,0.09); }

/* === SIDEBAR COMPONENTS === */

/* Admin performance row */
.admin-stats-row {
  display: flex;
  padding: 10px 14px 8px;
  border-bottom: 1px solid rgba(0,0,0,0.07);
}
[data-bs-theme="dark"] .admin-stats-row { border-color: rgba(255,255,255,0.06); }
.admin-stat-item { flex: 1; }
.admin-stat-val   { font-size: 1.25rem; font-weight: 700; line-height: 1; }
.admin-stat-label { font-size: 0.6rem; color: var(--bs-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; margin-top: 2px; }

/* Activity list items (notifications + submissions) */
.activity-item {
  padding: 8px 14px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  transition: background 0.1s;
}
.activity-item:hover { background: rgba(0,0,0,0.018); }
.activity-unread    { background: rgba(12,142,235,0.04); }
[data-bs-theme="dark"] .activity-item   { border-color: rgba(255,255,255,0.05); }
[data-bs-theme="dark"] .activity-item:hover { background: rgba(255,255,255,0.03); }
[data-bs-theme="dark"] .activity-unread { background: rgba(0,180,216,0.07); }

/* Section divider inside card */
.section-divider {
  display: flex;
  align-items: center;
  padding: 6px 0;
  border-top: 1px solid rgba(0,0,0,0.06);
}
[data-bs-theme="dark"] .section-divider { border-color: rgba(255,255,255,0.06); }

/* Help rows */
.help-row { border-radius: 4px; transition: background 0.1s; }
.help-row:hover { background: rgba(12,142,235,0.05); }
[data-bs-theme="dark"] .help-row:hover { background: rgba(0,180,216,0.07); }

/* Announcement rows */
.ann-row { border-left-width: 3px !important; }
.border-info    { border-color: var(--bs-info)    !important; }
.border-warning { border-color: var(--bs-warning) !important; }
.border-danger  { border-color: var(--bs-danger)  !important; }
</style>
