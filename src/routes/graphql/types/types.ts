import { PrismaClient } from "@prisma/client";
import { MemberTypeId } from "../../member-types/schemas.js";

export interface Context {
  prisma: PrismaClient;
}

export type ResolverArgs<T> = {
  [argName: string]: T;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

export interface Profile {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: MemberTypeId;
}

export interface User {
  id: string;
  name: string;
  balance: number;
}