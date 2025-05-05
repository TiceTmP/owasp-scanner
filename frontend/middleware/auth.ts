export default defineNuxtRouteMiddleware((to, from) => {
    // ตรวจสอบว่ามีการเข้าสู่ระบบหรือไม่โดยดู token ใน localStorage
    // หมายเหตุ: ต้องใช้ process.client เพื่อตรวจสอบว่าโค้ดทำงานใน client-side
    if (process.client) {
        const token = localStorage.getItem('token');

        // ถ้าไม่มี token และไม่ได้อยู่ที่หน้า login แล้ว redirect ไปยังหน้า login
        if (!token && to.path !== '/login') {
            return navigateTo('/login');
        }

        // ถ้ามี token แล้วและกำลังจะไปหน้า login ให้ redirect ไปยังหน้าแรก
        if (token && to.path === '/login') {
            return navigateTo('/');
        }
    }
});