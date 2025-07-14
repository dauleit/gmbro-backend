import { Document, Types } from 'mongoose';
import { User } from '../schemas/user.schema';

export type IUser = User & Document;

export interface CreateUserDto {
  firstName: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  provider: string;
  providerId: string;
  roles?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  isActive?: boolean;
  roles?: string[];
  metadata?: Record<string, any>;
}

export interface UserQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  provider?: string;
  isActive?: boolean;
  roles?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
