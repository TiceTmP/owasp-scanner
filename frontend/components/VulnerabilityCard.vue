<template>
  <div class="border rounded-md mb-4 overflow-hidden">
    <!-- Header -->
    <div
        @click="isOpen = !isOpen"
        class="flex items-center justify-between p-4 cursor-pointer"
        :class="[isOpen ? 'bg-gray-50' : 'bg-white']"
    >
      <div class="flex items-center">
        <div
            class="px-2 py-1 text-xs font-medium rounded-md mr-3"
            :class="getRiskColorClass(vulnerability.risk)"
        >
          {{ vulnerability.risk }}
        </div>
        <h3 class="font-semibold">{{ vulnerability.name }}</h3>
      </div>
      <Icon
          :name="isOpen ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
          class="h-5 w-5 text-gray-500"
      />
    </div>

    <!-- Content (expandable) -->
    <div v-if="isOpen" class="p-4 border-t border-gray-200 bg-white">
      <!-- Badge section -->
      <div class="flex flex-wrap gap-2 mb-4">
        <span class="px-2 py-1 text-xs font-medium rounded-md" :class="getConfidenceColorClass(vulnerability.confidence)">
          ความเชื่อมั่น: {{ vulnerability.confidence }}
        </span>

        <span v-if="vulnerability.cweid" class="px-2 py-1 text-xs font-medium rounded-md bg-purple-100 text-purple-800">
          CWE-{{ vulnerability.cweid }}
        </span>

        <span v-if="vulnerability.wascid" class="px-2 py-1 text-xs font-medium rounded-md bg-teal-100 text-teal-800">
          WASC-{{ vulnerability.wascid }}
        </span>
      </div>

      <!-- URL and Parameter -->
      <div class="mb-4">
        <h4 class="font-bold mt-4 text-sm">URL ที่พบช่องโหว่:</h4>
        <code class="block bg-gray-100 p-2 mt-1 rounded text-sm break-all">{{ vulnerability.url }}</code>

        <div v-if="vulnerability.parameter">
          <h4 class="font-bold mt-4 text-sm">พารามิเตอร์:</h4>
          <p class="mt-1">{{ vulnerability.parameter }}</p>
        </div>
      </div>

      <!-- Description -->
      <div class="mb-4">
        <h4 class="font-bold mt-4 text-sm">คำอธิบาย:</h4>
        <p class="mt-1">{{ vulnerability.description }}</p>
      </div>

      <!-- Evidence -->
      <div v-if="vulnerability.evidence" class="mb-4">
        <h4 class="font-bold mt-4 text-sm">หลักฐาน:</h4>
        <div class="bg-gray-100 p-3 rounded mt-1 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
          {{ vulnerability.evidence }}
        </div>
      </div>

      <!-- Solution -->
      <div class="mb-4 pt-4 border-t border-gray-200">
        <h4 class="font-bold text-sm">วิธีการแก้ไข:</h4>
        <p class="mt-1">{{ vulnerability.solution }}</p>
      </div>

      <!-- References -->
      <div v-if="vulnerability.reference" class="mt-4">
        <h4 class="font-bold text-sm">ข้อมูลอ้างอิง:</h4>
        <div v-for="(ref, i) in referenceList" :key="i" class="mt-1">
          <a
              v-if="isUrl(ref)"
              :href="ref"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline inline-flex items-center"
          >
            {{ ref }}
            <Icon name="heroicons:arrow-top-right-on-square" class="ml-1 h-3 w-3" />
          </a>
          <p v-else>{{ ref }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Vulnerability } from '~/types';

const props = defineProps<{
  vulnerability: Vulnerability;
  index: number;
}>();

// State for expansion
const isOpen = ref(false);

// Convert reference string to list
const referenceList = computed(() => {
  if (!props.vulnerability.reference) return [];
  return props.vulnerability.reference.split('\n').map(ref => ref.trim()).filter(ref => ref);
});

// Check if a string is a URL
function isUrl(str: string): boolean {
  return /^https?:\/\//.test(str);
}

// Get color classes for risk levels
function getRiskColorClass(risk: string): string {
  const riskLower = risk.toLowerCase();
  switch (riskLower) {
    case 'critical':
      return 'bg-purple-100 text-purple-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-orange-100 text-orange-800';
    case 'low':
      return 'bg-yellow-100 text-yellow-800';
    case 'informational':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Get color classes for confidence levels
function getConfidenceColorClass(confidence: string): string {
  const confidenceLower = confidence.toLowerCase();
  switch (confidenceLower) {
    case 'high':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-blue-100 text-blue-800';
    case 'low':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
</script>