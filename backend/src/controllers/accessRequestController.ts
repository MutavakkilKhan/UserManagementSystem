import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { AccessRequest, RequestStatus } from "../entities/AccessRequest";
import { User } from "../entities/User";
import { Software } from "../entities/Software";

const accessRequestRepository = AppDataSource.getRepository(AccessRequest);
const userRepository = AppDataSource.getRepository(User);
const softwareRepository = AppDataSource.getRepository(Software);

export const createAccessRequest = async (req: Request, res: Response) => {
  try {
    const { softwareId, accessType, reason } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await userRepository.findOne({ where: { id: userId } });
    const software = await softwareRepository.findOne({ where: { id: softwareId } });

    if (!user || !software) {
      return res.status(404).json({ message: "User or software not found" });
    }

    const existingRequest = await accessRequestRepository.findOne({
      where: {
        user: { id: userId },
        software: { id: softwareId },
        status: RequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Access request already pending" });
    }

    const accessRequest = accessRequestRepository.create({
      user,
      software,
      status: RequestStatus.PENDING,
      accessType,
      reason,
    });

    await accessRequestRepository.save(accessRequest);
    res.status(201).json(accessRequest);
  } catch (error) {
    res.status(500).json({ message: "Error creating access request" });
  }
};

export const listAccessRequests = async (req: Request, res: Response) => {
  try {
    const accessRequests = await accessRequestRepository.find({
      relations: ["user", "software"],
    });
    res.json(accessRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching access requests" });
  }
};

export const updateAccessRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const accessRequest = await accessRequestRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["user", "software"],
    });

    if (!accessRequest) {
      return res.status(404).json({ message: "Access request not found" });
    }

    accessRequest.status = status;
    await accessRequestRepository.save(accessRequest);
    res.json(accessRequest);
  } catch (error) {
    res.status(500).json({ message: "Error updating access request" });
  }
}; 