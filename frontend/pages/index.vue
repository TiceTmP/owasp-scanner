<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">แดชบอร์ด OWASP API Scanner</h1>
      <NuxtLink to="/scan" class="btn btn-primary inline-flex items-center">
        <Icon name="heroicons:plus" class="mr-1 h-5 w-5"/>
        สแกนใหม่
      </NuxtLink>
    </div>

    <!-- Statistics Cards -->
    <ScanStats :stats="stats" :loading="loading"/>

    <!-- Recent Scans -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium mb-4">การสแกนล่าสุด</h2>

      <div v-if="loading" class="py-8 flex justify-center">
        <div class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>

      <div v-else-if="recentScans.length === 0" class="text-center py-8">
        <p class="text-lg text-gray-500">ยังไม่มีประวัติการสแกน</p>
        <NuxtLink to="/scan" class="btn btn-primary mt-4 inline-block">
          เริ่มการสแกนแรก
        </NuxtLink>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              รหัสการสแกน
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              สถานะ
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              เริ่มต้น
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              เสร็จสิ้น
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ช่องโหว่
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

            </th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="scan in recentScans" :key="scan.scanId" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-gray-900">{{ shortenScanId(scan.scanId) }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="`bg-${getScanStatusColor(scan.status)}-100 text-${getScanStatusColor(scan.status)}-800`"
                >
                  {{ formatScanStatus(scan.status) }}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(scan.startedAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(scan.completedAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ scan.status === 'COMPLETED' ? scan.vulnerabilities.length : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <NuxtLink :to="`/scan/${scan.scanId}`" class="text-primary-600 hover:text-primary-900">
                ดูรายละเอียด
              </NuxtLink>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {formatDate, formatScanStatus, getScanStatusColor, shortenScanId} from '~/utils/formatters';
import type {ApiStats, ScanResponse} from "~/types";

// Define middleware
definePageMeta({
  // middleware: 'auth',
});

// State
const recentScans = ref<ScanResponse[]>([]);
const stats = ref<ApiStats>({
  totalScans: 0,
  completedScans: 0,
  failedScans: 0,
  totalVulnerabilities: 0,
  criticalVulnerabilities: 0,
  highVulnerabilities: 0,
  mediumVulnerabilities: 0,
  lowVulnerabilities: 0,
  mostCommonVulnerabilities: []
});
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

// Composables
const scanApi = useScanApi();

// Load data
onMounted(async () => {
  try {
    loading.value = true;

    // ดึงประวัติการสแกนล่าสุด
    recentScans.value = await scanApi.getRecentScans();
    calculateStats();
  } catch (err) {
    if (typeof err === 'string') {
      error.value = err;
    } else {
      error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล';
    }

    // ใช้ข้อมูลว่างถ้าเกิดข้อผิดพลาด
    recentScans.value = [];
  } finally {
    loading.value = false;
  }
});

// คำนวณสถิติจากข้อมูลการสแกน
function calculateStats() {
  const completed = recentScans.value.filter(scan => scan.status === 'COMPLETED').length;
  const failed = recentScans.value.filter(scan => scan.status === 'FAILED').length;

  // จำนวนช่องโหว่ทั้งหมด
  let totalVulnerabilities = 0;
  let criticalVulnerabilities = 0;
  let highVulnerabilities = 0;
  let mediumVulnerabilities = 0;
  let lowVulnerabilities = 0;

  // นับช่องโหว่ตามระดับความเสี่ยง
  recentScans.value.forEach(scan => {
    if (scan.vulnerabilities) {
      totalVulnerabilities += scan.vulnerabilities.length;

      scan.vulnerabilities.forEach(vuln => {
        const risk = vuln.risk.toLowerCase();
        if (risk === 'critical') criticalVulnerabilities++;
        else if (risk === 'high') highVulnerabilities++;
        else if (risk === 'medium') mediumVulnerabilities++;
        else if (risk === 'low') lowVulnerabilities++;
      });
    }
  });

  // อัปเดตข้อมูลสถิติ
  stats.value = {
    totalScans: recentScans.value.length,
    completedScans: completed,
    failedScans: failed,
    totalVulnerabilities,
    criticalVulnerabilities,
    highVulnerabilities,
    mediumVulnerabilities,
    lowVulnerabilities,
    mostCommonVulnerabilities: []
  };
}
</script>