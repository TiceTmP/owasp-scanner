<template>
  <div>
    <div class="text-center">
      <Icon name="heroicons:shield-check" class="h-16 w-16 text-primary-600 mb-4 mx-auto" />
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700">
          ชื่อผู้ใช้
        </label>
        <div class="mt-1">
          <input
              v-model="username"
              id="username"
              name="username"
              type="text"
              required
              class="form-input"
              :class="{ 'border-red-500 focus:ring-red-500': errors.username }"
          />
          <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">
          รหัสผ่าน
        </label>
        <div class="mt-1 relative">
          <input
              v-model="password"
              id="password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="form-input"
              :class="{ 'border-red-500 focus:ring-red-500': errors.password }"
          />
          <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <Icon
                :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
                class="h-5 w-5 text-gray-400"
            />
          </button>
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>
      </div>

      <div>
        <button
            type="submit"
            :disabled="authLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <span v-if="authLoading" class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังเข้าสู่ระบบ...
          </span>
          <span v-else class="inline-flex items-center">
            <Icon name="heroicons:lock-closed" class="mr-2 h-4 w-4" />
            เข้าสู่ระบบ
          </span>
        </button>
      </div>

      <div v-if="authError" class="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
        {{ authError }}
      </div>

      <div class="text-center text-sm text-gray-500">
        สำหรับการทดลองใช้งาน สามารถใช้: admin / password
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

// Define page layout
definePageMeta({
  layout: 'auth',
});

// State
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const errors = reactive({
  username: '',
  password: '',
});

// Get auth composable
const { login, loading: authLoading, error: authError } = useAuth();

// Form validation
const validateForm = (): boolean => {
  let isValid = true;

  // Reset errors
  errors.username = '';
  errors.password = '';

  // Validate username
  if (!username.value.trim()) {
    errors.username = 'กรุณากรอกชื่อผู้ใช้';
    isValid = false;
  }

  // Validate password
  if (!password.value) {
    errors.password = 'กรุณากรอกรหัสผ่าน';
    isValid = false;
  }

  return isValid;
};

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    await login(username.value, password.value);
    // หลังจากเข้าสู่ระบบสำเร็จ useAuth จะนำทางไปยังหน้าแดชบอร์ดโดยอัตโนมัติ
  } catch (error) {
    // Error is already handled in useAuth
  }
};
</script>