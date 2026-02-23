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
  <div class="container py-4">
    <!-- Header -->
    <div class="text-center mb-4">
      <img src="@/assets/logo.png" alt="HKBU Logo" style="height:60px" class="mb-2" />
      <h2 class="fw-bold">Grade Amendment System</h2>
      <p class="text-muted">Hong Kong Baptist University &mdash; Academic Registry</p>
    </div>

    <!-- Workflow Visualization (always visible) -->
    <div class="card shadow-sm mb-4 workflow-card">
      <div class="card-header fw-bold"><i class="bi bi-diagram-3"></i> Amendment Workflow</div>
      <div class="card-body py-3">
        <div class="workflow-steps">
          <div class="workflow-step">
            <div class="step-icon bg-info text-white"><i class="bi bi-bell"></i></div>
            <div class="step-label">Receive Notification</div>
          </div>
          <div class="workflow-arrow"><i class="bi bi-chevron-right"></i></div>
          <div class="workflow-step">
            <div class="step-icon bg-primary text-white"><i class="bi bi-pencil-square"></i></div>
            <div class="step-label">Fill Form / Excel</div>
          </div>
          <div class="workflow-arrow"><i class="bi bi-chevron-right"></i></div>
          <div class="workflow-step">
            <div class="step-icon bg-warning text-dark"><i class="bi bi-file-earmark-excel"></i></div>
            <div class="step-label">Upload & Validate</div>
          </div>
          <div class="workflow-arrow"><i class="bi bi-chevron-right"></i></div>
          <div class="workflow-step">
            <div class="step-icon bg-secondary text-white"><i class="bi bi-list-check"></i></div>
            <div class="step-label">Generate Records</div>
          </div>
          <div class="workflow-arrow"><i class="bi bi-chevron-right"></i></div>
          <div class="workflow-step">
            <div class="step-icon bg-primary text-white"><i class="bi bi-send"></i></div>
            <div class="step-label">PD Submits</div>
          </div>
          <div class="workflow-arrow"><i class="bi bi-chevron-right"></i></div>
          <div class="workflow-step">
            <div class="step-icon bg-dark text-white"><i class="bi bi-envelope"></i></div>
            <div class="step-label">Email Admin</div>
          </div>
          <div class="workflow-arrow"><i class="bi bi-chevron-right"></i></div>
          <div class="workflow-step">
            <div class="step-icon bg-success text-white"><i class="bi bi-shield-check"></i></div>
            <div class="step-label">Admin Confirms</div>
          </div>
          <div class="workflow-arrow"><i class="bi bi-chevron-right"></i></div>
          <div class="workflow-step">
            <div class="step-icon bg-success text-white"><i class="bi bi-check-circle"></i></div>
            <div class="step-label">Complete</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards (logged in only) -->
    <div v-if="auth.isLoggedIn" class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card shadow-sm stat-card h-100">
          <div class="card-body text-center py-3">
            <div class="stat-number text-primary">{{ stats.totalAmendments }}</div>
            <div class="stat-label">Total Amendments</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card shadow-sm stat-card h-100">
          <div class="card-body text-center py-3">
            <div class="stat-number text-warning">{{ stats.pending }}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card shadow-sm stat-card h-100">
          <div class="card-body text-center py-3">
            <div class="stat-number text-success">{{ stats.approved }}</div>
            <div class="stat-label">Approved</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card shadow-sm stat-card h-100">
          <div class="card-body text-center py-3">
            <div class="stat-number text-info">{{ stats.totalSubmissions }}</div>
            <div class="stat-label">Submissions</div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Calendar -->
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <button class="btn btn-sm btn-outline-secondary" @click="prevMonth"><i class="bi bi-chevron-left"></i></button>
            <h5 class="mb-0 fw-bold">{{ months[currentMonth] }} {{ currentYear }} &mdash; Academic Calendar 2025-2026</h5>
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

            <div v-if="monthEvents.length" class="mt-3 px-2">
              <h6 class="fw-bold">Events this month:</h6>
              <div v-for="evt in monthEvents" :key="evt.date" class="d-flex align-items-center mb-1">
                <span class="badge me-2" :class="eventTypeBadge(evt.type)" style="width:70px;font-size:0.7rem">{{ eventTypeLabel(evt.type) }}</span>
                <small class="text-muted me-2" style="min-width:40px">{{ evt.date.split('-').slice(1).join('/') }}</small>
                <small>{{ evt.label }}</small>
              </div>
            </div>
            <div v-else class="mt-3 px-2 text-muted small">No events this month.</div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="col-lg-4">
        <!-- Quick Actions -->
        <div v-if="auth.isLoggedIn" class="card shadow-sm mb-3">
          <div class="card-header fw-bold"><i class="bi bi-lightning"></i> Quick Actions</div>
          <div class="card-body d-grid gap-2">
            <router-link to="/amendments" class="btn btn-primary btn-sm"><i class="bi bi-pencil-square"></i> New Amendment</router-link>
            <router-link to="/excel-upload" class="btn btn-success btn-sm"><i class="bi bi-file-earmark-excel"></i> Excel Upload</router-link>
            <router-link to="/submissions" class="btn btn-info btn-sm text-white"><i class="bi bi-send"></i> View Submissions</router-link>
            <router-link v-if="auth.isAdmin" to="/admin" class="btn btn-outline-dark btn-sm"><i class="bi bi-shield-lock"></i> Admin Panel</router-link>
          </div>
        </div>

        <!-- Notifications -->
        <div v-if="auth.isLoggedIn" class="card shadow-sm mb-3">
          <div class="card-header fw-bold d-flex justify-content-between align-items-center">
            <span><i class="bi bi-bell"></i> Notifications</span>
            <span v-if="notif.unreadCount > 0" class="badge bg-danger rounded-pill">{{ notif.unreadCount }}</span>
          </div>
          <div class="card-body p-0">
            <div v-if="notif.notifications.length === 0" class="text-center text-muted py-3">No notifications</div>
            <div v-for="n in notif.notifications.slice(0, 5)" :key="n._id" class="border-bottom px-3 py-2" :class="{ 'bg-light-unread': !n.read }">
              <div class="d-flex align-items-start gap-2">
                <i class="bi mt-1" :class="n.read ? 'bi-envelope-open text-muted' : 'bi-envelope-fill text-primary'" style="font-size:0.85rem"></i>
                <div class="flex-grow-1">
                  <div class="fw-semibold small" :class="{ 'fw-bold': !n.read }">{{ n.title }}</div>
                  <div class="text-muted small text-truncate" style="max-width:220px">{{ n.message }}</div>
                  <div class="text-muted" style="font-size:0.65rem">{{ new Date(n.created_at).toLocaleString() }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Submissions -->
        <div v-if="auth.isLoggedIn" class="card shadow-sm">
          <div class="card-header fw-bold"><i class="bi bi-clock-history"></i> Recent Submissions</div>
          <div class="card-body p-0">
            <div v-if="subStore.submissions.length === 0" class="text-center text-muted py-3">No submissions yet</div>
            <div v-for="s in subStore.submissions.slice(0, 5)" :key="s._id" class="border-bottom px-3 py-2">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <span class="fw-semibold small">{{ s.title }}</span>
                  <div class="text-muted" style="font-size:0.65rem">{{ s.amendment_count }} amendment(s) - {{ new Date(s.created_at).toLocaleDateString() }}</div>
                </div>
                <span class="badge ms-2" :class="{'bg-warning text-dark': s.status === 'Draft', 'bg-info': s.status === 'Submitted', 'bg-success': s.status === 'Approved', 'bg-danger': s.status === 'Rejected'}">{{ s.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Not logged in message -->
        <div v-if="!auth.isLoggedIn" class="card shadow-sm">
          <div class="card-body text-center py-4">
            <i class="bi bi-shield-lock fs-1 text-muted mb-3 d-block"></i>
            <h6 class="fw-bold">Welcome to the Grade Amendment System</h6>
            <p class="text-muted small mb-3">Please login to access amendments, submissions, and notifications.</p>
            <router-link to="/login" class="btn btn-primary btn-sm"><i class="bi bi-box-arrow-in-right"></i> Login Now</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Workflow */
.workflow-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
}
.workflow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 72px;
}
.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  margin-bottom: 4px;
}
.step-label {
  font-size: 0.68rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  max-width: 80px;
}
.workflow-arrow {
  color: var(--bs-secondary);
  font-size: 0.9rem;
  margin-bottom: 18px;
}

/* Stats */
.stat-card {
  border: none;
}
.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
}
.stat-label {
  font-size: 0.75rem;
  color: var(--bs-secondary);
  font-weight: 500;
  margin-top: 4px;
}

/* Unread notification highlight */
.bg-light-unread {
  background: rgba(12, 142, 235, 0.04);
}
[data-bs-theme="dark"] .bg-light-unread {
  background: rgba(0, 180, 216, 0.06);
}

/* Calendar */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.calendar-header {
  background: linear-gradient(135deg, #0c8eeb, #36a9fa);
  color: white;
  border-radius: 6px;
  font-size: 0.8rem;
}
.calendar-cell {
  min-height: 42px;
  border-radius: 6px;
  cursor: default;
  position: relative;
  transition: background 0.2s;
}
.calendar-cell:hover:not(.calendar-empty) {
  background: rgba(12, 142, 235, 0.1);
}
.calendar-holiday {
  background: rgba(220, 53, 69, 0.1);
}
.calendar-academic {
  background: rgba(12, 142, 235, 0.08);
}
.calendar-exam {
  background: rgba(255, 193, 7, 0.12);
}
.calendar-event {
  background: rgba(25, 135, 84, 0.08);
}
.calendar-today {
  border: 2px solid #0c8eeb;
  font-weight: bold;
  background: rgba(12, 142, 235, 0.05);
}
.calendar-event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0c8eeb;
  margin: 0 auto;
}
.dot-holiday { background: var(--bs-danger); }
.dot-academic { background: var(--bs-primary); }
.dot-exam { background: var(--bs-warning); }
.dot-event { background: var(--bs-success); }
.dot-meeting { background: var(--bs-secondary); }

/* Legend dots */
.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}
</style>
