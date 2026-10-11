import { pgTable, text, serial, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rateSheetsTable = pgTable("rate_sheets", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  s3Key: text("s3_key").notNull(),
  s3Bucket: text("s3_bucket").notNull(),
  status: text("status").notNull().default("active"),
  recordCount: integer("record_count").notNull().default(0),
  uploadedBy: text("uploaded_by").default("system"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRateSheetSchema = createInsertSchema(rateSheetsTable).omit({ id: true, createdAt: true });
export type InsertRateSheet = z.infer<typeof insertRateSheetSchema>;
export type RateSheet = typeof rateSheetsTable.$inferSelect;

export const airFreightRatesTable = pgTable("air_freight_rates", {
  id: serial("id").primaryKey(),
  sheetId: integer("sheet_id").references(() => rateSheetsTable.id),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  airline: text("airline").notNull(),
  prefix: text("prefix"),
  carrierCode: text("carrier_code").notNull(),
  serviceTier: text("service_tier").notNull(),
  cargoCategory: text("cargo_category").notNull(),
  currency: text("currency").notNull().default("INR"),
  minCharge: numeric("min_charge", { precision: 12, scale: 2 }),
  rateNormal: numeric("rate_normal", { precision: 12, scale: 2 }),
  rate45: numeric("rate_45", { precision: 12, scale: 2 }),
  rate100: numeric("rate_100", { precision: 12, scale: 2 }),
  rate250: numeric("rate_250", { precision: 12, scale: 2 }),
  rate300: numeric("rate_300", { precision: 12, scale: 2 }),
  rate500: numeric("rate_500", { precision: 12, scale: 2 }),
  rate1000: numeric("rate_1000", { precision: 12, scale: 2 }),
  fscPerKg: numeric("fsc_per_kg", { precision: 12, scale: 2 }),
  fscMin: numeric("fsc_min", { precision: 12, scale: 2 }),
  sscPerKg: numeric("ssc_per_kg", { precision: 12, scale: 2 }),
  sscMin: numeric("ssc_min", { precision: 12, scale: 2 }),
  xrayPerKg: numeric("xray_per_kg", { precision: 12, scale: 2 }),
  xrayMin: numeric("xray_min", { precision: 12, scale: 2 }),
  miscPerKg: numeric("misc_per_kg", { precision: 12, scale: 2 }),
  miscMin: numeric("misc_min", { precision: 12, scale: 2 }),
  ctgPerKg: numeric("ctg_per_kg", { precision: 12, scale: 2 }),
  ctgMin: numeric("ctg_min", { precision: 12, scale: 2 }),
  awbFee: numeric("awb_fee", { precision: 12, scale: 2 }),
  amsMawb: numeric("ams_mawb", { precision: 12, scale: 2 }),
  amsHawb: numeric("ams_hawb", { precision: 12, scale: 2 }),
  paymentType: text("payment_type").default("PP"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAirFreightRateSchema = createInsertSchema(airFreightRatesTable).omit({ id: true, createdAt: true });
export type InsertAirFreightRate = z.infer<typeof insertAirFreightRateSchema>;
export type AirFreightRate = typeof airFreightRatesTable.$inferSelect;
