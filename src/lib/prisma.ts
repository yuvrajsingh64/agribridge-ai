import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function getDatabaseUrl(): string {
  // On Vercel (serverless), we need to copy the SQLite DB to /tmp
  // because the build output filesystem is read-only
  if (process.env.VERCEL) {
    const tmpDbPath = "/tmp/dev.db";
    
    // Copy the DB file to /tmp if it doesn't exist yet
    if (!fs.existsSync(tmpDbPath)) {
      // The DB file is bundled at prisma/dev.db relative to the project root
      const possiblePaths = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(__dirname, "..", "..", "prisma", "dev.db"),
        path.join(__dirname, "..", "prisma", "dev.db"),
      ];

      let copied = false;
      for (const srcPath of possiblePaths) {
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, tmpDbPath);
          copied = true;
          console.log(`[Prisma] Copied SQLite DB from ${srcPath} to ${tmpDbPath}`);
          break;
        }
      }

      if (!copied) {
        console.error("[Prisma] Could not find dev.db to copy. Searched:", possiblePaths);
      }
    }

    return `file:${tmpDbPath}`;
  }

  return process.env.DATABASE_URL || "file:./dev.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasourceUrl: dbUrl,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
