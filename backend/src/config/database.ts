import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Software } from "../entities/Software";
import { AccessRequest } from "../entities/AccessRequest";
import dotenv from "dotenv";
import jwt, { Secret } from "jsonwebtoken";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "Muttu@098",
  database: process.env.DB_DATABASE || "uam_system",
  synchronize: true,
  logging: true,
  entities: [User, Software, AccessRequest],
  subscribers: [],
  migrations: [],
  ssl: false,
  extra: {
    trustServerCertificate: true
  }
}); 