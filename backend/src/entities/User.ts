import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { AccessRequest } from "./AccessRequest";

export enum UserRole {
  USER = "user",
  MANAGER = "manager",
  ADMIN = "admin",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @OneToMany(() => AccessRequest, (accessRequest) => accessRequest.user)
  accessRequests!: AccessRequest[];
} 