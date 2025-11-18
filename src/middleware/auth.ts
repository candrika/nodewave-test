import { error } from "console"
import {Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"

export function authenticate(req:Request, res:Response, next:NextFunction){
    const auth = req.headers.authorization

    if (!auth) return res.status(401).json({error:"Unauthorized"})

    const token = auth.split(" ")[1]

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        (req as any).user = decoded
        next()
    }catch{
        return res.status(401).json({error:"Invalid token"})
    }
}