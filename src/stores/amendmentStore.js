import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './authStore'
import { apiFetch } from '@/utils/api'

export const useAmendmentStore = defineStore('amendment', () => {
  const amendments = ref([])
  const loading = ref(false)
  const error = ref('')

  // Demo data for quick demo access
  const DEMO_DATA = [
    {
      _id: 'demo_1',
      academic_year: '2025-2026',
      term: '1',
      student_no: '22240802',
      student_name: 'John Smith',
      course_code: 'COMP3047',
      course_title: 'Software Engineering',
      original_grade: 'I',
      new_grade: 'A',
      reason_type: 'conversion',
      reason_details: 'Completed missing coursework',
      instructor_name: 'Dr. Martin Choy',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 5*24*60*60*1000).toISOString()
    },
    {
      _id: 'demo_2',
      academic_year: '2025-2026',
      term: '1',
      student_no: '22240803',
      student_name: 'Sarah Johnson',
      course_code: 'COMP3048',
      course_title: 'Database Systems',
      original_grade: 'B-',
      new_grade: 'B+',
      reason_type: 'appeal',
      appeal_grounds: 'Technical errors',
      appeal_details: 'Grading calculation error in final exam',
      instructor_name: 'Prof. Emily Wong',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 4*24*60*60*1000).toISOString()
    },
    {
      _id: 'demo_3',
      academic_year: '2025-2026',
      term: '2',
      student_no: '22240804',
      student_name: 'Michael Chen',
      course_code: 'COMP4001',
      course_title: 'Advanced Algorithms',
      original_grade: 'C+',
      new_grade: 'B-',
      reason_type: 'makeup',
      reason_details: 'Made up supplementary exam with score 82',
      instructor_name: 'Dr. David Lee',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 3*24*60*60*1000).toISOString()
    },
    {
      _id: 'demo_4',
      academic_year: '2025-2026',
      term: '1',
      student_no: '22240805',
      student_name: 'Lisa Wang',
      course_code: 'COMP3050',
      course_title: 'Web Development',
      original_grade: 'NR',
      new_grade: 'A-',
      reason_type: 'conversion',
      reason_details: 'Student submitted deferred assessment',
      instructor_name: 'Dr. James Park',
      department: 'COMP',
      status: 'Submitted',
      created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString()
    },
    {
      _id: 'demo_5',
      academic_year: '2025-2026',
      term: '2',
      student_no: '22240806',
      student_name: 'Thomas Brown',
      course_code: 'COMP4010',
      course_title: 'Machine Learning',
      original_grade: 'D+',
      new_grade: 'C+',
      reason_type: 'supplementary',
      reason_details: 'Passed supplementary examination with score 65',
      instructor_name: 'Dr. Rachel Kim',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString()
    },
    {
      _id: 'demo_6',
      academic_year: '2024-2025',
      term: '1',
      student_no: '22240807',
      student_name: 'Amanda Lee',
      course_code: 'COMP3010',
      course_title: 'Network Security',
      original_grade: 'A-',
      new_grade: 'A',
      reason_type: 'review',
      reason_details: 'Instructor review revealed grading error',
      instructor_name: 'Dr. Peter Zhang',
      department: 'COMP',
      status: 'Approved',
      created_at: new Date(Date.now() - 10*24*60*60*1000).toISOString()
    },
    {
      _id: 'demo_7',
      academic_year: '2025-2026',
      term: '1',
      student_no: '22240808',
      student_name: 'Robert Martinez',
      course_code: 'COMP3020',
      course_title: 'Computer Networks',
      original_grade: 'B',
      new_grade: 'B+',
      reason_type: 'appeal',
      appeal_grounds: 'Procedural faults',
      appeal_details: 'Final exam not marked according to rubric',
      instructor_name: 'Dr. Susan Black',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 6*24*60*60*1000).toISOString()
    },
    {
      _id: 'demo_8',
      academic_year: '2025-2026',
      term: '2',
      student_no: '22240809',
      student_name: 'Jessica Taylor',
      course_code: 'COMP4020',
      course_title: 'Mobile App Development',
      original_grade: 'C',
      new_grade: 'B-',
      reason_type: 'makeup',
      reason_details: 'Makeup exam score: 70',
      instructor_name: 'Dr. Andrew White',
      department: 'COMP',
      status: 'Rejected',
      created_at: new Date(Date.now() - 7*24*60*60*1000).toISOString()
    },
    {
      _id: 'demo_9',
      academic_year: '2025-2026',
      term: '1',
      student_no: '22240810',
      student_name: 'Kevin Johnson',
      course_code: 'COMP3030',
      course_title: 'Data Structures',
      original_grade: 'B-',
      new_grade: 'B',
      reason_type: 'conversion',
      reason_details: 'Completed missing assessment',
      instructor_name: 'Dr. Henry Adams',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 8*24*60*60*1000).toISOString()
    },
    {
      _id: 'demo_10',
      academic_year: '2025-2026',
      term: '1',
      student_no: '22240811',
      student_name: 'Emily Fung',
      course_code: 'COMP3055',
      course_title: 'Operating Systems',
      original_grade: 'I',
      new_grade: 'B',
      reason_type: 'conversion',
      reason_details: 'Submitted late coursework with medical certificate',
      instructor_name: 'Dr. Henry Adams',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 9*24*60*60*1000).toISOString()
    },
    {
      _id: 'demo_11',
      academic_year: '2025-2026',
      term: '2',
      student_no: '22240812',
      student_name: 'Jason Tse',
      course_code: 'COMP4035',
      course_title: 'Distributed Systems',
      original_grade: 'C-',
      new_grade: 'B-',
      reason_type: 'appeal',
      appeal_grounds: 'Technical errors',
      appeal_details: 'Group project contribution was incorrectly attributed',
      instructor_name: 'Prof. Emily Wong',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString()
    },
    {
      _id: 'demo_12',
      academic_year: '2024-2025',
      term: '2',
      student_no: '22240813',
      student_name: 'Sophia Lau',
      course_code: 'COMP3060',
      course_title: 'Human-Computer Interaction',
      original_grade: 'NR',
      new_grade: 'A',
      reason_type: 'conversion',
      reason_details: 'Deferred final project submitted and graded A',
      instructor_name: 'Dr. James Park',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 4*24*60*60*1000).toISOString()
    },
    {
      _id: 'demo_13',
      academic_year: '2025-2026',
      term: '1',
      student_no: '22240814',
      student_name: 'Daniel Ng',
      course_code: 'COMP4045',
      course_title: 'Computer Vision',
      original_grade: 'D',
      new_grade: 'C',
      reason_type: 'supplementary',
      reason_details: 'Passed supplementary exam with score 58',
      instructor_name: 'Dr. Rachel Kim',
      department: 'COMP',
      status: 'Draft',
      created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString()
    },
    {
      _id: 'demo_14',
      academic_year: '2025-2026',
      term: '2',
      student_no: '22240815',
      student_name: 'Grace Yip',
      course_code: 'COMP3070',
      course_title: 'Artificial Intelligence',
      original_grade: 'B+',
      new_grade: 'A-',
      reason_type: 'review',
      reason_details: 'Re-marking of final exam revealed scoring error (+5 marks)',
      instructor_name: 'Dr. David Lee',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 3*24*60*60*1000).toISOString()
    }
  ]

  // Demo data for PD user (Programme Director)
  const PD_DEMO_DATA = [
    {
      _id: 'pd_1',
      academic_year: '2025-2026',
      term: '1',
      student_no: '22241001',
      student_name: 'Alice Yeung',
      course_code: 'COMP3047',
      course_title: 'Software Engineering',
      original_grade: 'I',
      new_grade: 'B+',
      reason_type: 'conversion',
      reason_details: 'Completed missing final project',
      instructor_name: 'Dr. Martin Choy',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 3*24*60*60*1000).toISOString()
    },
    {
      _id: 'pd_2',
      academic_year: '2025-2026',
      term: '1',
      student_no: '22241002',
      student_name: 'Billy Lam',
      course_code: 'COMP3047',
      course_title: 'Software Engineering',
      original_grade: 'NR',
      new_grade: 'A-',
      reason_type: 'conversion',
      reason_details: 'Submitted deferred coursework',
      instructor_name: 'Dr. Martin Choy',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString()
    },
    {
      _id: 'pd_3',
      academic_year: '2025-2026',
      term: '2',
      student_no: '22241003',
      student_name: 'Cherry Ho',
      course_code: 'COMP4055',
      course_title: 'Cloud Computing',
      original_grade: 'C',
      new_grade: 'B',
      reason_type: 'review',
      reason_details: 'Re-marking revealed scoring error in assignment 3',
      instructor_name: 'Dr. Martin Choy',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString()
    },
    {
      _id: 'pd_4',
      academic_year: '2025-2026',
      term: '1',
      student_no: '22241004',
      student_name: 'David Kwok',
      course_code: 'COMP3080',
      course_title: 'Information Security',
      original_grade: 'D',
      new_grade: 'C+',
      reason_type: 'supplementary',
      reason_details: 'Passed supplementary exam with score 68',
      instructor_name: 'Dr. Martin Choy',
      department: 'COMP',
      status: 'Submitted',
      created_at: new Date(Date.now() - 5*24*60*60*1000).toISOString()
    },
    {
      _id: 'pd_5',
      academic_year: '2025-2026',
      term: '1',
      student_no: '22241005',
      student_name: 'Ethan Mok',
      course_code: 'COMP3047',
      course_title: 'Software Engineering',
      original_grade: 'I',
      new_grade: 'B',
      reason_type: 'conversion',
      reason_details: 'Completed deferred lab assignments',
      instructor_name: 'Dr. Martin Choy',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 6*24*60*60*1000).toISOString()
    },
    {
      _id: 'pd_6',
      academic_year: '2025-2026',
      term: '2',
      student_no: '22241006',
      student_name: 'Fiona Chan',
      course_code: 'COMP4060',
      course_title: 'Natural Language Processing',
      original_grade: 'B',
      new_grade: 'A-',
      reason_type: 'appeal',
      appeal_grounds: 'Technical errors',
      appeal_details: 'Group project peer-review scores were incorrectly calculated',
      instructor_name: 'Dr. Martin Choy',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 4*24*60*60*1000).toISOString()
    },
    {
      _id: 'pd_7',
      academic_year: '2024-2025',
      term: '2',
      student_no: '22241007',
      student_name: 'Gary Wong',
      course_code: 'COMP3090',
      course_title: 'Compiler Design',
      original_grade: 'C-',
      new_grade: 'B-',
      reason_type: 'makeup',
      reason_details: 'Makeup exam score: 72. Student had medical absence.',
      instructor_name: 'Dr. Martin Choy',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 7*24*60*60*1000).toISOString()
    },
    {
      _id: 'pd_8',
      academic_year: '2025-2026',
      term: '1',
      student_no: '22241008',
      student_name: 'Helen Tam',
      course_code: 'COMP4055',
      course_title: 'Cloud Computing',
      original_grade: 'D+',
      new_grade: 'C+',
      reason_type: 'supplementary',
      reason_details: 'Passed supplementary examination with score 60',
      instructor_name: 'Dr. Martin Choy',
      department: 'COMP',
      status: 'Pending',
      created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString()
    },
    {
      _id: 'pd_9',
      academic_year: '2025-2026',
      term: '2',
      student_no: '22241009',
      student_name: 'Ivan Leung',
      course_code: 'COMP3050',
      course_title: 'Web Development',
      original_grade: 'NR',
      new_grade: 'B+',
      reason_type: 'conversion',
      reason_details: 'Completed deferred final assessment with distinction',
      instructor_name: 'Dr. Martin Choy',
      department: 'COMP',
      status: 'Draft',
      created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString()
    },
    {
      _id: 'pd_rej_1',
      academic_year: '2024-2025',
      term: '2',
      student_no: '22241010',
      student_name: 'Mary Wong',
      course_code: 'COMP3090',
      course_title: 'Compiler Design',
      original_grade: 'B',
      new_grade: 'A-',
      reason_type: 'appeal',
      appeal_grounds: 'Technical errors',
      appeal_details: 'Final exam re-marking revealed +8 marks scoring error in question 4',
      instructor_name: 'Dr. Martin Choy',
      department: 'COMP',
      status: 'Rejected',
      created_at: new Date(Date.now() - 8*24*60*60*1000).toISOString()
    }
  ]

  const isDemoUser = () => {
    const auth = useAuthStore()
    return auth.token?.startsWith('demo_token_')
  }

  const assertCanModifyAmendments = () => {
    const auth = useAuthStore()
    if (auth.user?.role === 'admin') {
      throw new Error('Admin accounts cannot modify amendment requests')
    }
  }

  async function fetchAmendments(query) {
    const auth = useAuthStore()
    loading.value = true
    error.value = ''

    try {
      // For demo users, return hardcoded demo data
      if (isDemoUser()) {
        const auth2 = useAuthStore()
        amendments.value = auth2.user?.role === 'admin' ? DEMO_DATA : PD_DEMO_DATA
        loading.value = false
        return
      }

      // For real users, fetch from API
      let url = '/api/amendments'
      const params = new URLSearchParams(query || {})
      // Ensure we fetch all statuses including Draft
      if (!params.has('status')) {
        params.append('includeAll', 'true')
      }
      const queryString = params.toString()
      if (queryString) url += '?' + queryString
      
      const res = await apiFetch(url, { headers: auth.authHeaders() })
      if (!res.ok) throw new Error('Failed to fetch amendments')
      amendments.value = await res.json()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createAmendment(data) {
    assertCanModifyAmendments()
    const auth = useAuthStore()

    // For demo users, add to local list only
    if (isDemoUser()) {
      const newAmendment = {
        _id: 'demo_' + Date.now(),
        ...data,
        status: 'Pending',
        created_at: new Date().toISOString()
      }
      amendments.value.unshift(newAmendment)
      return newAmendment
    }

    // For real users, post to API
    const res = await apiFetch('/api/amendments', {
      method: 'POST',
      headers: auth.authHeaders(),
      body: JSON.stringify(data)
    })
    const result = await res.json()
    if (!res.ok) {
      const detail = Array.isArray(result.errors) && result.errors.length > 0
        ? ': ' + result.errors.join(', ')
        : ''
      throw new Error((result.message || 'Failed to create amendment') + detail)
    }
    
    // Add newly created amendment to the store immediately
    amendments.value.unshift(result)
    return result
  }

  async function updateAmendment(id, data) {
    assertCanModifyAmendments()
    const auth = useAuthStore()

    // For demo users, update local list only
    if (isDemoUser()) {
      const idx = amendments.value.findIndex(a => a._id === id)
      if (idx >= 0) {
        amendments.value[idx] = { ...amendments.value[idx], ...data }
        return amendments.value[idx]
      }
      throw new Error('Amendment not found')
    }

    // For real users, put to API
    const res = await apiFetch('/api/amendments/' + id, {
      method: 'PUT',
      headers: auth.authHeaders(),
      body: JSON.stringify(data)
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || 'Failed to update')
    await fetchAmendments()
    return result
  }

  async function deleteAmendment(id) {
    assertCanModifyAmendments()
    const auth = useAuthStore()

    // For demo users, delete from local list only
    if (isDemoUser()) {
      amendments.value = amendments.value.filter(a => a._id !== id)
      return
    }

    // For real users, delete via API
    const res = await apiFetch('/api/amendments/' + id, {
      method: 'DELETE',
      headers: auth.authHeaders()
    })

    let result = {}
    try {
      result = await res.json()
    } catch {
      result = {}
    }

    // If backend no longer has this row, treat it as already deleted.
    if (res.status === 404) {
      amendments.value = amendments.value.filter(a => a._id !== id)
      return { ok: true, alreadyDeleted: true }
    }

    if (!res.ok) throw new Error(result.message || 'Failed to delete')
    amendments.value = amendments.value.filter(a => a._id !== id)
  }

  async function importExcel(file) {
    assertCanModifyAmendments()
    const auth = useAuthStore()

    // Demo users cannot import Excel (warning)
    if (isDemoUser()) {
      throw new Error('Excel import is not available in demo mode. Use the form to add amendments manually.')
    }

    // For real users, import via API
    const formData = new FormData()
    formData.append('excelFile', file)
    const res = await apiFetch('/api/amendments/import', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + auth.token },
      body: formData
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.message || 'Import failed')
    await fetchAmendments()
    return result
  }

  return { amendments, loading, error, fetchAmendments, createAmendment, updateAmendment, deleteAmendment, importExcel }
})
