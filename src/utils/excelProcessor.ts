import ExcelJS from "exceljs";
import fs from "fs";
import { prisma } from "../prisma";

export const processExcelFileStreaming = async (
    fileId: string,
    filePath: string
) => {
    if (!fs.existsSync(filePath)) throw new Error("File not found");

    const options = {
        entries: "emit" as const,
        worksheets: "emit" as const,
        sharedStrings: "cache" as const,
        hyperlinks: "emit" as const,
        styles: "ignore" as const,
        richText: 'ignore'
    };

    const workbook = new ExcelJS.stream.xlsx.WorkbookReader(filePath, options);

    let buffer: any[] = [];
    const BATCH = 500;
    let total = 0;

    for await (const worksheet of workbook) {
        let rowIndex = 0;
    
        for await (const row of worksheet) {
            rowIndex++;
        
            if (rowIndex === 1) continue;
        
            const v = row.values as any[];

            buffer.push({
                fileId,
                name:String(v[1] ?? ""),
                email:String(v[2] ?? ""),
                phone:String(v[3] ?? "")
            })

            if(buffer.length >= BATCH){
                await prisma.processedRows.createMany({data:buffer})
                total +=buffer.length
                buffer = [];
            }
        }
    }

    if (buffer.length > 0) {
        await prisma.processedRows.createMany({ data: buffer });
        total += buffer.length;
    }

    return total;
};
