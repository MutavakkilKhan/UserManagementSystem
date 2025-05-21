import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Software } from "../entities/Software";
import { AccessRequest } from "../entities/AccessRequest";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DB_HOST || !process.env.DB_USERNAME || !process.env.DB_PASSWORD || !process.env.DB_DATABASE) {
  throw new Error("Missing required database environment variables");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.NODE_ENV !== "production", // Only synchronize in development
  logging: process.env.NODE_ENV !== "production", // Only log in development
  entities: [User, Software, AccessRequest],
  subscribers: [],
  migrations: [],
  ssl: process.env.NODE_ENV === "production",
  extra: {
    ssl: process.env.NODE_ENV === "production" ? {
      rejectUnauthorized: false
    } : undefined
  }
}); 
