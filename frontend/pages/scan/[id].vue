<template>
  <div>
    <div class="flex justify-between items-center mb-6 flex-wrap gap-2">
      <div class="flex items-center">
        <NuxtLink to="/" class="mr-3 btn btn-secondary inline-flex items-center">
          <Icon name="heroicons:arrow-left" class="mr-1 h-4 w-4" />
          กลับ
        </NuxtLink>
        <h1 class="text-2xl font-semibold">ผลการสแกน API</h1>
      </div>

      <div class="flex space-x-2">
        <button
            v-if="scanResult && scanResult.status === 'COMPLETED'"
            @click="handleDownload"
            class="btn btn-primary inline-flex items-center"
            :disabled="downloading"
        >
          <Icon name="heroicons:document-arrow-down" class="mr-1 h-4 w-4" />
          {{ downloading ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด' }}
        </button>

        <div class="relative">
          <button
              @click="isMenuOpen = !isMenuOpen"
              class="btn btn-secondary inline-flex items-center"
          >
            <Icon name="heroicons:ellipsis-vertical" class="h-4 w-4" />
          </button>

          <!-- Dropdown menu -->
          <div
              v-if="isMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
          >
            <button
                @click="handleRefresh"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                :disabled="loading"
            >
              <span class="inline-flex items-center">
                <Icon name="heroicons:arrow-path" class="mr-2 h-4 w-4" />
                รีเฟรชข้อมูล
              </span>
            </button>

            <button
                v-if="isInProgress"
                @click="handleCancel"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                :disabled="cancelling"
            >
              <span class="inline-flex items-center">
                <Icon name="heroicons:x-mark" class="mr-2 h-4 w-4" />
                ยกเลิกการสแกน
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading && !scanResult" class="flex justify-center items-center" style="height: 50vh;">
      <div class="flex flex-col items-center">
        <div class="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <p class="mt-4 text-gray-600">กำลังโหลดผลการสแกน...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex justify-center items-center" style="height: 50vh;">
      <div class="text-center">
        <Icon name="heroicons:exclamation-circle" class="h-12 w-12 text-red-500 mb-2" />
        <h2 class="text-lg font-medium text-red-600 mb-2">เกิดข้อผิดพลาด</h2>
        <p class="text-gray-600">{{ error }}</p>
        <button @click="handleRefresh" class="btn btn-primary mt-4">
          ลองอีกครั้ง
        </button>
      </div>
    </div>

    <!-- Scan result -->
    <template v-else-if="scanResult">
      <!-- Scan info -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="mb-4">
              <div class="text-sm font-medium text-gray-500">รหัสการสแกน:</div>
              <div>{{ scanId }}</div>
            </div>

            <div class="mb-4">
              <div class="text-sm font-medium text-gray-500">API URL:</div>
              <div class="truncate">{{ scanResult.baseUrl || '-' }}</div>
            </div>

            <div>
              <div class="text-sm font-medium text-gray-500">Swagger URL:</div>
              <div class="truncate">{{ scanResult.apiJsonUrl || '-' }}</div>
            </div>
          </div>

          <div>
            <div class="mb-4">
              <div class="text-sm font-medium text-gray-500">สถานะ:</div>
              <div>
                <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="`bg-${getScanStatusColor(scanResult.status)}-100 text-${getScanStatusColor(scanResult.status)}-800`"
                >
                  {{ formatScanStatus(scanResult.status) }}
                </span>
              </div>
            </div>

            <div class="mb-4">
              <div class="text-sm font-medium text-gray-500">เริ่มต้นเมื่อ:</div>
              <div>{{ formatDate(scanResult.startedAt) }}</div>
            </div>

            <div>
              <div class="text-sm font-medium text-gray-500">เสร็จสิ้นเมื่อ:</div>
              <div>{{ formatDate(scanResult.completedAt) }}</div>
            </div>
          </div>
        </div>

        <!-- Progress bar for in-progress scans -->
        <div v-if="isInProgress" class="mt-6">
          <div class="text-sm font-medium text-gray-500 mb-2">กำลังดำเนินการสแกน...</div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 rounded-full animate-pulse-slow"></div>
          </div>
        </div>
      </div>

      <!-- Scan results (when completed) -->
      <template v-if="scanResult.status === 'COMPLETED'">
        <!-- Summary stats -->
        <h2 class="text-xl font-semibold mt-8 mb-4">สรุปผลการสแกน</h2>

        <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
          <div class="bg-white p-4 shadow rounded-lg border-t-4 border-purple-400">
            <div class="text-sm text-gray-500 truncate">Critical</div>
            <div class="mt-1 text-2xl font-semibold text-purple-600">{{ vulnCounts.critical }}</div>
            <div class="text-xs text-gray-500 mt-1">รายการ</div>
          </div>

          <div class="bg-white p-4 shadow rounded-lg border-t-4 border-red-400">
            <div class="text-sm text-gray-500 truncate">High</div>
            <div class="mt-1 text-2xl font-semibold text-red-600">{{ vulnCounts.high }}</div>
            <div class="text-xs text-gray-500 mt-1">รายการ</div>
          </div>

          <div class="bg-white p-4 shadow rounded-lg border-t-4 border-orange-400">
            <div class="text-sm text-gray-500 truncate">Medium</div>
            <div class="mt-1 text-2xl font-semibold text-orange-600">{{ vulnCounts.medium }}</div>
            <div class="text-xs text-gray-500 mt-1">รายการ</div>
          </div>

          <div class="bg-white p-4 shadow rounded-lg border-t-4 border-yellow-400">
            <div class="text-sm text-gray-500 truncate">Low</div>
            <div class="mt-1 text-2xl font-semibold text-yellow-600">{{ vulnCounts.low }}</div>
            <div class="text-xs text-gray-500 mt-1">รายการ</div>
          </div>

          <div class="bg-white p-4 shadow rounded-lg border-t-4 border-blue-400">
            <div class="text-sm text-gray-500 truncate">Info</div>
            <div class="mt-1 text-2xl font-semibold text-blue-600">{{ vulnCounts.info }}</div>
            <div class="text-xs text-gray-500 mt-1">รายการ</div>
          </div>
        </div>

        <!-- Vulnerabilities list -->
        <h2 class="text-xl font-semibold mt-8 mb-4">
          รายละเอียดช่องโหว่ที่พบ ({{ scanResult.vulnerabilities.length }})
        </h2>

        <div v-if="scanResult.vulnerabilities.length === 0" class="bg-green-50 p-6 rounded-md text-center">
          <Icon name="heroicons:check-circle" class="h-12 w-12 text-green-500 mb-2 mx-auto" />
          <h3 class="text-lg font-medium text-green-700">ไม่พบช่องโหว่ด้านความปลอดภัย</h3>
          <p class="mt-2 text-green-600">API ของคุณไม่มีช่องโหว่ที่ตรวจพบตามมาตรฐาน OWASP</p>
        </div>

        <div v-else>
          <VulnerabilityCard
              v-for="(vuln, index) in scanResult.vulnerabilities"
              :key="index"
              :vulnerability="vuln"
              :index="index"
          />
        </div>
      </template>

      <!-- Failed scan results -->
      <div v-else-if="scanResult.status === 'FAILED'" class="bg-red-50 p-6 rounded-md mt-6">
        <h2 class="text-lg font-semibold text-red-700 mb-2">การสแกนล้มเหลว</h2>
        <p class="text-red-600">{{ scanResult.message }}</p>
        <NuxtLink to="/scan" class="btn btn-primary mt-4 inline-block">
          ลองใหม่อีกครั้ง
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { ScanResponse, Vulnerability } from '~/types';
import { formatDate, formatScanStatus, getScanStatusColor } from '~/utils/formatters';

// Define middleware
definePageMeta({
  // middleware: 'auth',
});

// Route
const route = useRoute();
const scanId = computed(() => route.params.id as string);

// State
const scanResult = ref<ScanResponse | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const downloading = ref<boolean>(false);
const cancelling = ref<boolean>(false);
const isMenuOpen = ref<boolean>(false);
const pollingInterval = ref<NodeJS.Timeout | null>(null);

// Computed properties
const isInProgress = computed(() => {
  return scanResult.value?.status === 'PENDING' || scanResult.value?.status === 'IN_PROGRESS';
});

// Count vulnerabilities by risk
const vulnCounts = computed(() => {
  if (!scanResult.value || !scanResult.value.vulnerabilities) {
    return { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  }

  return scanResult.value.vulnerabilities.reduce(
      (counts, vuln) => {
        const risk = vuln.risk.toLowerCase();
        if (risk === 'critical') counts.critical++;
        else if (risk === 'high') counts.high++;
        else if (risk === 'medium') counts.medium++;
        else if (risk === 'low') counts.low++;
        else if (risk === 'informational') counts.info++;
        return counts;
      },
      { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  );
});

// Get scan API service
const scanApi = useScanApi();

// Fetch scan data
const fetchScanData = async () => {
  if (!scanId.value) {
    error.value = 'ไม่พบรหัสการสแกน';
    loading.value = false;
    return;
  }

  try {
    const data = await scanApi.getScanById(scanId.value);
    scanResult.value = data;

    // Set up polling if scan is in progress
    if (isInProgress.value) {
      startPolling();
    } else {
      stopPolling();
    }
  } catch (err) {
    if (typeof err === 'string') {
      error.value = err;
    } else {
      error.value = 'เกิดข้อผิดพลาดในการดึงข้อมูลผลการสแกน';
    }
  } finally {
    loading.value = false;
  }
};

// Start polling for updates
const startPolling = () => {
  stopPolling(); // Clear any existing interval first
  pollingInterval.value = setInterval(fetchScanData, 5000);
};

// Stop polling
const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
};

// Handle refresh button
const handleRefresh = () => {
  loading.value = true;
  isMenuOpen.value = false;
  fetchScanData();
};

// Handle download report
const handleDownload = async () => {
  if (!scanId.value) return;

  downloading.value = true;
  isMenuOpen.value = false;

  try {
    await scanApi.downloadReport(scanId.value);
  } catch (err) {
    // Error handling is done in the composable
  } finally {
    downloading.value = false;
  }
};

// Handle cancel scan
const handleCancel = async () => {
  if (!scanId.value) return;

  cancelling.value = true;
  isMenuOpen.value = false;

  try {
    await scanApi.cancelScan(scanId.value);
    // Refresh data after cancellation
    await fetchScanData();
  } catch (err) {
    // Error handling is done in the composable
  } finally {
    cancelling.value = false;
  }
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (isMenuOpen.value && !target.closest('.relative')) {
    isMenuOpen.value = false;
  }
};

// Setup and cleanup
onMounted(() => {
  fetchScanData();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  stopPolling();
  document.removeEventListener('click', handleClickOutside);
});
</script>