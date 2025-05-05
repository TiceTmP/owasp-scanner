import dayjs from 'dayjs';
import 'dayjs/locale/th';

dayjs.locale('th');

/**
 * จัดรูปแบบวันที่เป็นภาษาไทย
 * @param date วันที่ที่ต้องการจัดรูปแบบ
 * @param format รูปแบบที่ต้องการ (ค่าเริ่มต้น: DD/MM/YYYY HH:mm)
 * @returns วันที่ในรูปแบบที่กำหนด
 */
export function formatDate(date: string | Date | null | undefined, format: string = 'DD/MM/YYYY HH:mm'): string {
    if (!date) return '-';
    return dayjs(date).format(format);
}

/**
 * จัดรูปแบบสถานะการสแกนเป็นภาษาไทย
 * @param status สถานะการสแกน
 * @returns สถานะในรูปแบบภาษาไทย
 */
export function formatScanStatus(status: string): string {
    switch (status) {
        case 'COMPLETED':
            return 'เสร็จสิ้น';
        case 'FAILED':
            return 'ล้มเหลว';
        case 'IN_PROGRESS':
            return 'กำลังดำเนินการ';
        case 'PENDING':
            return 'รอดำเนินการ';
        default:
            return status;
    }
}

/**
 * รับสีของ Tailwind CSS สำหรับสถานะการสแกน
 * @param status สถานะการสแกน
 * @returns ชื่อสีของ Tailwind CSS
 */
export function getScanStatusColor(status: string): string {
    switch (status) {
        case 'COMPLETED':
            return 'green';
        case 'FAILED':
            return 'red';
        case 'IN_PROGRESS':
            return 'blue';
        case 'PENDING':
            return 'gray';
        default:
            return 'gray';
    }
}

/**
 * รับสีของ Tailwind CSS สำหรับระดับความเสี่ยง
 * @param risk ระดับความเสี่ยง
 * @returns ชื่อสีของ Tailwind CSS
 */
export function getRiskColor(risk: string): string {
    const riskLower = risk.toLowerCase();
    switch (riskLower) {
        case 'critical':
            return 'purple';
        case 'high':
            return 'red';
        case 'medium':
            return 'orange';
        case 'low':
            return 'yellow';
        case 'informational':
            return 'blue';
        default:
            return 'gray';
    }
}

/**
 * ย่อข้อความที่ยาวเกินไป
 * @param text ข้อความที่ต้องการย่อ
 * @param maxLength ความยาวสูงสุดที่ต้องการ (ค่าเริ่มต้น: 50)
 * @returns ข้อความที่ถูกย่อ
 */
export function truncateText(text: string, maxLength: number = 50): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * แปลง scanId ให้สั้นลงเพื่อแสดงในตาราง
 * @param scanId รหัสการสแกน
 * @returns รหัสการสแกนที่ถูกย่อ
 */
export function shortenScanId(scanId: string): string {
    if (!scanId) return '';
    if (scanId.length <= 8) return scanId;
    return scanId.substring(0, 8) + '...';
}

/**
 * ตรวจสอบว่าข้อความเป็น URL หรือไม่
 * @param text ข้อความที่ต้องการตรวจสอบ
 * @returns boolean
 */
export function isUrl(text: string): boolean {
    return /^https?:\/\//.test(text);
}

/**
 * จัดรูปแบบจำนวนเป็นสตริงที่มีเครื่องหมายคั่นพัน (,)
 * @param num จำนวนที่ต้องการจัดรูปแบบ
 * @returns สตริงที่มีเครื่องหมายคั่นพัน
 */
export function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}