import { Request, Response } from "express";
import { rateEngineService } from "../services/rate-engine.service";
import { s3StorageService } from "../services/s3-storage.service";
import { logger } from "../lib/logger";

export async function getRatesQuoteHandler(req: Request, res: Response) {
  try {
    const { origin, destination, weight, volume, pieces, cargoType, pieceLines } = req.body;

    if (!origin || !destination || !weight) {
      return res.status(400).json({ error: "origin, destination and weight are required" });
    }

    const cleanOrigin = String(origin).trim().toUpperCase().slice(0, 5);
    const cleanDestination = String(destination).trim().toUpperCase().slice(0, 5);

    if (cleanOrigin === cleanDestination) {
      return res.status(400).json({ error: "Origin and destination airport codes cannot be identical" });
    }

    const actualWeight = Number(weight);
    if (isNaN(actualWeight) || actualWeight <= 0 || actualWeight > 100000) {
      return res.status(400).json({ error: "Weight must be a positive number up to 100,000 kg" });
    }

    // Calculate volumetric weight: piece lines (L*W*H/6000) or CBM * 167
    let volumetricFromPieces = 0;
    if (Array.isArray(pieceLines) && pieceLines.length > 0) {
      volumetricFromPieces = pieceLines.reduce((acc: number, line: any) => {
        const pLen = Math.max(0, Math.min(Number(line.length) || 0, 1000));
        const pWid = Math.max(0, Math.min(Number(line.width) || 0, 1000));
        const pHgt = Math.max(0, Math.min(Number(line.height) || 0, 1000));
        const pPcs = Math.max(1, Math.min(Number(line.pieces) || 1, 10000));
        const lineVol = ((pLen * pWid * pHgt) / 6000) * pPcs;
        return acc + lineVol;
      }, 0);
    }

    const cleanVolume = Math.max(0, Math.min(Number(volume) || 0, 500));
    const cbmVolumetric = cleanVolume * 167;
    const volumetricWeight = Math.round(Math.max(volumetricFromPieces, cbmVolumetric) * 10) / 10;

    const result = rateEngineService.calculateQuotes({
      origin: cleanOrigin,
      destination: cleanDestination,
      actualWeight,
      volumetricWeight,
      cargoType: typeof cargoType === "string" ? cargoType.slice(0, 50) : "General cargo",
    });

    return res.json({
      origin: cleanOrigin,
      destination: cleanDestination,
      actualWeight,
      volumetricWeight,
      chargeableWeight: result.chargeableWeight,
      rates: result.rates,
    });
  } catch (error: any) {
    logger.error({ error }, "Error calculating rates quote");
    return res.status(500).json({ error: "Internal server error calculating quote" });
  }
}

export async function syncRatesToS3Handler(req: Request, res: Response) {
  try {
    const csvContent = s3StorageService.getLatestConsolidatedCsv();
    if (!csvContent) {
      return res.status(404).json({ error: "No consolidated rates CSV found on server" });
    }

    const uploadResult = await s3StorageService.uploadConsolidatedRatesCsv(csvContent);

    // Reload rates into memory
    rateEngineService.loadRates();

    return res.json({
      success: true,
      s3Key: uploadResult.key,
      s3Bucket: uploadResult.bucket,
      s3Url: uploadResult.url,
      recordCount: uploadResult.recordCount,
      timestamp: uploadResult.timestamp,
    });
  } catch (error: any) {
    logger.error({ error }, "Error syncing rates to S3");
    return res.status(500).json({ error: "Failed to sync rates to S3 storage" });
  }
}
