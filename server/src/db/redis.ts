import Redis from "ioredis"

export const redisClient = new Redis(process.env.REDIS_CONNECTION_STRING as string);

export const pub= new Redis(process.env.REDIS_CONNECTION_STRING!)
export const sub= new Redis(process.env.REDIS_CONNECTION_STRING!)