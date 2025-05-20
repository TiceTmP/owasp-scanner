import { ref } from 'vue';
import type { ScanRequest, ScanResponse, ApiStats } from '~/types';

export const useScanApi = () => {
    const { $api } = useNuxtApp();
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    // สร้างการสแกนใหม่
    const createScan = async (scanRequest: ScanRequest) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await $api.post<ScanResponse>('/api-scanner', scanRequest);
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเริ่มต้นการสแกน';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    // ดึงผลการสแกนตาม ID
    const getScanById = async (scanId: string) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await $api.get<ScanResponse>(`/api-scanner/${scanId}`);
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงผลการสแกน';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    // ดึงการสแกนล่าสุด
    const getRecentScans = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await $api.get<ScanResponse[]>('/reports/recent');
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงประวัติการสแกน';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    // ยกเลิกการสแกน
    const cancelScan = async (scanId: string) => {
        loading.value = true;
        error.value = null;

        try {
            await $api.post(`/api-scanner/${scanId}/cancel`);
        } catch (err: any) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการยกเลิกการสแกน';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    // ดาวน์โหลดรายงาน PDF
    const downloadReport = async (scanId: string) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await $api.get(`/reports/${scanId}/download`, {
                responseType: 'blob',
            });

            // สร้าง URL สำหรับดาวน์โหลด
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `owasp-scan-report-${scanId}.pdf`);
            document.body.appendChild(link);
            link.click();

            // ทำความสะอาด
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (err: any) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการดาวน์โหลดรายงาน';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    // ดึงข้อมูลสถิติ
    const getApiStats = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await $api.get<ApiStats>('/stats');
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    const createFrontendScan = async (frontendScanRequest: any) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await $api.post<ScanResponse>('/api-scanner/frontend', frontendScanRequest);
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเริ่มต้นการสแกน';
            throw error.value;
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        error,
        createScan,
        getScanById,
        getRecentScans,
        cancelScan,
        downloadReport,
        getApiStats,
        createFrontendScan,
    };
};