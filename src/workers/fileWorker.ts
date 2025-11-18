import {Worker} from 'bullmq'
import IORedis from 'redis'
import {prisma} from '../prisma'
import {logJob} from '../utils/logger'
import {processExcelFileStreaming} from '../utils/excelProcessor'

const connection = new IORedis({
    host:process.env.REDIS_HOST,
    port:(process.env.REDIS_PORT || 6379)
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
})

const worker=new Worker(
    "file-processing",
    async job =>{
        const {fileId, path} = job.data;
        await logJob(fileId, "START","Worker started")

        try{
            const total = await processExcelFileStreaming(fileId, path)

            await prisma.file.update({
                where:{id:fileId},
                data:{status:"SUCCESS", message:`Inserted ${total} rows`}
            })

            await logJob(fileId, "SUCCESS", `Processed ${total} rows`)
        }catch(err:any){
            await prisma.file.update({
                where:{id:fileId},
                data:{status:"FAILED",message:err.message}
            })

            await logJob(fileId, "FAILED", err.message)
            throw err;
        }
    },
    {connection}
);

worker.on("failed",async(job, err)=>{
    await prisma.file.update({
        where:{id:job!.data.fileId},
        data:{retryCount:{increment:1}}
    })

    await logJob(job!.data.fileId,"RETRY", "Auto retry triggered")
})