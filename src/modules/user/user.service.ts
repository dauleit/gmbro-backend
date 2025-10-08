import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { IUser } from './interfaces/user.interface';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { QueryUserDto } from './dto/queryUser.dto';
import { ConfigService } from 'src/configs/config.service';
import { IResponseData } from 'src/base/base-controller';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage';
import { InternalServerErrorException } from 'src/common/exceptions/internal-server-error.exception';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>, private readonly configService: ConfigService) {}

  async findByProvider(provider: string, providerId: string): Promise<IUser | null> {
    return this.userModel.findOne({ provider, providerId }).exec();
  }

  async findOneById(userId: string): Promise<IUser | null> {
    return this.userModel.findById(userId).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLoginAt: new Date() }).exec();
  }

  async update(userId: string, updateData: UpdateUserDto): Promise<IUser> {
    const user = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<IUser> {
    try {
      // Create user in database
      const newUser = new this.userModel(createUserDto);
      const savedUser = await newUser.save();

      return savedUser;
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw new BadRequestException('Failed to create user');
    }
  }

  async findByCircleUserId(circleUserId: string): Promise<IUser | null> {
    return this.userModel.findOne({ circleUserId }).exec();
  }

  async getUserProfile(userId: string): Promise<IResponseData> {
    try {
      this.logger.log(`Getting user profile for: ${userId}`);

      const user = await this.userModel.findById(userId).select('-password').lean();

      if (!user) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.user.USER_NOT_FOUND
        });
      }

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: { user }
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting user profile:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }
}
