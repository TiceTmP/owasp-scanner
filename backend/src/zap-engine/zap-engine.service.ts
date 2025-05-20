import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import axios from 'axios';

export enum ScanType {
    ACTIVE = 'active',
    API = 'api',
}

@Injectable()
export class ZapEngineService {
    private readonly logger = new Logger(ZapEngineService.name);
    private readonly zapApiUrl: string;
    private readonly zapApiKey: string;

    constructor(private configService: ConfigService) {
        // อ่านค่า configuration จาก env หรือ config service
        this.zapApiUrl = this.configService.getOrThrow<string>(
            'ZAP_API_URL',
            'http://localhost:9000',
        );
        this.zapApiKey = this.configService.getOrThrow<string>(
            'ZAP_API_KEY',
            'thiskeyforzapbyticetmp',
        );
    }

    /**
     * เริ่มต้น ZAP API
     */
    async initializeZap(): Promise<boolean> {
        try {
            // ตรวจสอบว่า ZAP API พร้อมใช้งานหรือไม่
            const response = await axios.get(
                `${this.zapApiUrl}/JSON/core/view/version/`,
                {
                    params: {apikey: this.zapApiKey},
                },
            );

            this.logger.log(
                `ZAP initialized successfully. Version: ${response.data.version}`,
            );
            return true;
        } catch (error) {
            this.logger.error(`Failed to initialize ZAP: ${error.message}`);
            throw new Error('Failed to initialize ZAP API');
        }
    }

    /**
     * สแกน API โดยตรงจาก OpenAPI specification
     * เพิ่มเมธอดใหม่เพื่อรองรับการสแกน OpenAPI โดยตรง
     */
    async scanApiWithOpenApi(openApiUrl: string): Promise<any[]> {
        try {
            this.logger.log(`Scanning API with OpenAPI definition from ${openApiUrl}`);

            // 1. นำเข้า OpenAPI definition
            await this.importOpenApiDefinition(openApiUrl);

            // 2. เพิ่ม URL เข้าสู่ context
            const baseUrl = this.getBaseUrlFromOpenApiUrl(openApiUrl);
            await this.addUrlToContext(baseUrl);

            // 3. ทำการสแกน API
            const scanId = await this.startApiScan(baseUrl);

            // 4. รอจนกว่าการสแกนจะเสร็จสิ้น
            await this.waitForApiScanCompletion(scanId);

            // 5. ดึงผลลัพธ์ช่องโหว่
            const alerts = await this.getAlerts(baseUrl);

            // 6. แปลงรูปแบบผลลัพธ์ให้เหมาะสม
            return this.transformZapAlerts(alerts);
        } catch (error) {
            this.logger.error(`Error scanning API with OpenAPI: ${error.message}`);
            throw new Error(`Failed to scan API with OpenAPI: ${error.message}`);
        }
    }

    /**
     * ดึง base URL จาก OpenAPI URL
     */
    private getBaseUrlFromOpenApiUrl(openApiUrl: string): string {
        // ตัวอย่างเช่น "http://example:3030/api-docs-json" -> "http://example:3030"
        try {
            const url = new URL(openApiUrl);
            return `${url.protocol}//${url.host}`;
        } catch (error) {
            this.logger.warn(`Failed to parse OpenAPI URL: ${error.message}`);
            // ถ้าไม่สามารถแยก URL ได้ ส่งคืน URL เดิม
            return openApiUrl;
        }
    }

    /**
     * เมธอดหลักสำหรับการสแกน endpoint ด้วย ZAP
     * จะเลือกวิธีการสแกนตามพารามิเตอร์ scanType
     */
    async scanEndpoint(
        url: string,
        method: string,
        parameters: any[],
        openApiUrl?: string,
        scanType: ScanType = ScanType.API, // ค่าเริ่มต้นเป็น API scanner
    ): Promise<any[]> {
        try {
            this.logger.log(`Scanning endpoint ${url} with ${scanType} scan type`);

            let alerts: any[];

            if (scanType === ScanType.API) {
                // ใช้วิธีการสแกนแบบ API โดยใช้ OpenAPI URL ถ้ามี
                if (openApiUrl) {
                    // ถ้ามี OpenAPI URL ใช้มันแทนที่จะใช้ URL endpoint โดยตรง
                    this.logger.log(`Using OpenAPI definition from ${openApiUrl} for scanning ${url}`);
                    await this.importOpenApiDefinition(openApiUrl);
                    alerts = await this.scanApiEndpoint(url, method, parameters);
                } else {
                    // ถ้าไม่มี OpenAPI URL ใช้วิธีเดิม
                    alerts = await this.scanApiEndpoint(url, method, parameters);
                }
            } else {
                // ใช้วิธีการสแกนแบบ Active (แบบเดิม)
                alerts = await this.scanActiveEndpoint(url, method, parameters);
            }

            return alerts;
        } catch (error) {
            this.logger.error(`Error scanning endpoint ${url}: ${error.message}`);
            throw new Error(`Failed to scan endpoint: ${error.message}`);
        }
    }

    /**
     * สแกน endpoint ด้วยวิธี API scanner (สำหรับ OpenAPI/Swagger)
     */
    private async scanApiEndpoint(
        url: string,
        method: string,
        parameters: any[],
    ): Promise<any[]> {
        try {
            // 1. ทำการเพิ่ม URL เข้าไปใน ZAP context
            await this.addUrlToContext(url);

            // 2. ใช้ spider เพื่อสำรวจ endpoints
            await this.spiderApiUrl(url);

            // 3. ทำการสแกน API scan
            const scanId = await this.startApiScan(url);

            // 4. รอให้การสแกนเสร็จสิ้น
            await this.waitForApiScanCompletion(scanId);

            // 5. ดึงผลลัพธ์จากการสแกน
            const alerts = await this.getAlerts(url);

            // 6. แปลงรูปแบบผลลัพธ์ให้เหมาะสมกับการใช้งาน
            return this.transformZapAlerts(alerts);
        } catch (error) {
            this.logger.error(`Error scanning API endpoint ${url}: ${error.message}`);
            throw new Error(`Failed to scan API endpoint: ${error.message}`);
        }
    }

    /**
     * สแกน endpoint ด้วยวิธี Active scanner (วิธีเดิม)
     */
    private async scanActiveEndpoint(
        url: string,
        method: string,
        parameters: any[],
    ): Promise<any[]> {
        try {
            // 1. ทำการเพิ่ม URL เข้าไปใน ZAP context
            await this.addUrlToContext(url);

            // 2. ทำการสแกน active scan
            const scanId = await this.startActiveScan(url);

            // 3. รอให้การสแกนเสร็จสิ้น
            await this.waitForScanCompletion(scanId);

            // 4. ดึงผลลัพธ์จากการสแกน
            const alerts = await this.getAlerts(url);

            // 5. แปลงรูปแบบผลลัพธ์ให้เหมาะสมกับการใช้งาน
            return this.transformZapAlerts(alerts);
        } catch (error) {
            this.logger.error(
                `Error active scanning endpoint ${url}: ${error.message}`,
            );
            throw new Error(`Failed to active scan endpoint: ${error.message}`);
        }
    }

    /**
     * นำเข้า OpenAPI definition
     * ปรับปรุงให้ใช้ format ที่ถูกต้องสำหรับ ZAP API
     */
    private async importOpenApiDefinition(url: string): Promise<void> {
        try {
            this.logger.log(`Importing OpenAPI definition from ${url}`);

            // ใช้ GET request แทน POST และส่ง URL เป็น query parameter
            const response = await axios.get(
                `${this.zapApiUrl}/JSON/openapi/action/importUrl/`,
                {
                    params: {
                        apikey: this.zapApiKey,
                        url: url,
                    },
                },
            );

            if (response.data && response.data.code === 'ok') {
                this.logger.log('OpenAPI definition imported successfully');
            } else {
                this.logger.warn(
                    `OpenAPI import response: ${JSON.stringify(response.data)}`,
                );

                // ลอง validate และแก้ไข OpenAPI data ถ้าจำเป็น
                await this.validateAndFixOpenApi(url);
            }
        } catch (error) {
            this.logger.error(`Error importing OpenAPI definition: ${error.message}`);
            if (error.response) {
                this.logger.error(`Response: ${JSON.stringify(error.response.data)}`);
            }
            throw new Error('Failed to import OpenAPI definition');
        }
    }

    /**
     * ตรวจสอบและแก้ไข OpenAPI spec ถ้าจำเป็น
     */
    private async validateAndFixOpenApi(url: string): Promise<void> {
        try {
            // ดึง OpenAPI spec
            const response = await axios.get(url, {
                headers: {
                    'Accept': 'application/json',
                },
            });

            const openApiData = response.data;

            // ตรวจสอบว่ามีโครงสร้างพื้นฐานที่ถูกต้อง
            if (!openApiData.openapi || !openApiData.paths) {
                this.logger.warn('OpenAPI definition is missing required fields');
                return;
            }

            // ตรวจสอบว่า paths มีโครงสร้างที่ถูกต้อง
            let modified = false;
            const fixedPaths = {};

            for (const path in openApiData.paths) {
                fixedPaths[path] = {};

                for (const method in openApiData.paths[path]) {
                    // ถ้า method data เป็น array แทนที่จะเป็น object ให้แก้ไข
                    if (Array.isArray(openApiData.paths[path][method])) {
                        this.logger.warn(`Fixing array structure for ${method} ${path}`);
                        // ใช้ element แรกของ array (ถ้ามี) หรือสร้าง object ว่าง
                        fixedPaths[path][method] = openApiData.paths[path][method][0] || {};
                        modified = true;
                    } else {
                        fixedPaths[path][method] = openApiData.paths[path][method];
                    }
                }
            }

            if (modified) {
                // สร้าง OpenAPI spec ที่ถูกต้อง
                const fixedOpenApi = {
                    ...openApiData,
                    paths: fixedPaths,
                };

                // ทำการส่ง OpenAPI spec ที่แก้ไขแล้วไปยัง ZAP
                this.logger.log('Importing fixed OpenAPI definition...');
                await this.importOpenApiJson(fixedOpenApi);
            }
        } catch (error) {
            this.logger.error(`Error validating OpenAPI: ${error.message}`);
        }
    }

    /**
     * นำเข้า OpenAPI JSON โดยตรง
     */
    private async importOpenApiJson(openApiJson: any): Promise<void> {
        try {
            // แปลง openApiJson เป็น string
            const jsonString = JSON.stringify(openApiJson);

            // Base64 encode JSON string
            const jsonBase64 = Buffer.from(jsonString).toString('base64');

            // ใช้ API ที่ถูกต้องสำหรับการนำเข้า OpenAPI ที่เป็น string
            const response = await axios.get(
                `${this.zapApiUrl}/JSON/openapi/action/importFile/`,
                {
                    params: {
                        apikey: this.zapApiKey,
                        file: jsonBase64
                    }
                }
            );

            if (response.data && response.data.code === 'ok') {
                this.logger.log('Fixed OpenAPI definition imported successfully');
            } else {
                this.logger.warn(`Fixed OpenAPI import response: ${JSON.stringify(response.data)}`);
            }
        } catch (error) {
            this.logger.error(`Error importing fixed OpenAPI: ${error.message}`);
            if (error.response) {
                this.logger.error(`Response: ${JSON.stringify(error.response.data)}`);
            }
        }
    }

    /**
     * ใช้ Spider เพื่อสำรวจ API endpoints
     */
    private async spiderApiUrl(url: string): Promise<void> {
        try {
            this.logger.log(`Running spider on ${url}`);

            // ใช้ AJAX Spider สำหรับการสำรวจ API endpoints
            const spiderResponse = await axios.get(
                `${this.zapApiUrl}/JSON/ajaxSpider/action/scan/`,
                {
                    params: {
                        apikey: this.zapApiKey,
                        url: url,
                        inScope: 'true',
                        subtreeOnly: 'true',
                    },
                },
            );

            this.logger.log(
                `AJAX Spider started: ${JSON.stringify(spiderResponse.data)}`,
            );

            // รอให้ AJAX Spider เสร็จสิ้น
            let isSpiderRunning = true;
            const maxRetries = 30;
            let retries = 0;

            while (isSpiderRunning && retries < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 5000)); // รอ 5 วินาที

                const statusResponse = await axios.get(
                    `${this.zapApiUrl}/JSON/ajaxSpider/view/status/`,
                    {
                        params: {
                            apikey: this.zapApiKey,
                        },
                    },
                );

                isSpiderRunning = statusResponse.data.status === 'running';
                this.logger.debug(`AJAX Spider status: ${statusResponse.data.status}`);
                retries++;
            }

            if (retries >= maxRetries) {
                this.logger.warn('AJAX Spider timed out');
            } else {
                this.logger.log('AJAX Spider completed');
            }
        } catch (error) {
            this.logger.error(`Error running spider: ${error.message}`);
            // ไม่ throw error เพื่อให้กระบวนการสแกนดำเนินต่อไปได้
        }
    }

    /**
     * เริ่มการสแกนแบบ API
     */
    private async startApiScan(url: string): Promise<string> {
        try {
            this.logger.log(`Starting API scan for ${url}`);

            // ใช้ OpenAPI scan (หรือ API scan ถ้ามี)
            // ถ้า ZAP ไม่มี API scan endpoint โดยตรง สามารถใช้ active scan ได้
            const response = await axios.get(
                `${this.zapApiUrl}/JSON/ascan/action/scan/`,
                {
                    params: {
                        apikey: this.zapApiKey,
                        url: url,
                        recurse: 'true', // สแกน subdirectories ด้วย
                        inScopeOnly: 'true', // สแกนเฉพาะ URLs ที่อยู่ใน scope
                        scanPolicyName: 'API-Minimal', // ใช้ policy สำหรับ API (ถ้ามี)
                    },
                },
            );

            const scanId = response.data.scan;
            this.logger.log(`API scan started with ID: ${scanId}`);

            return scanId;
        } catch (error) {
            this.logger.error(`Error starting API scan: ${error.message}`);
            if (error.response) {
                this.logger.error(`Response: ${JSON.stringify(error.response.data)}`);
            }
            throw new Error('Failed to start API scan');
        }
    }

    /**
     * รอให้การสแกน API เสร็จสิ้น
     */
    private async waitForApiScanCompletion(scanId: string): Promise<void> {
        // ใช้ฟังก์ชันเดียวกับ active scan เนื่องจากใช้ endpoint เดียวกัน
        return this.waitForScanCompletion(scanId);
    }

    /**
     * เพิ่ม URL เข้าไปใน ZAP context
     */
    private async addUrlToContext(url: string): Promise<void> {
        try {
            // ZAP context ชื่อ "API Scan"
            const contextName = 'API Scan';

            // สร้าง context หรือใช้ context ที่มีอยู่แล้ว
            await axios.get(`${this.zapApiUrl}/JSON/context/action/newContext/`, {
                params: {
                    apikey: this.zapApiKey,
                    contextName,
                },
            });

            // เพิ่ม URL เข้าไปใน context
            await axios.get(
                `${this.zapApiUrl}/JSON/context/action/includeInContext/`,
                {
                    params: {
                        apikey: this.zapApiKey,
                        contextName,
                        regex: this.urlToRegex(url),
                    },
                },
            );

            this.logger.log(`Added URL ${url} to context ${contextName}`);
        } catch (error) {
            this.logger.error(`Error adding URL to context: ${error.message}`);
            throw new Error('Failed to add URL to ZAP context');
        }
    }

    /**
     * เริ่มการสแกนแบบ active
     */
    private async startActiveScan(url: string): Promise<string> {
        try {
            const response = await axios.get(
                `${this.zapApiUrl}/JSON/ascan/action/scan/`,
                {
                    params: {
                        apikey: this.zapApiKey,
                        url,
                        recurse: 'false',
                        inScopeOnly: 'true',
                    },
                },
            );

            return response.data.scan;
        } catch (error) {
            this.logger.error(`Error starting active scan: ${error.message}`);
            throw new Error('Failed to start ZAP active scan');
        }
    }

    /**
     * รอให้การสแกนเสร็จสิ้น (polling)
     */
    private async waitForScanCompletion(scanId: string): Promise<void> {
        const maxRetries = 60; // สูงสุด 5 นาที (5 * 60 วินาที)
        const interval = 5000; // 5 วินาที

        let retries = 0;

        while (retries < maxRetries) {
            try {
                const response = await axios.get(
                    `${this.zapApiUrl}/JSON/ascan/view/status/`,
                    {
                        params: {
                            apikey: this.zapApiKey,
                            scanId,
                        },
                    },
                );

                const progress = parseInt(response.data.status);
                this.logger.debug(`Scan progress: ${progress}%`);

                if (progress >= 100) {
                    this.logger.log(`Scan completed: ${scanId}`);
                    return;
                }

                // รอและลองใหม่
                await new Promise((resolve) => setTimeout(resolve, interval));
                retries++;
            } catch (error) {
                this.logger.error(`Error checking scan status: ${error.message}`);
                throw new Error('Failed to check ZAP scan status');
            }
        }

        this.logger.warn(
            `Scan timed out after ${(maxRetries * interval) / 1000} seconds`,
        );
        throw new Error('ZAP scan timed out');
    }

    /**
     * ดึงผลลัพธ์การแจ้งเตือน (alerts) จาก ZAP
     */
    private async getAlerts(url: string): Promise<any[]> {
        try {
            const response = await axios.get(
                `${this.zapApiUrl}/JSON/core/view/alerts/`,
                {
                    params: {
                        apikey: this.zapApiKey,
                        baseurl: url,
                    },
                },
            );

            this.logger.log(
                `Retrieved ${response.data.alerts.length} alerts for ${url}`,
            );
            return response.data.alerts;
        } catch (error) {
            this.logger.error(`Error fetching alerts: ${error.message}`);
            throw new Error('Failed to fetch ZAP alerts');
        }
    }

    /**
     * แปลงรูปแบบ alert จาก ZAP ให้เป็นรูปแบบที่ต้องการ
     */
    private transformZapAlerts(alerts: any[]): any[] {
        return alerts.map((alert) => ({
            risk: alert.risk,
            confidence: alert.confidence,
            name: alert.name,
            description: alert.description,
            solution: alert.solution,
            reference: alert.reference,
            url: alert.url,
            parameter: alert.param,
            evidence: alert.evidence,
            cweid: alert.cweid,
            wascid: alert.wascid,
        }));
    }

    /**
     * แปลง URL เป็น regex pattern สำหรับ ZAP context
     */
    private urlToRegex(url: string): string {
        // ลบ protocol (http:// หรือ https://)
        let pattern = url.replace(/^https?:\/\//, '');

        // Escape special characters
        pattern = pattern.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');

        // เพิ่ม protocol wildcards
        return `https?://${pattern}.*`;
    }
}