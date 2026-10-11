import fs from "fs";
import path from "path";
import { logger } from "../lib/logger";

export interface S3UploadResult {
  bucket: string;
  key: string;
  url: string;
  recordCount: number;
  timestamp: string;
}

export class S3StorageService {
  private bucket: string;
  private region: string;
  private localStorageDir: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || "jetfreight-rates-archive";
    this.region = process.env.AWS_REGION || "ap-south-1";
    // For local resilience and offline environments, maintain persistent local S3 mirror
    this.localStorageDir = path.resolve(process.cwd(), "storage/s3-archive");
    if (!fs.existsSync(this.localStorageDir)) {
      fs.mkdirSync(this.localStorageDir, { recursive: true });
    }
  }

  /**
   * Uploads consolidated CSV to S3 (and archives locally for offline zero-latency fallback)
   */
  async uploadConsolidatedRatesCsv(csvBufferOrString: Buffer | string, fileName?: string): Promise<S3UploadResult> {
    const timestamp = new Date().toISOString();
    const datePrefix = new Date().toISOString().split("T")[0];
    const safeFileName = path.basename(fileName || "CONSOLIDATED_AIR_FREIGHT_RATES.csv").replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `rates/consolidated/${datePrefix}/${safeFileName}`;

    // 1. Save to local storage archive mirror
    const localTargetDir = path.dirname(path.join(this.localStorageDir, key));
    const normalizedTarget = path.resolve(this.localStorageDir, key);
    if (!normalizedTarget.startsWith(path.resolve(this.localStorageDir))) {
      throw new Error("Invalid destination path: Path traversal detected");
    }
    if (!fs.existsSync(localTargetDir)) {
      fs.mkdirSync(localTargetDir, { recursive: true });
    }
    const localFilePath = path.join(this.localStorageDir, key);
    fs.writeFileSync(localFilePath, csvBufferOrString);
    logger.info({ key, localFilePath }, "Saved rate archive to local mirror");

    // 2. Count records from CSV
    const content = typeof csvBufferOrString === "string" ? csvBufferOrString : csvBufferOrString.toString("utf-8");
    const recordCount = Math.max(0, content.trim().split("\n").length - 1);

    // 3. Cloud / Floci S3 Upload if AWS_ENDPOINT_URL or AWS credentials configured
    const s3Endpoint = process.env.AWS_ENDPOINT_URL || "http://localhost:4566";
    let s3Url = `${s3Endpoint}/${this.bucket}/${key}`;
    try {
      // Direct REST upload to Floci S3 emulator or AWS S3 endpoint
      const uploadUrl = `${s3Endpoint}/${this.bucket}/${key}`;
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "text/csv",
        },
        body: csvBufferOrString,
      });

      if (response.ok) {
        logger.info({ bucket: this.bucket, key, s3Endpoint }, "Successfully synced consolidated rate sheet to S3 (Floci)");
      } else {
        logger.warn({ status: response.status, statusText: response.statusText }, "S3 endpoint returned non-200, relying on local mirror");
      }
    } catch (err: any) {
      logger.warn({ err: err.message }, "S3 endpoint unreachable, fallback to persistent local archive");
    }

    return {
      bucket: this.bucket,
      key,
      url: s3Url,
      recordCount,
      timestamp,
    };
  }

  /**
   * Retrieves the latest consolidated rates CSV
   */
  getLatestConsolidatedCsv(): string | null {
    const candidatePaths = [
      path.resolve(process.cwd(), "data/CONSOLIDATED_AIR_FREIGHT_RATES.csv"),
      path.resolve(process.cwd(), "server/data/CONSOLIDATED_AIR_FREIGHT_RATES.csv"),
      path.resolve(process.cwd(), "RATE_SHEET/CONSOLIDATED_AIR_FREIGHT_RATES.csv"),
      path.resolve(process.cwd(), "../../RATE_SHEET/CONSOLIDATED_AIR_FREIGHT_RATES.csv"),
      path.resolve(process.cwd(), "../RATE_SHEET/CONSOLIDATED_AIR_FREIGHT_RATES.csv"),
    ];
    const defaultCsvPath = candidatePaths.find((p) => fs.existsSync(p));
    if (defaultCsvPath && fs.existsSync(defaultCsvPath)) {
      return fs.readFileSync(defaultCsvPath, "utf-8");
    }
    return null;
  }
}

export const s3StorageService = new S3StorageService();
