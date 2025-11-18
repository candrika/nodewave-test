import { delay } from 'bullmq'
import {queue} from '../queue/queue'

export const enqueueFileJob = async(fileId:string, path:string)=>{
    await queue.add("process-file",{fileId, path},{
        attempts:3,
        backoff:{type:"exponential",delay:5000}
    })
}