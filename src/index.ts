import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import fs from "fs"
import routes from './routes'

dotenv.config()

const app = express()

app.use("/api",routes)
app.use(cors())
app.use(express.json())

if(!fs.existsSync(process.env.FILES_UPLOAD_DIR!)){
    fs.mkdirSync(process.env.FILES_UPLOAD_DIR!,{recursive:true})
}

app.get("/",(req, res)=>res.json({ok:true}))

app.listen(()=>
    console.log(`Server running on port ${process.env.PORT || 4000}`)
)