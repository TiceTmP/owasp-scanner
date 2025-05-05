<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-extrabold text-gray-800">
          OWASP API Scanner
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          ระบบตรวจสอบความปลอดภัย API ตามมาตรฐาน OWASP
        </p>
      </div>

      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth layout - used for login page
</script>