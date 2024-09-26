import { Request, Response } from "express";
import prismaClient from "../db/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { redisClient } from "../db/redis";

export const getGrid = async(req: Request, res: Response) => {
    const cachedGrid= await redisClient.get("GRID_STATE")
    if(cachedGrid){
        console.log("Cache hit on read")
        return res.status(200).json(JSON.parse(cachedGrid))
    }

    console.log("Cache miss on reading Grid")
    let grid;
    grid= await prismaClient.grid.findFirst()

    if(!grid) {
        grid = await createGrid()
    }

    redisClient.set("GRID_STATE", JSON.stringify(grid.state))

    res.status(200).json(grid.state)
} 

async function createGrid() {
  const defaultGridState = Array(10).fill(Array(10).fill("")); 

  const newGrid = await prismaClient.grid.create({
    data: {
      state: defaultGridState, 
    },
  });

  console.log("Created a new Grid:", newGrid);

  return newGrid;
}

export const getHistory = async (req: Request, res: Response) => {
    try {
      const page: number = parseInt(req.query.page as string) || 1;
      console.log("page: ", page);
      
      if(page<=0) {
        throw new Error("Invalid page number");
      }

      const skipEntries = (page - 1) * 10;

      const history = await prismaClient.history.findMany({
        orderBy: {
          updatedAt: "desc",
        },
        skip: skipEntries,
        take: 10, 
        include:{
            user: true
        }
      });
  
      res.status(200).json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  };

interface IUser {
  id: number;
  email: string;
  name: string;
  imageUrl: string;
}

export const storeToDB = async(gridState: string[][], updatedMessage: {
  row: number;
  col: number;
  value: string;
  user: IUser;
})=> {
  try {
    
    await prismaClient.$transaction(async (txn)=> {
      const grid = await prismaClient.grid.findFirst();
      if(!grid) {
        throw new Error("Grid not found while storing to db");
      }
      await txn.grid.update(
        { where: { id: grid.id }, 
          data: { state: gridState } 
        });
       
      console.log("Grid state persisted to db.");

      await txn.history.create({
        data: {
          row: updatedMessage.row,
          col: updatedMessage.col,
          character: updatedMessage.value,
          userId: updatedMessage.user.id,
          state: gridState
        }
      });
      console.log(`user ${updatedMessage.user.name} updated grid at ${updatedMessage.row}, ${updatedMessage.col} to ${updatedMessage.value}`);
      console.log("History entry persisted to db.");
    })

    console.log("Transaction successful");
  } catch (error) {
    console.error("Failed to persist grid to db:", error);
  }
}

export const checkRateLimit = async(message: { row: number; col: number; value: string; user: IUser; }) => {
  const key= `${message.row}-${message.col}`

    const rateLimittedBlock= await redisClient.get(key)
    
    if(rateLimittedBlock) {
      console.log("rate limited block", rateLimittedBlock)
      throw new Error("This block is freezed for 20 seconds!")
    }

    redisClient.setex(key, 20, 1)

}
  
// Upsert route is deprecated as communication is now done via websockets

// export const upsertGrid = async(req: Request, res: Response) => {

//     const gridUpsertSchema= z.object({
//         row: z.number(),
//         col: z.number(),
//         value: z.string().min(1).max(1)
//     })

//     const safeParse= gridUpsertSchema.safeParse(req.body)

//     const { row, col, value }: {
//         row: number;
//         col:number;
//         value: string;
//     } = req.body


//     if(!safeParse.success) {
//         throw new Error(`Invalid inputs: ${safeParse.error}`)
//     }

//     const gridRecord = await prismaClient.grid.findFirst();

//         if (!gridRecord) {
//             return res.status(404).json({ message: 'Grid not found' });
//         }
        

//         const gridState = gridRecord.state as string[][] | null;

//         if (!gridState) {
//             throw new Error('Grid state is null or invalid');
//         }

        
//         gridState[row][col] = value;
//         console.log(gridState);

//         await prismaClient.grid.update({
//             where: { id: 1 },
//             data: {state: gridState as unknown as Prisma.JsonObject} 
//         });

//         res.status(200).json({ message: 'Block updated successfully', gridState });
// }