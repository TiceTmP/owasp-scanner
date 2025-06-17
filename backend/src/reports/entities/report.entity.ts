import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ScanStatus,
  Vulnerability,
} from '../../api-scanner/interfaces/scan-result.interface';

@Entity('report')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  scanId: string;

  @Column()
  apiJsonUrl: string;

  @Column()
  baseUrl: string;

  @Column({
    type: 'enum',
    enum: ScanStatus,
    default: 'PENDING',
  })
  status: string;

  @Column({ type: 'json', nullable: true })
  endpoints: any[];

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ type: 'json', default: [] })
  vulnerabilities: Vulnerability[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Optional fields for additional data
   */

  @Column({ nullable: true })
  duration?: number; // Duration in seconds

  @Column({ nullable: true })
  scannerVersion?: string; // Version of ZAP used

  @Column({ type: 'json', nullable: true })
  scanOptions?: {
    enableActiveScan?: boolean;
    enablePassiveScan?: boolean;
    maxRequestsPerSecond?: number;
    requestTimeout?: number;
    minimumRiskLevel?: string;
  };

  @Column({ type: 'json', nullable: true })
  summary?: {
    totalEndpoints: number;
    scannedEndpoints: number;
    totalRequests: number;
    alertsByRisk: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      informational: number;
    };
  };

  @Column({ nullable: true })
  assignedTo?: string; // User ID who is assigned to fix/review these vulnerabilities

  @Column({ nullable: true })
  notes?: string; // Manual notes added to the scan

  @Column({ type: 'json', nullable: true })
  tags?: string[]; // Tags for categorization

  @Column({ nullable: true })
  pdfReportPath?: string; // Path to stored PDF report
}
