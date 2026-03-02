<template>
  <div class="container mt-4">
    <h1 class="mb-4">{{ title }}</h1>

    <AlertMessage 
      v-if="message" 
      type="success" 
      :message="message"
      @close="message = ''"
    />

    <AlertMessage 
      v-if="error" 
      type="danger" 
      :message="error"
      @close="error = ''"
    />

    <div class="card">
      <div class="card-header bg-primary text-white">
        <strong>Insert New Amendment</strong>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitForm" id="insertForm">
          
          <!-- Academic Year and Term Section -->
          <div class="form-section">
            <div class="section-title">Academic Information</div>
            <div class="row">
              <div class="col-md-6">
                <label for="academicYear" class="form-label">AY: <span class="text-danger">*</span></label>
                <div style="display: flex; align-items: center; gap: 5px;">
                  <span style="font-size: 1rem; font-weight: 500;">20</span>
                  <input 
                    v-model="form.academicYear" 
                    type="text" 
                    class="form-control" 
                    id="academicYear" 
                    name="academicYear" 
                    style="flex: 0 0 60px; text-align: center;" 
                    placeholder="__" 
                    maxlength="2" 
                    required
                    @input="updateAcademicYearDisplay"
                  >
                  <span style="font-size: 1rem; font-weight: 500;">– 20</span>
                  <input 
                    v-model="ayDisplay" 
                    type="text" 
                    class="form-control" 
                    id="ayDisplay" 
                    style="flex: 0 0 60px; text-align: center; background-color: #f0f0f0;" 
                    placeholder="__" 
                    readonly
                  >
                </div>
                <small class="text-muted">Enter 2 digits (e.g., 22 for 2022-2023)</small>
              </div>
              <div class="col-md-6">
                <label for="term" class="form-label">Term <span class="text-danger">*</span></label>
                <select v-model="form.term" class="form-select" id="term" name="term" required>
                  <option value="">Select Term</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="winter">Winter</option>
                  <option value="summer">Summer</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Student Information Section -->
          <div class="form-section">
            <div class="section-title">Student Information</div>
            <div class="row">
              <div class="col-md-6">
                <label for="studentId" class="form-label">Student ID <span class="text-danger">*</span></label>
                <input v-model="form.studentId" type="text" class="form-control" id="studentId" name="studentId" placeholder="e.g., S12345" required>
              </div>
              <div class="col-md-6">
                <label for="studentName" class="form-label">Student Name <span class="text-danger">*</span></label>
                <input v-model="form.studentName" type="text" class="form-control" id="studentName" name="studentName" placeholder="e.g., John Doe" required>
              </div>
            </div>
          </div>

          <!-- Course Information Section -->
          <div class="form-section">
            <div class="section-title">Course Information</div>
            <div class="row">
              <div class="col-md-6">
                <label for="courseCode" class="form-label">Course Code <span class="text-danger">*</span></label>
                <input v-model="form.courseCode" type="text" class="form-control" id="courseCode" name="courseCode" placeholder="e.g., CS101" required>
              </div>
              <div class="col-md-6">
                <label for="courseName" class="form-label">Course Name <span class="text-danger">*</span></label>
                <input v-model="form.courseName" type="text" class="form-control" id="courseName" name="courseName" placeholder="e.g., Introduction to Computer Science" required>
              </div>
            </div>
          </div>

          <!-- Grade Information Section -->
          <div class="form-section">
            <div class="section-title">Grade Information</div>
            <div class="row">
              <div class="col-md-6">
                <label for="originalGrade" class="form-label">Original Grade <span class="text-danger">*</span></label>
                <input v-model="form.originalGrade" type="text" class="form-control" id="originalGrade" name="originalGrade" placeholder="e.g., B" required>
              </div>
              <div class="col-md-6">
                <label for="amendedGrade" class="form-label">Amended Grade <span class="text-danger">*</span></label>
                <input v-model="form.amendedGrade" type="text" class="form-control" id="amendedGrade" name="amendedGrade" placeholder="e.g., A" required>
              </div>
            </div>

            <!-- Final Year Student Warning -->
            <div class="alert alert-info alert-dismissible fade show" role="alert">
              <div class="checkbox-item mb-3">
                <input v-model="form.finalYearStudent" type="checkbox" id="finalYearStudent" name="finalYearStudent" value="yes">
                <label for="finalYearStudent" class="fw-bold">Final Semester / Final Year Student</label>
              </div>
              <p class="mb-0" style="font-size: 0.95rem;">
                <strong>⚠️ Important Notice:</strong> If the grade amendment involves a student who is in his/her final semester of final year, please make sure that the student is well informed that if the grade amendment affects the classification of honours, his/her graduation with the revised classification of honours will need to be re-submitted to the Senate for approval. As a result, the approval date of his/her graduation by the Senate and the award date for his/her diploma will be postponed accordingly.
              </p>
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>

            <div class="row">
              <div class="col-md-12">
                <label class="form-label fw-bold">Reason for Amendment <span class="text-danger">*</span></label>
                
                <!-- Reason Checkboxes -->
                <div class="card mb-3" style="background-color: #f9f9f9;">
                  <div class="card-body">
                    <div class="mb-3">
                      <div class="checkbox-item">
                        <input v-model="form.reasonConversion" type="checkbox" id="reasonConversion" name="reasonConversion" value="yes">
                        <label for="reasonConversion">Conversion of temporary grade (I, NR, PR, YR)</label>
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="checkbox-item">
                        <input v-model="form.reasonMakeup" type="checkbox" id="reasonMakeup" name="reasonMakeup" value="yes">
                        <label for="reasonMakeup">Make up examination (Please provide details):</label>
                      </div>
                      <textarea v-model="form.makeupDetails" class="form-control form-control-sm mt-2" id="makeupDetails" name="makeupDetails" rows="2" placeholder="Please provide details..." v-show="form.reasonMakeup"></textarea>
                    </div>

                    <div class="mb-3">
                      <div class="checkbox-item">
                        <input v-model="form.reasonSupplementary" type="checkbox" id="reasonSupplementary" name="reasonSupplementary" value="yes">
                        <label for="reasonSupplementary">Supplementary examination (Please provide details):</label>
                      </div>
                      <textarea v-model="form.supplementaryDetails" class="form-control form-control-sm mt-2" id="supplementaryDetails" name="supplementaryDetails" rows="2" placeholder="Please provide details..." v-show="form.reasonSupplementary"></textarea>
                    </div>

                    <div class="mb-3">
                      <div class="checkbox-item">
                        <input v-model="form.reasonReview" type="checkbox" id="reasonReview" name="reasonReview" value="yes">
                        <label for="reasonReview">Review initiated by academic staff*(Please provide details):</label>
                      </div>
                      <textarea v-model="form.reviewDetails" class="form-control form-control-sm mt-2" id="reviewDetails" name="reviewDetails" rows="2" placeholder="Please provide details..." v-show="form.reasonReview"></textarea>
                    </div>

                    <div class="mb-3">
                      <div class="checkbox-item">
                        <input v-model="form.reasonOthers" type="checkbox" id="reasonOthers" name="reasonOthers" value="yes">
                        <label for="reasonOthers">Others (please specify):</label>
                      </div>
                      <textarea v-model="form.othersDetails" class="form-control form-control-sm mt-2" id="othersDetails" name="othersDetails" rows="2" placeholder="Please specify..." v-show="form.reasonOthers"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Programme Director / Department Head's Endorsement Section -->
            <div class="row">
              <div class="col-md-12">
                <div class="card mb-3" style="background-color: #e7f3ff; border-left: 4px solid #0d6efd;">
                  <div class="card-header bg-primary text-white">
                    <strong>Programme Director / Department Head's Endorsement</strong>
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-12">
                        <label for="directorName" class="form-label">Name <span class="text-danger">*</span></label>
                        <input v-model="form.directorName" type="text" class="form-control form-control-sm" id="directorName" name="directorName" placeholder="Enter full name" required>
                      </div>
                    </div>
                    <div class="row mt-2">
                      <div class="col-md-12">
                        <label class="form-label">Signature <span class="text-danger">*</span></label>
                        <div class="signature-pad-container">
                          <canvas ref="directorSignaturePad" class="signature-pad"></canvas>
                        </div>
                        <div class="signature-controls">
                          <button type="button" class="btn btn-sm btn-outline-secondary" @click="clearSignaturePad('directorSignaturePad')">Clear</button>
                        </div>
                      </div>
                    </div>
                    <div class="row mt-2">
                      <div class="col-md-6">
                        <label for="directorDate" class="form-label">Date</label>
                        <input v-model="form.directorDate" type="date" class="form-control form-control-sm" id="directorDate" name="directorDate">
                      </div>
                    </div>
                    <div class="row mt-2">
                      <div class="col-md-12">
                        <label for="directorRemarks" class="form-label">Remarks</label>
                        <textarea v-model="form.directorRemarks" class="form-control form-control-sm" id="directorRemarks" name="directorRemarks" rows="2" placeholder="Add any remarks here..."></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-12">
                <div class="card mb-3" style="background-color: #fff3cd;">
                  <div class="card-body">
                    <div class="mb-3">
                      <div class="checkbox-item">
                        <input v-model="form.appealByStudent" type="checkbox" id="appealByStudent" name="appealByStudent" value="yes">
                        <label for="appealByStudent" class="fw-bold">Appeal by student*</label>
                      </div>
                    </div>

                    <!-- Grounds for Appeal (hidden by default) -->
                    <div v-if="form.appealByStudent" style="padding-top: 15px; border-top: 1px solid #ccc;">
                      <label class="form-label fw-bold">Grounds for Appeal:</label>
                      <div class="checkbox-group mb-3">
                        <div class="checkbox-item">
                          <input v-model="form.groundsTechnical" type="checkbox" id="groundsTechnical" name="groundsTechnical" value="yes">
                          <label for="groundsTechnical">Technical error</label>
                        </div>
                        <div class="checkbox-item">
                          <input v-model="form.groundsProcedural" type="checkbox" id="groundsProcedural" name="groundsProcedural" value="yes">
                          <label for="groundsProcedural">Procedural faults</label>
                        </div>
                      </div>

                      <label for="appealDetails" class="form-label">Please provide details below:</label>
                      <textarea v-model="form.appealDetails" class="form-control form-control-sm" id="appealDetails" name="appealDetails" rows="3" placeholder="Please provide details about your appeal..."></textarea>

                      <!-- Faculty/School Dean's Approval Section (inside Appeal by Student) -->
                      <div class="mt-4 pt-3" style="border-top: 2px solid #ffc107;">
                        <div class="card" style="background-color: #fff8e1; border-left: 4px solid #ff9800;">
                          <div class="card-header bg-warning text-dark">
                            <strong>Faculty/School Dean's Approval (Required for Appeal by Student)</strong>
                          </div>
                          <div class="card-body">
                            <div class="row">
                              <div class="col-md-12">
                                <label for="deanName" class="form-label">Name <span class="text-danger">*</span></label>
                                <input v-model="form.deanName" type="text" class="form-control form-control-sm" id="deanName" name="deanName" placeholder="Enter full name" required>
                              </div>
                            </div>
                            <div class="row mt-2">
                              <div class="col-md-12">
                                <label class="form-label">Signature <span class="text-danger">*</span></label>
                                <div class="signature-pad-container">
                                  <canvas ref="deanSignaturePad" class="signature-pad"></canvas>
                                </div>
                                <div class="signature-controls">
                                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="clearSignaturePad('deanSignaturePad')">Clear</button>
                                </div>
                              </div>
                            </div>
                            <div class="row mt-2">
                              <div class="col-md-6">
                                <label for="deanDate" class="form-label">Date</label>
                                <input v-model="form.deanDate" type="date" class="form-control form-control-sm" id="deanDate" name="deanDate">
                              </div>
                            </div>
                            <div class="row mt-2">
                              <div class="col-md-12">
                                <label for="deanRemarks" class="form-label">Remarks</label>
                                <textarea v-model="form.deanRemarks" class="form-control form-control-sm" id="deanRemarks" name="deanRemarks" rows="2" placeholder="Add any remarks here..."></textarea>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <label for="instructorName" class="form-label">Course-Instructor's Name <span class="text-danger">*</span></label>
                <input v-model="form.instructorName" type="text" class="form-control" id="instructorName" name="instructorName" placeholder="Enter instructor's name" required>
              </div>
              <div class="col-md-6">
                <label for="department" class="form-label">Department <span class="text-danger">*</span></label>
                <input v-model="form.department" type="text" class="form-control" id="department" name="department" placeholder="Enter department name" required>
              </div>
            </div>

            <!-- Signature and Date Section -->
            <div class="row mt-3">
              <div class="col-md-12">
                <label class="form-label">Signature <span class="text-danger">*</span></label>
                <div class="signature-pad-container">
                  <canvas ref="instructorSignaturePad" class="signature-pad"></canvas>
                </div>
                <div class="signature-controls">
                  <button type="button" class="btn btn-sm btn-outline-secondary" @click="clearSignaturePad('instructorSignaturePad')">Clear</button>
                </div>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-6">
                <label for="amendmentDate" class="form-label">Date <span class="text-danger">*</span></label>
                <input v-model="form.amendmentDate" type="date" class="form-control" id="amendmentDate" name="amendmentDate" required>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="row mt-4">
            <div class="col-md-12">
              <button type="submit" class="btn btn-primary btn-submit">Submit Amendment</button>
              <button type="reset" class="btn btn-secondary btn-reset ms-2" @click="resetForm">Clear Form</button>
              <router-link to="/amendments" class="btn btn-outline-secondary ms-2">Back to Amendments</router-link>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import AlertMessage from '../components/AlertMessage.vue';
import { addAmendment } from '../services/amendmentService';

export default {
  name: 'InsertFormView',
  components: {
    AlertMessage
  },
  setup() {
    const title = 'Grade Amendment Form';
    const message = ref('');
    const error = ref('');
    const ayDisplay = ref('');
    
    const instructorSignaturePad = ref(null);
    const directorSignaturePad = ref(null);
    const deanSignaturePad = ref(null);
    
    const signaturePads = {};
    
    const form = reactive({
      academicYear: '',
      term: '',
      studentId: '',
      studentName: '',
      courseCode: '',
      courseName: '',
      originalGrade: '',
      amendedGrade: '',
      finalYearStudent: false,
      reasonConversion: false,
      reasonMakeup: false,
      makeupDetails: '',
      reasonSupplementary: false,
      supplementaryDetails: '',
      reasonReview: false,
      reviewDetails: '',
      reasonOthers: false,
      othersDetails: '',
      directorName: '',
      directorDate: '',
      directorRemarks: '',
      appealByStudent: false,
      groundsTechnical: false,
      groundsProcedural: false,
      appealDetails: '',
      deanName: '',
      deanDate: '',
      deanRemarks: '',
      instructorName: '',
      department: '',
      amendmentDate: ''
    });

    const initSignaturePad = (canvasRef, canvasId) => {
      const canvas = canvasRef.value;
      if (!canvas) return;

      // Set canvas size to match display size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Initialize SignaturePad
      const SignaturePad = window.SignaturePad;
      if (SignaturePad) {
        const signaturePad = new SignaturePad(canvas);
        signaturePads[canvasId] = signaturePad;
      }
    };

    const updateAcademicYearDisplay = () => {
      const ayInput = form.academicYear;
      if (ayInput.length === 2 && /^\d{2}$/.test(ayInput)) {
        const nextYear = parseInt(ayInput) + 1;
        ayDisplay.value = String(nextYear).padStart(2, '0');
      } else {
        ayDisplay.value = '';
      }
    };

    const clearSignaturePad = (canvasId) => {
      if (signaturePads[canvasId]) {
        signaturePads[canvasId].clear();
      }
    };

    const validateForm = () => {
      // Validate AY format
      if (!form.academicYear || form.academicYear.length !== 2 || !/^\d{2}$/.test(form.academicYear)) {
        error.value = 'Please enter a valid 2-digit academic year (e.g., 25)';
        return false;
      }

      // Check if instructor signature is provided
      if (!signaturePads['instructorSignaturePad'] || signaturePads['instructorSignaturePad'].isEmpty()) {
        error.value = 'Please provide a signature in the Signature field';
        return false;
      }

      // Check if at least one reason checkbox is selected
      const reasonChecked =
        form.reasonConversion ||
        form.reasonMakeup ||
        form.reasonSupplementary ||
        form.reasonReview ||
        form.reasonOthers;

      if (!reasonChecked) {
        error.value = 'Please select at least one reason for amendment';
        return false;
      }

      // Check if appeal is selected, ensure dean signature is provided
      if (form.appealByStudent) {
        if (!signaturePads['deanSignaturePad'] || signaturePads['deanSignaturePad'].isEmpty()) {
          error.value = 'Please provide Dean\'s signature since Appeal by Student is selected';
          return false;
        }
      }

      return true;
    };

    const submitForm = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        // Get signature data
        const instructorSignature = signaturePads['instructorSignaturePad'] ? 
          (signaturePads['instructorSignaturePad'].isEmpty() ? null : signaturePads['instructorSignaturePad'].toDataURL()) : null;
        
        const directorSignature = signaturePads['directorSignaturePad'] ? 
          (signaturePads['directorSignaturePad'].isEmpty() ? null : signaturePads['directorSignaturePad'].toDataURL()) : null;
        
        const deanSignature = signaturePads['deanSignaturePad'] ? 
          (signaturePads['deanSignaturePad'].isEmpty() ? null : signaturePads['deanSignaturePad'].toDataURL()) : null;

        const formData = {
          ...form,
          instructorSignature,
          directorSignature,
          deanSignature
        };

        const response = await addAmendment(formData);
        message.value = response.message || 'Amendment submitted successfully!';
        resetForm();
      } catch (err) {
        error.value = err.message || 'Error submitting form. Please try again.';
      }
    };

    const resetForm = () => {
      Object.keys(form).forEach(key => {
        if (typeof form[key] === 'boolean') {
          form[key] = false;
        } else {
          form[key] = '';
        }
      });
      ayDisplay.value = '';
      clearSignaturePad('instructorSignaturePad');
      clearSignaturePad('directorSignaturePad');
      clearSignaturePad('deanSignaturePad');
    };

    onMounted(() => {
      // Initialize all signature pads
      initSignaturePad(instructorSignaturePad, 'instructorSignaturePad');
      initSignaturePad(directorSignaturePad, 'directorSignaturePad');
      initSignaturePad(deanSignaturePad, 'deanSignaturePad');
    });

    return {
      title,
      message,
      error,
      form,
      ayDisplay,
      instructorSignaturePad,
      directorSignaturePad,
      deanSignaturePad,
      updateAcademicYearDisplay,
      clearSignaturePad,
      submitForm,
      resetForm
    };
  }
};
</script>

<style scoped>
.form-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.section-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  border-bottom: 2px solid #0d6efd;
  padding-bottom: 10px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-item input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.checkbox-item label {
  margin-bottom: 0;
  cursor: pointer;
  user-select: none;
}

.form-control, .form-select {
  margin-bottom: 15px;
}

.btn-submit {
  padding: 10px 30px;
  font-weight: 600;
}

.btn-reset {
  padding: 10px 30px;
}

.signature-pad-container {
  border: 2px solid #dee2e6;
  border-radius: 5px;
  margin-bottom: 10px;
  background-color: #fff;
}

.signature-pad {
  display: block;
  border: none;
  cursor: crosshair;
  width: 100%;
  height: 150px;
  touch-action: none;
}

.signature-controls {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.signature-controls button {
  padding: 5px 15px;
  font-size: 0.85rem;
}
</style>
