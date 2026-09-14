import { ref, computed } from 'vue'

// Filtering/sorting logic for the amendment list, extracted verbatim from
// AmendmentListView.vue - same filters, same sort, same status-dropdown
// logic, just usable on its own.
export function useAmendmentFilters(amendments, getAmendmentStatus, options = {}) {
  const courseCodeFilter = ref('')
  const termFilter = ref('')
  const statusFilter = ref('')
  const sortOrder = ref('oldest') // 'oldest' or 'newest'

  const statusOptions = computed(() => {
    const statuses = [...new Set(amendments.value.map((a) => getAmendmentStatus(a)).filter(Boolean))].sort()
    if (options.role?.value === 'Programme Director') {
      const allowed = ['Pending', 'Rejected', 'Approved']
      return allowed.filter((status) => statuses.includes(status))
    }
    return statuses
  })

  const hasActiveFilters = computed(() => {
    return courseCodeFilter.value || statusFilter.value || termFilter.value
  })

  const totalAmendmentCount = computed(() => amendments.value.length)

  const getCreatedTimestamp = (amendment) => {
    const rawDate = amendment.created_at || amendment.create_date || amendment.createdAt
    if (rawDate) {
      const timestamp = new Date(rawDate).getTime()
      if (Number.isFinite(timestamp)) {
        return timestamp
      }
    }

    if (amendment._id) {
      try {
        return parseInt(String(amendment._id).substring(0, 8), 16) * 1000
      } catch {
        return 0
      }
    }

    return 0
  }

  const filteredAmendments = computed(() => {
    let amendmentList = [...amendments.value]

    amendmentList = amendmentList.filter((amendment) => getAmendmentStatus(amendment) !== 'Draft')

    if (courseCodeFilter.value) {
      amendmentList = amendmentList.filter((amendment) =>
        amendment.course_code?.toLowerCase().includes(courseCodeFilter.value.toLowerCase())
      )
    }

    if (statusFilter.value) {
      amendmentList = amendmentList.filter((amendment) => getAmendmentStatus(amendment) === statusFilter.value)
    }

    if (termFilter.value) {
      amendmentList = amendmentList.filter((amendment) => String(amendment.term) === termFilter.value)
    }

    amendmentList.sort((a, b) => {
      const dateA = getCreatedTimestamp(a)
      const dateB = getCreatedTimestamp(b)
      return sortOrder.value === 'oldest' ? dateA - dateB : dateB - dateA
    })

    return amendmentList
  })

  return {
    courseCodeFilter,
    termFilter,
    statusFilter,
    sortOrder,
    statusOptions,
    hasActiveFilters,
    totalAmendmentCount,
    filteredAmendments
  }
}
