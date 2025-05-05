<template>
  <div>
    <AppHeader />
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
    <footer class="bg-white mt-auto py-4 text-center text-gray-500 text-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        OWASP API Scanner &copy; {{ new Date().getFullYear() }}
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Default layout with header and footer
</script>