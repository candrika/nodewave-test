import { Queue, QueueScheduler } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
})

export const queue = new Queue("file-processing-queue", { connection });
new QueueScheduler("file-processing-queue", { connection });
