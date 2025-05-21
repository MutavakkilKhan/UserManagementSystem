import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Software } from "../entities/Software";

const softwareRepository = AppDataSource.getRepository(Software);

export const listSoftware = async (req: Request, res: Response) => {
  try {
    const software = await softwareRepository.find();
    res.json(software);
  } catch (error) {
    res.status(500).json({ message: "Error fetching software list" });
  }
};

export const createSoftware = async (req: Request, res: Response) => {
  try {
    const { name, description, accessLevels } = req.body;

    const software = softwareRepository.create({
      name,
      description,
      accessLevels: accessLevels && Array.isArray(accessLevels) && accessLevels.length > 0 ? accessLevels : ["read", "write", "admin"],
    });

    await softwareRepository.save(software);
    res.status(201).json(software);
  } catch (error) {
    res.status(500).json({ message: "Error creating software" });
  }
}; 