import { prisma } from "../prisma";

export const logJob = async(fileId:string, event:string, message:string)=>{
    await prisma.jobLog.create({
        data:{fileId, event, message}
    })
}