<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo and navigation -->
        <div class="flex">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-xl font-bold text-primary-600">OWASP API Scanner</h1>
          </div>

          <!-- Navigation links -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8" v-if="isLoggedIn">
            <NuxtLink to="/"
                      class="border-transparent text-gray-500 hover:border-primary-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                      :class="{ 'border-primary-500 text-gray-900': route.path === '/' }">
              แดชบอร์ด
            </NuxtLink>

            <NuxtLink to="/scan"
                      class="border-transparent text-gray-500 hover:border-primary-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                      :class="{ 'border-primary-500 text-gray-900': route.path.startsWith('/scan') }">
              สแกนใหม่
            </NuxtLink>
          </div>
        </div>

        <!-- Right side - User menu or login button -->
        <div class="flex items-center">
          <div v-if="isLoggedIn" class="ml-3 relative">
            <!-- User dropdown menu -->
            <div>
              <button @click="isMenuOpen = !isMenuOpen" type="button" class="bg-white rounded-full flex text-sm focus:outline-none" id="user-menu" aria-expanded="false" aria-haspopup="true">
                <span class="sr-only">Open user menu</span>
                <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                  {{ userInitials }}
                </div>
              </button>
            </div>

            <!-- Dropdown menu, show/hide based on isMenuOpen state -->
            <div v-show="isMenuOpen" class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
              <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">โปรไฟล์</NuxtLink>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">การตั้งค่า</a>
              <a href="#" @click.prevent="logout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">ออกจากระบบ</a>
            </div>
          </div>

          <!-- Login button when not logged in -->
          <div v-else>
            <NuxtLink to="/login" class="btn btn-primary">
              เข้าสู่ระบบ
            </NuxtLink>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="flex items-center sm:hidden">
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500" aria-controls="mobile-menu" aria-expanded="false">
            <span class="sr-only">Open main menu</span>
            <Icon name="heroicons:bars-3" v-if="!isMobileMenuOpen" class="block h-6 w-6" />
            <Icon name="heroicons:x-mark" v-else class="block h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on isMobileMenuOpen state -->
    <div v-show="isMobileMenuOpen" class="sm:hidden" id="mobile-menu">
      <div class="pt-2 pb-3 space-y-1" v-if="isLoggedIn">
        <NuxtLink to="/"
                  class="text-gray-600 hover:bg-gray-50 hover:border-primary-500 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                  :class="{ 'bg-primary-50 border-primary-500 text-primary-700': route.path === '/' }">
          แดชบอร์ด
        </NuxtLink>

        <NuxtLink to="/scan"
                  class="text-gray-600 hover:bg-gray-50 hover:border-primary-500 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                  :class="{ 'bg-primary-50 border-primary-500 text-primary-700': route.path.startsWith('/scan') }">
          สแกนใหม่
        </NuxtLink>

        <div v-if="isLoggedIn" class="border-t border-gray-200 pt-4 pb-3">
          <div class="flex items-center px-4">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                {{ userInitials }}
              </div>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-gray-800">{{ username }}</div>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <NuxtLink to="/profile" class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
              โปรไฟล์
            </NuxtLink>
            <a href="#" class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
              การตั้งค่า
            </a>
            <a href="#" @click.prevent="logout" class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
              ออกจากระบบ
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// State for mobile and desktop menu
const isMobileMenuOpen = ref(false);
const isMenuOpen = ref(false);

// Check if user is logged in
const isLoggedIn = ref(false);
const username = ref('');

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (isMenuOpen.value && !target.closest('#user-menu')) {
      isMenuOpen.value = false;
    }
  });

  // Check if token exists in localStorage
  checkLoginStatus();
});

// Close mobile menu when route changes
watch(() => route.path, () => {
  isMobileMenuOpen.value = false;
});

// Get user initials
const userInitials = computed(() => {
  if (!username.value) return 'U';
  return username.value.substring(0, 2).toUpperCase();
});

// Check if user is logged in
function checkLoginStatus() {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;

  if (isLoggedIn.value) {
    // You can get the username from storage or decode JWT token
    // This is a simplified example
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        username.value = userData.username || 'User';
      } catch (e) {
        username.value = 'User';
      }
    } else {
      username.value = 'User';
    }
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  isLoggedIn.value = false;
  router.push('/login');
}
</script>