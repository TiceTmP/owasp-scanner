<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">สแกนความปลอดภัยตามมาตรฐาน OWASP</h1>

    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <div class="mb-6">
        <label class="form-label block mb-3">เลือกประเภทการสแกน</label>
        <div class="flex space-x-4">
          <div class="flex items-center">
            <input
                id="scanTypeBackend"
                type="radio"
                value="backend"
                v-model="scanType"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500"
            />
            <label for="scanTypeBackend" class="ml-2 block text-sm text-gray-700">
              API (Backend)
            </label>
          </div>
          <div class="flex items-center">
            <input
                id="scanTypeFrontend"
                type="radio"
                value="frontend"
                v-model="scanType"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500"
            />
            <label for="scanTypeFrontend" class="ml-2 block text-sm text-gray-700">
              เว็บไซต์ (Frontend)
            </label>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- ฟอร์มสำหรับสแกน Backend API -->
        <template v-if="scanType === 'backend'">
          <div>
            <label for="apiJsonUrl" class="form-label">URL ของ Swagger JSON</label>
            <input
                v-model="backendScanRequest.apiJsonUrl"
                id="apiJsonUrl"
                type="url"
                placeholder="https://api.example.com/swagger.json"
                class="form-input"
                :class="{ 'border-red-500 focus:ring-red-500': errors.apiJsonUrl }"
                required
            />
            <p v-if="errors.apiJsonUrl" class="mt-1 text-sm text-red-600">{{ errors.apiJsonUrl }}</p>
          </div>

          <div>
            <label for="baseUrl" class="form-label">Base URL ของ API</label>
            <input
                v-model="backendScanRequest.baseUrl"
                id="baseUrl"
                type="url"
                placeholder="https://api.example.com"
                class="form-input"
                :class="{ 'border-red-500 focus:ring-red-500': errors.baseUrl }"
                required
            />
            <p v-if="errors.baseUrl" class="mt-1 text-sm text-red-600">{{ errors.baseUrl }}</p>
          </div>
        </template>

        <!-- ฟอร์มสำหรับสแกน Frontend -->
        <template v-else>
          <div>
            <label for="frontendUrl" class="form-label">URL ของเว็บไซต์</label>
            <input
                v-model="frontendScanRequest.frontendUrl"
                id="frontendUrl"
                type="url"
                placeholder="https://example.com"
                class="form-input"
                :class="{ 'border-red-500 focus:ring-red-500': errors.frontendUrl }"
                required
            />
            <p v-if="errors.frontendUrl" class="mt-1 text-sm text-red-600">{{ errors.frontendUrl }}</p>
          </div>

          <div class="mt-4">
            <div class="flex items-center">
              <input
                  id="useAuthentication"
                  type="checkbox"
                  v-model="useAuthentication"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="useAuthentication" class="ml-2 block text-sm text-gray-700">
                ต้องการใช้ระบบยืนยันตัวตน (สำหรับเว็บไซต์ที่ต้องล็อกอิน)
              </label>
            </div>
          </div>

          <!-- ฟอร์มยืนยันตัวตน (เมื่อเลือกใช้การยืนยันตัวตน) -->
          <div v-if="useAuthentication" class="border border-gray-200 rounded-md p-4 mt-2 bg-gray-50">
            <div class="mb-3">
              <label for="loginUrl" class="form-label">URL หน้าล็อกอิน</label>
              <input
                  v-model="frontendScanRequest.authentication.loginUrl"
                  id="loginUrl"
                  type="url"
                  placeholder="https://example.com/login"
                  class="form-input"
                  :class="{ 'border-red-500 focus:ring-red-500': errors.loginUrl }"
                  required
              />
              <p v-if="errors.loginUrl" class="mt-1 text-sm text-red-600">{{ errors.loginUrl }}</p>
            </div>

            <div class="mb-3">
              <label for="username" class="form-label">ชื่อผู้ใช้</label>
              <input
                  v-model="frontendScanRequest.authentication.username"
                  id="username"
                  type="text"
                  placeholder="username"
                  class="form-input"
                  :class="{ 'border-red-500 focus:ring-red-500': errors.username }"
                  required
              />
              <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">รหัสผ่าน</label>
              <input
                  v-model="frontendScanRequest.authentication.password"
                  id="password"
                  type="password"
                  placeholder="password"
                  class="form-input"
                  :class="{ 'border-red-500 focus:ring-red-500': errors.password }"
                  required
              />
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
            </div>

            <div>
              <label for="loginRequestData" class="form-label">
                <span>ข้อมูล Request สำหรับการล็อกอิน (ตัวเลือก)</span>
                <span
                    class="text-xs text-gray-500 ml-1">(เช่น username={username}&password={password}&submit=login)</span>
              </label>
              <input
                  v-model="frontendScanRequest.authentication.loginRequestData"
                  id="loginRequestData"
                  type="text"
                  placeholder="username={username}&password={password}&submit=login"
                  class="form-input"
              />
            </div>
          </div>
        </template>

        <!-- ตัวเลือกการสแกนร่วมสำหรับทั้ง Frontend และ Backend -->
        <div>
          <label for="minimumRiskLevel" class="form-label">ระดับความเสี่ยงขั้นต่ำที่ต้องการให้รายงาน</label>
          <select
              v-model="minimumRiskLevel"
              id="minimumRiskLevel"
              class="form-input"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <!-- ตัวเลือกเพิ่มเติมสำหรับ Frontend -->
        <div v-if="scanType === 'frontend'" class="border-t pt-4 mt-2">
          <label class="form-label mb-2">ความละเอียดในการสแกน</label>
          <div class="flex space-x-4">
            <div class="flex items-center">
              <input
                  id="scanDepthQuick"
                  type="radio"
                  value="quick"
                  v-model="frontendScanRequest.scanDepth"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <label for="scanDepthQuick" class="ml-2 block text-sm text-gray-700">
                เร็ว
              </label>
            </div>
            <div class="flex items-center">
              <input
                  id="scanDepthStandard"
                  type="radio"
                  value="standard"
                  v-model="frontendScanRequest.scanDepth"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <label for="scanDepthStandard" class="ml-2 block text-sm text-gray-700">
                มาตรฐาน
              </label>
            </div>
            <div class="flex items-center">
              <input
                  id="scanDepthDetailed"
                  type="radio"
                  value="detailed"
                  v-model="frontendScanRequest.scanDepth"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <label for="scanDepthDetailed" class="ml-2 block text-sm text-gray-700">
                ละเอียด
              </label>
            </div>
          </div>
        </div>

        <div class="pt-4">
          <button
              type="submit"
              class="btn btn-primary w-full"
              :disabled="loading"
          >
            <span v-if="loading" class="inline-flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังเริ่มสแกน...
            </span>
            <span v-else class="inline-flex items-center">
              <Icon name="heroicons:play" class="mr-2 h-4 w-4"/>
              เริ่มสแกน
            </span>
          </button>
        </div>
      </form>
    </div>

    <div class="bg-blue-50 p-4 rounded-md border border-blue-200">
      <p class="text-sm text-blue-700" v-if="scanType === 'backend'">
        ระบบจะทำการสแกนตามมาตรฐาน OWASP โดยใช้ข้อมูล API จาก Swagger JSON ที่คุณระบุ
        กระบวนการสแกนอาจใช้เวลาหลายนาทีขึ้นอยู่กับขนาดและความซับซ้อนของ API
      </p>
      <p class="text-sm text-blue-700" v-else>
        ระบบจะทำการสแกนเว็บไซต์ตามมาตรฐาน OWASP เพื่อตรวจหาช่องโหว่ด้านความปลอดภัย
        กระบวนการสแกนอาจใช้เวลาหลายนาทีขึ้นอยู่กับขนาดและความซับซ้อนของเว็บไซต์
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, watch} from 'vue';
import type {ScanRequest} from '~/types';

// Define middleware
definePageMeta({
  // middleware: 'auth',
});

// Router
const router = useRouter();

// Alert
const {$notify} = useNuxtApp();

// Get API service
const scanApi = useScanApi();
const loading = ref(false);

// สถานะการเลือกประเภทการสแกน (backend หรือ frontend)
const scanType = ref('backend');

// สถานะการใช้ระบบยืนยันตัวตน
const useAuthentication = ref(false);

// ตัวเลือกความเสี่ยงขั้นต่ำที่ใช้กับทั้ง frontend และ backend
const minimumRiskLevel = ref('Medium');

// Form data สำหรับ backend
const backendScanRequest = reactive<ScanRequest>({
  apiJsonUrl: '',
  baseUrl: '',
  minimumRiskLevel: 'Medium',
});

// Form data สำหรับ frontend
const frontendScanRequest = reactive({
  frontendUrl: '',
  scanDepth: 'standard',
  minimumRiskLevel: 'Medium',
  authentication: {
    loginUrl: '',
    username: '',
    password: '',
    loginRequestData: '',
  },
  scanOptions: {
    sameHostOnly: true,
    maxDuration: 60,
  },
});

// Form errors
const errors = reactive({
  apiJsonUrl: '',
  baseUrl: '',
  frontendUrl: '',
  loginUrl: '',
  username: '',
  password: '',
});

// อัปเดต minimumRiskLevel ระหว่าง frontend และ backend เมื่อมีการเปลี่ยนแปลง
watch(minimumRiskLevel, (newValue) => {
  backendScanRequest.minimumRiskLevel = newValue;
  frontendScanRequest.minimumRiskLevel = newValue;
});

// อัปเดตค่า minimumRiskLevel เมื่อเปลี่ยน scanType
watch(scanType, () => {
  resetErrors();
});

// Reset errors
const resetErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
};

// Validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Form validation
const validateForm = (): boolean => {
  let isValid = true;
  resetErrors();

  if (scanType.value === 'backend') {
    // Validate apiJsonUrl
    if (!backendScanRequest.apiJsonUrl.trim()) {
      errors.apiJsonUrl = 'กรุณากรอก URL ของ Swagger JSON';
      isValid = false;
    } else if (!isValidUrl(backendScanRequest.apiJsonUrl)) {
      errors.apiJsonUrl = 'กรุณากรอก URL ที่ถูกต้อง';
      isValid = false;
    }

    // Validate baseUrl
    if (!backendScanRequest.baseUrl.trim()) {
      errors.baseUrl = 'กรุณากรอก Base URL ของ API';
      isValid = false;
    } else if (!isValidUrl(backendScanRequest.baseUrl)) {
      errors.baseUrl = 'กรุณากรอก URL ที่ถูกต้อง';
      isValid = false;
    }
  } else {
    // Validate frontendUrl
    if (!frontendScanRequest.frontendUrl.trim()) {
      errors.frontendUrl = 'กรุณากรอก URL ของเว็บไซต์';
      isValid = false;
    } else if (!isValidUrl(frontendScanRequest.frontendUrl)) {
      errors.frontendUrl = 'กรุณากรอก URL ที่ถูกต้อง';
      isValid = false;
    }

    // Validate authentication fields if useAuthentication is true
    if (useAuthentication.value) {
      if (!frontendScanRequest.authentication.loginUrl.trim()) {
        errors.loginUrl = 'กรุณากรอก URL หน้าล็อกอิน';
        isValid = false;
      } else if (!isValidUrl(frontendScanRequest.authentication.loginUrl)) {
        errors.loginUrl = 'กรุณากรอก URL ที่ถูกต้อง';
        isValid = false;
      }

      if (!frontendScanRequest.authentication.username.trim()) {
        errors.username = 'กรุณากรอกชื่อผู้ใช้';
        isValid = false;
      }

      if (!frontendScanRequest.authentication.password.trim()) {
        errors.password = 'กรุณากรอกรหัสผ่าน';
        isValid = false;
      }
    }
  }

  return isValid;
};

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    let response;

    if (scanType.value === 'backend') {
      // สแกน backend API
      response = await scanApi.createScan(backendScanRequest);
    } else {
      // สแกน frontend
      const requestData = {...frontendScanRequest};

      // ถ้าไม่ได้ใช้การยืนยันตัวตน ลบข้อมูล authentication ออก
      if (!useAuthentication.value) {
        delete requestData.authentication;
      }

      response = await scanApi.createFrontendScan(requestData);
    }

    // แสดงการแจ้งเตือนสำเร็จ (ถ้ามี Notify plugin)
    if ($notify) {
      $notify({
        title: 'เริ่มสแกนสำเร็จ',
        text: `รหัสการสแกน: ${response.scanId}`,
        type: 'success',
      });
    }

    // นำทางไปยังหน้าผลการสแกน
    router.push(`/scan/${response.scanId}`);
  } catch (error) {
    // แสดงการแจ้งเตือนข้อผิดพลาด (ถ้ามี Notify plugin)
    if ($notify) {
      $notify({
        title: 'เกิดข้อผิดพลาด',
        text: typeof error === 'string' ? error : 'ไม่สามารถเริ่มการสแกนได้',
        type: 'error',
      });
    }
  } finally {
    loading.value = false;
  }
};
</script>