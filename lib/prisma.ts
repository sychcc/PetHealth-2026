import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
//PrismaPg 自己內部建立連線，不需要手動建立 Pool
const prisma = new PrismaClient({ adapter });

export { prisma };
