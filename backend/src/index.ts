import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import { User, UserRole } from "./entities/User";
import userRoutes from "./routes/userRoutes";
import softwareRoutes from "./routes/softwareRoutes";
import accessRequestRoutes from "./routes/accessRequestRoutes";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const app = express();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/software", softwareRoutes);
app.use("/api/access-request", accessRequestRoutes);

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected successfully");

    // Admin seeding logic
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error("Admin credentials are required in environment variables");
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME || "Admin";
    const adminPassword = process.env.ADMIN_PASSWORD;
    const managerEmail = process.env.MANAGER_EMAIL;
    const managerName = process.env.MANAGER_NAME || "Manager";
    const managerPassword = process.env.MANAGER_PASSWORD;

    const userRepository = AppDataSource.getRepository(User);

    try {
      // Only seed admin if email and password are provided
      if (adminEmail && adminPassword) {
        let adminUser = await userRepository.findOne({ where: { email: adminEmail.toLowerCase() } });
        if (!adminUser) {
          const bcrypt = require("bcrypt");
          const hashedPassword = await bcrypt.hash(adminPassword, 10);
          adminUser = userRepository.create({
            name: adminName,
            email: adminEmail.toLowerCase(),
            password: hashedPassword,
            role: UserRole.ADMIN,
          });
          await userRepository.save(adminUser);
          console.log(`Seeded admin user: ${adminEmail}`);
        } else if (adminUser.role !== UserRole.ADMIN) {
          adminUser.role = UserRole.ADMIN;
          await userRepository.save(adminUser);
          console.log(`Promoted user to admin: ${adminEmail}`);
        }
      }

      // Only seed manager if email and password are provided
      if (managerEmail && managerPassword) {
        let managerUser = await userRepository.findOne({ where: { email: managerEmail.toLowerCase() } });
        if (!managerUser) {
          const bcrypt = require("bcrypt");
          const hashedPassword = await bcrypt.hash(managerPassword, 10);
          managerUser = userRepository.create({
            name: managerName,
            email: managerEmail.toLowerCase(),
            password: hashedPassword,
            role: UserRole.MANAGER,
          });
          await userRepository.save(managerUser);
          console.log(`Seeded manager user: ${managerEmail}`);
        } else if (managerUser.role !== UserRole.MANAGER) {
          managerUser.role = UserRole.MANAGER;
          await userRepository.save(managerUser);
          console.log(`Promoted user to manager: ${managerEmail}`);
        }
      }

      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Error during user seeding:", error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }); 
