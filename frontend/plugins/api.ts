import axios from 'axios';

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();

    // สร้าง instance ของ axios
    const api = axios.create({
        baseURL: config.public.apiBase,
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 30000,
    });

    // Interceptor สำหรับคำขอ (request)
    api.interceptors.request.use((config) => {
        // ดึง token จาก localStorage
        const token = localStorage.getItem('token');

        // แนบ token ในส่วน headers ถ้ามี
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    });

    // Interceptor สำหรับการตอบกลับ (response)
    api.interceptors.response.use(
        (response) => {
            // ส่งคืนข้อมูลปกติ
            return response;
        },
        (error) => {
            // จัดการกับข้อผิดพลาด

            // ถ้าเป็นข้อผิดพลาด 401 (Unauthorized) - token หมดอายุหรือไม่ถูกต้อง
            if (error.response && error.response.status === 401) {
                // ลบ token และนำทางกลับไปที่หน้าเข้าสู่ระบบ
                localStorage.removeItem('token');
                navigateTo('/login');
            }

            // ส่งคืนข้อผิดพลาดเพื่อให้ส่วนอื่นๆ จัดการต่อ
            return Promise.reject(error);
        }
    );

    // เพิ่ม API เป็น property ให้กับ nuxt app
    return {
        provide: {
            api
        }
    };
});