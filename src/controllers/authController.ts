import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export function login(req: Request, res: Response) {
    const { username, password } = req.body;
    const token = jwt.sign({username}, process.env.JWT_SECRET!, {expiresIn:'1d'})

    res.json({token});
}
