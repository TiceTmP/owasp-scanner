export enum ScanStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ScanResult {
  scanId: string;
  status: ScanStatus;
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  vulnerabilities: Vulnerability[];
}

export interface Vulnerability {
  risk: string;
  confidence: string;
  name: string;
  description: string;
  solution: string;
  reference: string;
  url: string;
  parameter: string;
  evidence: string;
  cweid: string;
  wascid: string;
}
