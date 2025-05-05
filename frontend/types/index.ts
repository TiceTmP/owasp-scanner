// คำขอสแกน API
export interface ScanRequest {
    // URL ของเอกสาร Swagger/OpenAPI JSON
    apiJsonUrl: string;

    // URL หลักของ API ที่ต้องการสแกน
    baseUrl: string;

    // ระดับความเสี่ยงขั้นต่ำที่ต้องการรายงาน (ตัวเลือก)
    minimumRiskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';

    // ตัวเลือกการสแกนเพิ่มเติม (ตัวเลือก)
    options?: {
        // เปิดใช้งานการสแกนเชิงรุก (Active Scanning)
        enableActiveScan?: boolean;

        // เปิดใช้งานการสแกนเชิงรับ (Passive Scanning)
        enablePassiveScan?: boolean;

        // จำนวนคำขอสูงสุดต่อวินาที (จำกัดการใช้ทรัพยากร)
        maxRequestsPerSecond?: number;

        // เวลาหมดเวลาสูงสุดสำหรับคำขอการสแกน (มิลลิวินาที)
        requestTimeout?: number;
    };
}

// ผลลัพธ์การสแกน API
export interface ScanResponse {
    // รหัสการสแกน (UUID)
    scanId: string;

    // สถานะการสแกน
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

    // ข้อความสถานะหรือข้อผิดพลาด
    message: string;

    // URL ของเอกสาร Swagger/OpenAPI JSON
    apiJsonUrl?: string;

    // URL หลักของ API ที่ต้องการสแกน
    baseUrl?: string;

    // เวลาที่เริ่มต้นการสแกน
    startedAt?: string | Date;

    // เวลาที่สแกนเสร็จสิ้น
    completedAt: string | Date | null;

    // รายการช่องโหว่ที่พบ
    vulnerabilities: Vulnerability[];
}

// ข้อมูลช่องโหว่
export interface Vulnerability {
    // ระดับความเสี่ยง (Low, Medium, High, Critical)
    risk: string;

    // ระดับความเชื่อมั่นในการตรวจพบ (Low, Medium, High)
    confidence: string;

    // ชื่อช่องโหว่
    name: string;

    // คำอธิบายช่องโหว่
    description: string;

    // วิธีแก้ไขช่องโหว่
    solution: string;

    // ข้อมูลอ้างอิงหรือลิงก์ที่เกี่ยวข้อง
    reference: string;

    // URL ที่พบช่องโหว่
    url: string;

    // พารามิเตอร์ที่มีปัญหา
    parameter: string;

    // หลักฐานของช่องโหว่ (ตัวอย่างของโค้ดหรือคำขอที่มีปัญหา)
    evidence: string;

    // รหัส CWE (Common Weakness Enumeration)
    cweid: string;

    // รหัส WASC (Web Application Security Consortium)
    wascid: string;
}

// ข้อมูลผู้ใช้
export interface User {
    id: string;
    username: string;
    email?: string;
    role: 'admin' | 'user';
    firstName?: string;
    lastName?: string;
    createdAt: string | Date;
}

// ข้อมูลการลงชื่อเข้าใช้
export interface LoginResponse {
    token: string;
    expiresIn: number;
    user: User;
}

// ข้อมูลสรุปการทำงาน API
export interface ApiStats {
    totalScans: number;
    completedScans: number;
    failedScans: number;
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    mostCommonVulnerabilities: {
        name: string;
        count: number;
    }[];
}