import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { AccessRequest } from "./AccessRequest";

@Entity()
export class Software {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column("simple-array")
  accessLevels: string[];

  @OneToMany(() => AccessRequest, (accessRequest) => accessRequest.software)
  accessRequests: AccessRequest[];
} 