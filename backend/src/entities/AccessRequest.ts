import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Software } from "./Software";

export enum RequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum AccessType {
  READ = "read",
  WRITE = "write",
  ADMIN = "admin",
}

@Entity()
export class AccessRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.accessRequests)
  user!: User;

  @ManyToOne(() => Software, (software) => software.accessRequests)
  software!: Software;

  @Column({
    type: "enum",
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status!: RequestStatus;

  @Column({
    type: "enum",
    enum: AccessType,
    default: AccessType.READ,
  })
  accessType!: AccessType;

  @Column({ type: "text" })
  reason!: string;

  @CreateDateColumn()
  timestamp!: Date;
} 