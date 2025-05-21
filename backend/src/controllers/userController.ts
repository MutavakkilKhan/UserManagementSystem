import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User, UserRole } from "../entities/User";
import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

const userRepository = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response) => {
  try {
    let { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    email = email.toLowerCase(); // Ensure email is lowercase
    // Gmail regex
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ message: "Only valid Gmail addresses are allowed" });
    }
    // Password strength
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    // Duplicate email
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Save user
    const user = userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.USER,
    });
    await userRepository.save(user);
    // Generate JWT
    const secret: Secret = process.env.JWT_SECRET || "your-super-secret-jwt-key";
    const options: SignOptions = { expiresIn: process.env.JWT_EXPIRES_IN || "24h" };
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      secret,
      options
    );
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;
    console.log('Login attempt for email:', email);
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    email = email.toLowerCase(); // Ensure email is lowercase
    // Gmail regex
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ message: "Only valid Gmail addresses are allowed" });
    }
    // Find user
    const user = await userRepository.findOne({ where: { email } });
    console.log('Found user:', user ? { id: user.id, email: user.email, role: user.role } : 'Not found');
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Generate JWT
    const secret: Secret = process.env.JWT_SECRET || "your-super-secret-jwt-key";
    const options: SignOptions = { expiresIn: process.env.JWT_EXPIRES_IN || "24h" };
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      secret,
      options
    );
    console.log('Generated token for user:', { id: user.id, role: user.role });
    res.json({ token });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Debug endpoint to list all users (remove in production)
export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await userRepository.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Check if email exists
export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ exists: false, message: 'Email is required' });
    }
    const user = await userRepository.findOne({ where: { email } });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ exists: false, message: 'Error checking email' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    console.log('getMe request for userId:', userId);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await userRepository.findOne({ where: { id: userId } });
    console.log('Found user in getMe:', user ? { id: user.id, email: user.email, role: user.role } : 'Not found');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ message: "Error fetching user info" });
  }
};

export const updateManager = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { email, name, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, name, and password are required' });
    }
    const userRepository = AppDataSource.getRepository(User);
    const newEmail = email.toLowerCase();
    let managerUser = await userRepository.findOne({ where: { email: newEmail } });
    const bcrypt = require('bcrypt');
    if (!managerUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      managerUser = userRepository.create({
        name,
        email: newEmail,
        password: hashedPassword,
        role: UserRole.MANAGER,
      });
      await userRepository.save(managerUser);
    } else {
      managerUser.name = name;
      managerUser.password = await bcrypt.hash(password, 10);
      managerUser.role = UserRole.MANAGER;
      await userRepository.save(managerUser);
    }
    // Optionally, demote previous manager(s) except this one
    await userRepository.createQueryBuilder()
      .update()
      .set({ role: UserRole.USER })
      .where('role = :role AND email != :email', { role: UserRole.MANAGER, email: newEmail })
      .execute();
    res.json({ message: 'Manager updated successfully', email: newEmail });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating manager', error: error.message });
  }
}; 