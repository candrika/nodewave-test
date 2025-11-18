import { Request, Response } from "express";
import { prisma } from "../prisma";
// import { enqueueFileJob } from "../services/enqueueFileJob";
import { logJob } from "../utils/logger";
import { enqueueFileJob } from "../services/fileService";
import { z } from "zod";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const file = await prisma.file.create({
      data: {
        filename: req.file.filename,
        path: req.file.path,
        status: "PENDING",
      },
    });

    await enqueueFileJob(file.id, req.file.path);

    return res.json({ ok: true, file });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
};

export const listFiles = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      status: z.string().optional(),
    });

    const q = schema.parse(req.query);

    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 10);

    const allowed = ["PENDING", "IN_PROGRESS", "SUCCESS", "FAILED"];

    const files = await prisma.file.findMany({
      where: {
        status:
          q.status && allowed.includes(q.status.toUpperCase())
            ? (q.status.toUpperCase() as any)
            : undefined,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return res.json({ ok: true, files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed fetching files" });
  }
};

export const getFile = async (req: Request, res: Response) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
      include: {
        processedRows: true,
        jobLogs: true,
      },
    });

    if (!file) return res.status(404).json({ error: "File not found" });

    res.json({ ok: true, file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed fetching file" });
  }
};

export const retryFile = async (req: Request, res: Response) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
    });

    if (!file) return res.status(404).json({ error: "File not found" });

    if (file.retryCount >= 5)
      return res.status(400).json({ error: "Retry limit reached" });

    await prisma.file.update({
      where: { id: file.id },
      data: {
        status: "PENDING",
        retryCount: { increment: 1 },
      },
    });

    await logJob(file.id, "INFO", "Manual retry triggered");
    await enqueueFileJob(file.id, file.filename);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Retry failed" });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.jobLog.findMany({
      where: { fileId: req.params.id },
      orderBy: { createdAt: "asc" },
    });

    res.json({ ok: true, logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed fetching logs" });
  }
};
