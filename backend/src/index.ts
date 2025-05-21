import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import userRoutes from "./routes/userRoutes";
import softwareRoutes from "./routes/softwareRoutes";
import accessRequestRoutes from "./routes/accessRequestRoutes";

dotenv.config();

const app = express();

app.use(cors());
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
    const adminEmail = process.env.ADMIN_EMAIL || "mutavakkilukhan4428@gmail.com";
    const adminName = process.env.ADMIN_NAME || "Admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const managerEmail = process.env.MANAGER_EMAIL || "mutavakkilmuttu@gmail.com";
    const managerName = process.env.MANAGER_NAME || "Manager";
    const managerPassword = process.env.MANAGER_PASSWORD || "manager123";
    const userRepository = AppDataSource.getRepository("User");
    let adminUser = await userRepository.findOne({ where: { email: adminEmail.toLowerCase() } });
    if (!adminUser) {
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser = userRepository.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: "admin",
      });
      await userRepository.save(adminUser);
      console.log(`Seeded admin user: ${adminEmail}`);
    } else if (adminUser.role !== "admin") {
      adminUser.role = "admin";
      await userRepository.save(adminUser);
      console.log(`Promoted user to admin: ${adminEmail}`);
    }

    // Manager seeding logic
    let managerUser = await userRepository.findOne({ where: { email: managerEmail.toLowerCase() } });
    if (!managerUser) {
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash(managerPassword, 10);
      managerUser = userRepository.create({
        name: managerName,
        email: managerEmail.toLowerCase(),
        password: hashedPassword,
        role: "manager",
      });
      await userRepository.save(managerUser);
      console.log(`Seeded manager user: ${managerEmail}`);
    } else if (managerUser.role !== "manager") {
      managerUser.role = "manager";
      await userRepository.save(managerUser);
      console.log(`Promoted user to manager: ${managerEmail}`);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  }); 