import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useArchiveStore = defineStore('archive', () => {
  // Semester definitions: { id, name, startDate, endDate }
  const semesters = ref(JSON.parse(localStorage.getItem('archive_semesters') || '[]'))

  // Archived submission IDs grouped by semester: { semesterId: [submissionId, ...] }
  const archivedMap = ref(JSON.parse(localStorage.getItem('archive_map') || '{}'))

  // All archived submission IDs (flat set)
  const archivedIds = computed(() => {
    const ids = new Set()
    for (const arr of Object.values(archivedMap.value)) {
      arr.forEach(id => ids.add(id))
    }
    return ids
  })

  function persist() {
    localStorage.setItem('archive_semesters', JSON.stringify(semesters.value))
    localStorage.setItem('archive_map', JSON.stringify(archivedMap.value))
  }

  function addSemester(name, startDate, endDate) {
    const id = 'sem_' + Date.now()
    semesters.value.push({ id, name, startDate, endDate })
    persist()
    return id
  }

  function removeSemester(id) {
    semesters.value = semesters.value.filter(s => s.id !== id)
    delete archivedMap.value[id]
    persist()
  }

  function updateSemester(id, name, startDate, endDate) {
    const sem = semesters.value.find(s => s.id === id)
    if (sem) {
      sem.name = name
      sem.startDate = startDate
      sem.endDate = endDate
      persist()
    }
  }

  /**
   * Archive submissions whose created_at falls in the given semester's date range.
   * @param {string} semesterId
   * @param {Array} submissions - full submission array from submissionStore
   */
  function archiveBySemester(semesterId, submissions) {
    const sem = semesters.value.find(s => s.id === semesterId)
    if (!sem) return 0

    const start = new Date(sem.startDate)
    const end = new Date(sem.endDate)
    end.setHours(23, 59, 59, 999)

    const matching = submissions.filter(s => {
      const d = new Date(s.created_at)
      return d >= start && d <= end && !archivedIds.value.has(s._id)
    })

    if (matching.length === 0) return 0

    if (!archivedMap.value[semesterId]) archivedMap.value[semesterId] = []
    matching.forEach(s => archivedMap.value[semesterId].push(s._id))
    persist()
    return matching.length
  }

  function unarchive(submissionIds) {
    for (const semId of Object.keys(archivedMap.value)) {
      archivedMap.value[semId] = archivedMap.value[semId].filter(id => !submissionIds.includes(id))
      if (archivedMap.value[semId].length === 0) delete archivedMap.value[semId]
    }
    persist()
  }

  function isArchived(submissionId) {
    return archivedIds.value.has(submissionId)
  }

  function getArchivedSubmissions(submissions, semesterId) {
    if (semesterId) {
      const ids = archivedMap.value[semesterId] || []
      return submissions.filter(s => ids.includes(s._id))
    }
    return submissions.filter(s => archivedIds.value.has(s._id))
  }

  return {
    semesters,
    archivedMap,
    archivedIds,
    addSemester,
    removeSemester,
    updateSemester,
    archiveBySemester,
    unarchive,
    isArchived,
    getArchivedSubmissions,
  }
})
