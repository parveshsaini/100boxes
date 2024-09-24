import z from "zod"
import jwt from "jsonwebtoken"
import { Request, Response } from "express"
import prismaClient from "../db/prisma"
import bcrypt from "bcrypt"


export const signupUser = async (req: Request, res: Response) => {

    const signupSchema = z.object({
        email: z.string().email(),
        name: z.string(),
        password: z.string()
    })

    const { email, password, name } = req.body

    const safeParse = signupSchema.safeParse(req.body)

    if(!safeParse.success) {
        throw new Error(`Invalid inputs: ${safeParse.error}`)
    }

    const existingUser= await prismaClient.user.findFirst({
        where: {
            email
        }
    })

    if(existingUser) {
        throw new Error("User already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const avatarUrl= `https://robohash.org/${name}`

    const newUser= await prismaClient.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            imageUrl: avatarUrl,
        }
    })

    const token= jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET!)

    res.status(201).json({
        token,
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            imageUrl: newUser.imageUrl
        }
    })
}

export const loginUser = async(req: Request, res: Response) => {
    
    const loginSchema= z.object({
        email: z.string().email(),
        password: z.string()
    })

    const { email, password } = req.body

    const safeParse= loginSchema.safeParse(req.body)

    if(!safeParse.success) {
        throw new Error(`Invalid inputs: ${safeParse.error}`)
    }

    const user= await prismaClient.user.findFirst({
        where: {
            email
        }
    })

    if(!user) {
        throw new Error("User not found")
    }

    const isPasswordCorrect= await bcrypt.compare(password, user.password)

    if(!isPasswordCorrect) {
        throw new Error("Invalid password")
    }

    const token= jwt.sign({ userId: user.id }, process.env.JWT_SECRET!)

    res.status(200).json({
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            imageUrl: user.imageUrl
        }
    })
}

export const getUser = async (req: Request, res: Response) => {
    const user= await prismaClient.user.findFirst({
        where: {
            //@ts-ignore
            id: req.userId
        }
    })

    if(!user) {
        return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            imageUrl: user.imageUrl
        }
    })
    
}