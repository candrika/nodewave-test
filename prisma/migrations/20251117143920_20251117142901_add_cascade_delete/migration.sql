-- DropForeignKey
ALTER TABLE "JobLog" DROP CONSTRAINT "JobLog_fileId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessedRows" DROP CONSTRAINT "ProcessedRows_fileId_fkey";

-- AddForeignKey
ALTER TABLE "ProcessedRows" ADD CONSTRAINT "ProcessedRows_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobLog" ADD CONSTRAINT "JobLog_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
