<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">สแกนความปลอดภัย API ตามมาตรฐาน OWASP</h1>

    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="apiJsonUrl" class="form-label">URL ของ Swagger JSON</label>
          <input
              v-model="scanRequest.apiJsonUrl"
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
              v-model="scanRequest.baseUrl"
              id="baseUrl"
              type="url"
              placeholder="https://api.example.com"
              class="form-input"
              :class="{ 'border-red-500 focus:ring-red-500': errors.baseUrl }"
              required
          />
          <p v-if="errors.baseUrl" class="mt-1 text-sm text-red-600">{{ errors.baseUrl }}</p>
        </div>

        <div>
          <label for="minimumRiskLevel" class="form-label">ระดับความเสี่ยงขั้นต่ำที่ต้องการให้รายงาน</label>
          <select
              v-model="scanRequest.minimumRiskLevel"
              id="minimumRiskLevel"
              class="form-input"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
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
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังเริ่มสแกน...
            </span>
            <span v-else class="inline-flex items-center">
              <Icon name="heroicons:play" class="mr-2 h-4 w-4" />
              เริ่มสแกน
            </span>
          </button>
        </div>
      </form>
    </div>

    <div class="bg-blue-50 p-4 rounded-md border border-blue-200">
      <p class="text-sm text-blue-700">
        ระบบจะทำการสแกนตามมาตรฐาน OWASP โดยใช้ข้อมูล API จาก Swagger JSON ที่คุณระบุ
        กระบวนการสแกนอาจใช้เวลาหลายนาทีขึ้นอยู่กับขนาดและความซับซ้อนของ API
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { ScanRequest } from '~/types';

// Define middleware
definePageMeta({
  // middleware: 'auth',
});

// Router
const router = useRouter();

// Alert
const { $notify } = useNuxtApp();

// Get API service
const scanApi = useScanApi();
const loading = ref(false);

// Form data
const scanRequest = reactive<ScanRequest>({
  apiJsonUrl: '',
  baseUrl: '',
  minimumRiskLevel: 'Medium',
});

// Form errors
const errors = reactive({
  apiJsonUrl: '',
  baseUrl: '',
});

// Form validation
const validateForm = (): boolean => {
  let isValid = true;

  // Reset errors
  errors.apiJsonUrl = '';
  errors.baseUrl = '';

  // Validate apiJsonUrl
  if (!scanRequest.apiJsonUrl.trim()) {
    errors.apiJsonUrl = 'กรุณากรอก URL ของ Swagger JSON';
    isValid = false;
  } else if (!isValidUrl(scanRequest.apiJsonUrl)) {
    errors.apiJsonUrl = 'กรุณากรอก URL ที่ถูกต้อง';
    isValid = false;
  }

  // Validate baseUrl
  if (!scanRequest.baseUrl.trim()) {
    errors.baseUrl = 'กรุณากรอก Base URL ของ API';
    isValid = false;
  } else if (!isValidUrl(scanRequest.baseUrl)) {
    errors.baseUrl = 'กรุณากรอก URL ที่ถูกต้อง';
    isValid = false;
  }

  return isValid;
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

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    const response = await scanApi.createScan(scanRequest);

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