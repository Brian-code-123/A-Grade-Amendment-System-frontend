<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAmendmentStore } from '@/stores/amendmentStore'

const auth = useAuthStore()
const notif = useNotificationStore()
const subStore = useSubmissionStore()
const amStore = useAmendmentStore()
const router = useRouter()

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

const visibleSubmissions = computed(() => {
  return subStore.submissions.filter(s => s.status !== 'Draft')
})

// Stats
const stats = computed(() => {
  const ams = amStore.amendments
  const subs = visibleSubmissions.value
  return {
    totalAmendments: ams.length,
    pending: ams.filter(a => a.status === 'Pending').length,
    approved: ams.filter(a => a.status === 'Approved').length,
    rejected: ams.filter(a => a.status === 'Rejected').length,
    totalSubmissions: subs.length,
    submittedSubmissions: subs.filter(s => s.status === 'Submitted').length
  }
})

// Stats for Programme Director (Head) — based on submissions, not amendments
const headStats = computed(() => {
  const subs = subStore.submissions.filter(s => s.status !== 'Draft')
  return {
    total: subs.length,
    pending: subs.filter(s => s.status === 'Submitted').length,
    approved: subs.filter(s => s.status === 'Approved').length,
    rejected: subs.filter(s => s.status === 'Rejected').length
  }
})

// System Announcements/Messages grouped by category
const systemAnnouncements = ref([
  {
    id: 1,
    category: 'System Announcements/Messages',
    type: 'info',
    icon: 'bi-megaphone',
    title: 'System Update',
    message: 'Grade Amendment System has been updated with new features and improvements.',
    date: '2026-03-10'
  },
  {
    id: 4,
    category: 'System Announcements/Messages',
    type: 'info',
    icon: 'bi-info-circle',
    title: 'New Feature Available',
    message: 'You can now track amendments in real-time with email notifications.',
    date: '2026-03-08'
  }
])

const policyUpdates = ref([
  {
    id: 2,
    category: 'Latest Policy Updates',
    type: 'warning',
    icon: 'bi-file-earmark-text',
    title: 'Grade Amendment Policy Update',
    message: 'New deadline for grade amendments: 30 days from course end date.',
    date: '2026-03-07'
  },
  {
    id: 5,
    category: 'Latest Policy Updates',
    type: 'warning',
    icon: 'bi-pencil-square',
    title: 'Documentation Requirements',
    message: 'Please provide supporting documents with your amendment requests.',
    date: '2026-03-05'
  }
])

const maintenanceNotifications = ref([
  {
    id: 3,
    category: 'System Maintenance Notification',
    type: 'danger',
    icon: 'bi-exclamation-triangle',
    title: 'Scheduled Maintenance',
    message: 'System maintenance every Sunday 23:00-24:00 (HKT). Please plan accordingly.',
    date: '2026-03-10'
  },
  {
    id: 6,
    category: 'System Maintenance Notification',
    type: 'danger',
    icon: 'bi-tools',
    title: 'Database Migration',
    message: 'Database upgrade scheduled for 2026-03-15. Expected downtime: 2 hours.',
    date: '2026-03-09'
  }
])

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

    <!-- Stats — Head (Programme Director) role -->
    <div v-if="auth.isLoggedIn && auth.isHead" class="home-stats anim-in-d1">
      <div class="stat-card-item">
        <div class="stat-number text-primary count-num">{{ headStats.total }}</div>
        <div class="stat-label">Total Cases</div>
      </div>
      <div class="stat-card-item stat-card-clickable" @click="router.push('/pd-approvals')">
        <div class="stat-number text-warning count-num">{{ headStats.pending }}</div>
        <div class="stat-label">
          Pending <i class="bi bi-arrow-right-circle ms-1" style="font-size:0.7rem"></i>
        </div>
      </div>
      <div class="stat-card-item">
        <div class="stat-number text-success count-num">{{ headStats.approved }}</div>
        <div class="stat-label">Approved</div>
      </div>
      <div class="stat-card-item">
        <div class="stat-number text-danger count-num">{{ headStats.rejected }}</div>
        <div class="stat-label">Rejected</div>
      </div>
    </div>

    <!-- Stats — Teacher / Admin roles -->
    <div v-if="auth.isLoggedIn && !auth.isHead" class="home-stats anim-in-d1">
      <div class="stat-card-item">
        <div class="stat-number text-primary count-num">{{ stats.totalAmendments }}</div>
        <div class="stat-label">Total Amendment Cases</div>
      </div>
      <div class="stat-card-item stat-card-clickable" @click="router.push('/amendments')">
        <div class="stat-number text-warning count-num">{{ stats.pending }}</div>
        <div class="stat-label">
          Submission <i class="bi bi-arrow-right-circle ms-1" style="font-size:0.7rem"></i>
        </div>
      </div>
      <div class="stat-card-item">
        <div class="stat-number text-success count-num">{{ stats.approved }}</div>
        <div class="stat-label">Approved</div>
      </div>
      <div class="stat-card-item">
        <div class="stat-number text-danger count-num">{{ stats.rejected }}</div>
        <div class="stat-label">Rejected</div>
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
        <!-- System Announcements & Notifications -->
        <div class="card card-announcements">
          <div class="card-header-plain d-flex align-items-center gap-2">
            <i class="bi bi-megaphone text-info" style="font-size:0.9rem"></i>
            <span class="fw-semibold small">System Announcements</span>
          </div>
          <div class="announcement-content">
            
            <!-- System Announcements/Messages -->
            <div v-if="systemAnnouncements.length > 0" class="announce-section">
              <div class="section-divider">
                <i class="bi bi-chat-dots text-secondary me-1" style="font-size:0.78rem"></i>
                <span class="text-muted announce-label">System Announcements/Messages</span>
              </div>
              <div v-for="ann in systemAnnouncements.slice(0, 1)" :key="ann.id" class="ann-row border-start border-info ps-2 mb-1">
                <div class="d-flex justify-content-between align-items-start gap-1">
                  <div class="small fw-semibold">{{ ann.title }}</div>
                  <small class="text-muted flex-shrink-0" style="font-size:0.65rem">{{ ann.date }}</small>
                </div>
                <div class="text-muted" style="font-size:0.7rem;line-height:1.3">{{ ann.message }}</div>
              </div>
            </div>

            <!-- Latest Policy Updates -->
            <div v-if="policyUpdates.length > 0" class="announce-section">
              <div class="section-divider">
                <i class="bi bi-file-earmark-text text-secondary me-1" style="font-size:0.78rem"></i>
                <span class="text-muted announce-label">Latest Policy Updates</span>
              </div>
              <div v-for="ann in policyUpdates.slice(0, 1)" :key="ann.id" class="ann-row border-start border-warning ps-2 mb-1">
                <div class="d-flex justify-content-between align-items-start gap-1">
                  <div class="small fw-semibold">{{ ann.title }}</div>
                  <small class="text-muted flex-shrink-0" style="font-size:0.65rem">{{ ann.date }}</small>
                </div>
                <div class="text-muted" style="font-size:0.7rem;line-height:1.3">{{ ann.message }}</div>
              </div>
            </div>

            <!-- System Maintenance Notification -->
            <div v-if="maintenanceNotifications.length > 0" class="announce-section">
              <div class="section-divider">
                <i class="bi bi-tools text-secondary me-1" style="font-size:0.78rem"></i>
                <span class="text-muted announce-label">System Maintenance</span>
              </div>
              <div v-for="ann in maintenanceNotifications.slice(0, 1)" :key="ann.id" class="ann-row border-start border-danger ps-2 mb-1">
                <div class="d-flex justify-content-between align-items-start gap-1">
                  <div class="small fw-semibold">{{ ann.title }}</div>
                  <small class="text-muted flex-shrink-0" style="font-size:0.65rem">{{ ann.date }}</small>
                </div>
                <div class="text-muted" style="font-size:0.7rem;line-height:1.3">{{ ann.message }}</div>
              </div>
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
/* === HKBU COLOR SCHEME === */
:root {
  --hkbu-primary: #0066CC;
  --hkbu-secondary: #00A86B;
  --hkbu-accent: #F0A500;
  --hkbu-dark: #1a1a1a;
  --hkbu-light: #f8f9fa;
}

/* === CLICKABLE STAT CARD === */
.stat-card-clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.stat-card-clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 102, 204, 0.15);
}
.stat-card-clickable:hover .stat-label {
  color: #0066CC;
}

/* === VIEWPORT LAYOUT === */
.home-panel {
  height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  padding: 12px 20px 8px;
  gap: 10px;
  overflow: hidden;
  box-sizing: border-box;
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
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
  transition: all 0.2s ease;
}
.stat-card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-color: var(--hkbu-primary);
}
[data-bs-theme="dark"] .stat-card-item {
  background: #152338;
  border-color: rgba(255,255,255,0.08);
}
[data-bs-theme="dark"] .stat-card-item:hover {
  border-color: var(--hkbu-primary);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
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

/* === CARDS === */
.card {
  border: 1px solid rgba(0,0,0,0.08);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.2s ease;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
[data-bs-theme="dark"] .card {
  background: #152338;
  border-color: rgba(255,255,255,0.08);
  box-shadow: 0 1px 8px rgba(0,0,0,0.3);
}
[data-bs-theme="dark"] .card:hover {
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
}

.card-header {
  background: #f8fafd;
  border-bottom: 1px solid rgba(0,0,0,0.07);
  padding: 10px 14px;
}
[data-bs-theme="dark"] .card-header {
  background: #0f1e30;
  border-color: rgba(255,255,255,0.06);
}

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
  background: var(--sky-600);
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
.calendar-cell:hover:not(.calendar-empty) { background: rgba(126,162,189,0.08) !important; }
.calendar-holiday  { background: rgba(220,53,69,0.07); }
.calendar-academic { background: rgba(126,162,189,0.05); }
.calendar-exam     { background: rgba(255,193,7,0.09); }
.calendar-event    { background: rgba(25,135,84,0.07); }
.calendar-today    { border: 2px solid var(--sky-600); font-weight: 700; }

.calendar-event-dot { width: 5px; height: 5px; border-radius: 50%; margin: 1px auto 0; }
.dot-holiday { background: var(--bs-danger); }
.dot-academic { background: var(--bs-primary); }
.dot-exam    { background: var(--bs-warning); }
.dot-event   { background: var(--bs-success); }
.dot-meeting { background: var(--bs-secondary); }

.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 3px; vertical-align: middle; }

[data-bs-theme="dark"] .calendar-cell    { background: rgba(255,255,255,0.03); }
[data-bs-theme="dark"] .calendar-holiday { background: rgba(220,53,69,0.11); }
[data-bs-theme="dark"] .calendar-academic{ background: rgba(126,162,189,0.08); }
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
  [data-bs-theme="dark"] .help-row:hover { background: rgba(126,162,189,0.06); }

/* Activity items – compact spacing */
.activity-item {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  font-size: 0.85rem;
  transition: background 0.1s;
}
[data-bs-theme="dark"] .activity-item {
  border-color: rgba(255,255,255,0.04);
}
  .activity-item:hover {
    background: rgba(12,142,235,0.04);
  }
[data-bs-theme="dark"] .activity-item:hover {
  background: rgba(0,180,216,0.05);
}
  .activity-unread {
    background: rgba(12,142,235,0.07);
  }
  [data-bs-theme="dark"] .activity-unread {
    background: rgba(126,162,189,0.08);
  }

/* Announcement rows */
.ann-row { border-left-width: 3px !important; }
.border-info    { border-color: var(--bs-info)    !important; }
.border-warning { border-color: var(--bs-warning) !important; }
.border-danger  { border-color: var(--bs-danger)  !important; }

/* Card height limits for sidebar */
.card-quick-actions {
  flex-shrink: 0;
}

.card-activity {
  flex: 0 0 auto;
  max-height: 240px;
}
.activity-content {
  overflow-y: auto;
  max-height: 200px;
  padding: 0.5rem 0;
}

.card-announcements {
  flex: 0 0 auto;
  max-height: 250px;
}
.announcement-content {
  overflow-y: auto;
  max-height: 210px;
  padding: 0.4rem;
}

.announce-section {
  margin-bottom: 0.4rem;
}

.announce-label {
  font-size: 0.65rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.3px !important;
}

/* Admin stats row – compact */
.admin-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: rgba(12,142,235,0.04);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
[data-bs-theme="dark"] .admin-stats-row {
  background: rgba(126,162,189,0.05);
  border-color: rgba(255,255,255,0.06);
}

.admin-stat-item {
  padding: 0.4rem;
}

.admin-stat-val {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
}

.admin-stat-label {
  font-size: 0.6rem;
  color: var(--bs-secondary);
  font-weight: 600;
  margin-top: 0.3rem;
}
</style>
