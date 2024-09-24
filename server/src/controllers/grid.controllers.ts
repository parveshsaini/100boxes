import { Request, Response } from "express";
import prismaClient from "../db/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const getGrid = async(req: Request, res: Response) => {
    const grid= await prismaClient.grid.findFirst()

    if(!grid) {
        return res.status(404).json({ message: "Grid not found" })
    }

    res.status(200).json(grid.state)
} 

export const upsertGrid = async(req: Request, res: Response) => {

    const gridUpsertSchema= z.object({
        x: z.number(),
        y: z.number(),
        val: z.string().min(1).max(1)
    })

    const safeParse= gridUpsertSchema.safeParse(req.body)

    const { x, y, val }: {
        x: number;
        y:number;
        val: string;
    } = req.body

    if(!safeParse.success) {
        throw new Error(`Invalid inputs: ${safeParse.error}`)
    }

    const gridRecord = await prismaClient.grid.findFirst();

        if (!gridRecord) {
            return res.status(404).json({ message: 'Grid not found' });
        }
        

        const gridState = gridRecord.state as string[][] | null;

        if (!gridState) {
            throw new Error('Grid state is null or invalid');
        }

        console.log(gridState);
        
        gridState[x][y] = val;

        await prismaClient.grid.update({
            where: { id: 1 },
            data: {state: gridState as unknown as Prisma.JsonObject} 
        });

        res.status(200).json({ message: 'Block updated successfully', gridState });
}