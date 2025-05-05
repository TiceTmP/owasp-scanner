<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
    <div class="bg-white p-4 shadow rounded-lg border-t-4 border-blue-400">
      <div class="text-sm text-gray-500 truncate">
        การสแกนทั้งหมด
      </div>
      <div class="mt-1 text-2xl font-semibold text-gray-900">
        <div v-if="loading" class="h-6 w-10 bg-gray-200 animate-pulse rounded"></div>
        <div v-else>{{ stats.totalScans }}</div>
      </div>
      <div class="text-xs text-gray-500 mt-1">
        ครั้ง
      </div>
    </div>

    <div class="bg-white p-4 shadow rounded-lg border-t-4 border-green-400">
      <div class="text-sm text-gray-500 truncate">
        สแกนสำเร็จ
      </div>
      <div class="mt-1 text-2xl font-semibold text-gray-900">
        <div v-if="loading" class="h-6 w-10 bg-gray-200 animate-pulse rounded"></div>
        <div v-else>{{ stats.completedScans }}</div>
      </div>
      <div class="text-xs text-gray-500 mt-1">
        ครั้ง
      </div>
    </div>

    <div class="bg-white p-4 shadow rounded-lg border-t-4 border-red-400">
      <div class="text-sm text-gray-500 truncate">
        สแกนล้มเหลว
      </div>
      <div class="mt-1 text-2xl font-semibold text-gray-900">
        <div v-if="loading" class="h-6 w-10 bg-gray-200 animate-pulse rounded"></div>
        <div v-else>{{ stats.failedScans }}</div>
      </div>
      <div class="text-xs text-gray-500 mt-1">
        ครั้ง
      </div>
    </div>

    <div class="bg-white p-4 shadow rounded-lg border-t-4 border-orange-400">
      <div class="text-sm text-gray-500 truncate">
        ช่องโหว่ที่ตรวจพบทั้งหมด
      </div>
      <div class="mt-1 text-2xl font-semibold text-gray-900">
        <div v-if="loading" class="h-6 w-10 bg-gray-200 animate-pulse rounded"></div>
        <div v-else>{{ stats.totalVulnerabilities }}</div>
      </div>
      <div class="text-xs text-gray-500 mt-1">
        รายการ
      </div>
    </div>

    <div class="bg-white p-4 shadow rounded-lg border-t-4 border-yellow-400">
      <div class="text-sm text-gray-500 truncate">
        ความเสี่ยงสูง
      </div>
      <div class="mt-1 text-2xl font-semibold text-gray-900">
        <div v-if="loading" class="h-6 w-10 bg-gray-200 animate-pulse rounded"></div>
        <div v-else>{{ stats.criticalVulnerabilities + stats.highVulnerabilities }}</div>
      </div>
      <div class="text-xs text-gray-500 mt-1">
        รายการ
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ApiStats } from '~/types';

// Props
interface Props {
  stats?: ApiStats;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  stats: () => ({
    totalScans: 0,
    completedScans: 0,
    failedScans: 0,
    totalVulnerabilities: 0,
    criticalVulnerabilities: 0,
    highVulnerabilities: 0,
    mediumVulnerabilities: 0,
    lowVulnerabilities: 0,
    mostCommonVulnerabilities: []
  })
});

// Use provided stats
const stats = computed(() => props.stats);
const loading = computed(() => props.loading);
</script>