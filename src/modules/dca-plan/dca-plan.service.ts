import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DCAPlan, DCAPlanDocument } from './schemas/dca-plan.schema';
import { DCAPlanRecord, DCAPlanRecordDocument } from './schemas/dca-plan-record.schema';
import { IDCAPlan, IDCAPlanResponse } from './interfaces/dca-plan.interface';
import { CreateDCAPlanDto } from './dto/create-dca-plan.dto';
import { ApproveUSDCDto } from './dto/approve-usdc.dto';
import { CreateDCAPlanBlockchainDto } from './dto/create-dca-plan-blockchain.dto';
import { CircleService } from 'src/common/modules/circle/circle.service';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { IResponseData } from 'src/base/base-controller';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { InternalServerErrorException } from 'src/common/exceptions/internal-server-error.exception';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { IUser } from 'src/modules/user/interfaces/user.interface';
import { DCAPlanStatus } from './interfaces/dca-plan.interface';
import { DCAPlanRecordStatus } from './enums/dca-plan-record-status.enum';

@Injectable()
export class DCAPlanService {
  private readonly logger = new Logger(DCAPlanService.name);

  constructor(
    @InjectModel(DCAPlan.name) private readonly dcaPlanModel: Model<DCAPlanDocument>,
    @InjectModel(DCAPlanRecord.name) private readonly dcaPlanRecordModel: Model<DCAPlanRecordDocument>,
    private readonly circleService: CircleService,
    private readonly walletService: WalletService
  ) {}

  /**
   * Create a new DCA plan
   * @param user - Current user
   * @param createDCAPlanDto - DCA plan data
   * @returns Promise<IResponseData> - Created DCA plan response
   */
  async createDCAPlan(user: IUser, createDCAPlanDto: CreateDCAPlanDto): Promise<IResponseData> {
    try {
      // Validate unitPerTrade
      const unitPerTrade = parseFloat(createDCAPlanDto.unitPerTrade);
      if (unitPerTrade <= 0) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.dca.INVALID_UNIT_PER_TRADE
        });
      }

      // Create DCA plan data
      const dcaPlanData = {
        user: user._id,
        tokenIn: createDCAPlanDto.tokenIn,
        tokenOut: createDCAPlanDto.tokenOut,
        unitPerTrade: createDCAPlanDto.unitPerTrade,
        frequency: createDCAPlanDto.frequency,
        total_trades: createDCAPlanDto.total_trades,
        dcaType: createDCAPlanDto.dcaType,
        systemFee: createDCAPlanDto.systemFee,
        planGasFee: createDCAPlanDto.planGasFee,
        startTime: createDCAPlanDto.startTime ? new Date(createDCAPlanDto.startTime) : undefined,
        planEndTime: createDCAPlanDto.planEndTime ? new Date(createDCAPlanDto.planEndTime) : undefined,
        contractPlanId: createDCAPlanDto.contractPlanId,
        txhash: createDCAPlanDto.txhash,
        txfee: createDCAPlanDto.txfee
      };

      const dcaPlan = new this.dcaPlanModel(dcaPlanData);
      const savedDCAPlan = await dcaPlan.save();

      return {
        message: ERROR_MESSAGES.common.CREATED,
        data: this.mapDCAPlanToResponse(savedDCAPlan)
      };
    } catch (error) {
      this.logger.error(`Failed to create DCA plan for user ${user.id}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.dca.CREATE_STRATEGY_FAILED
      });
    }
  }

  /**
   * Get DCA plan by ID
   * @param planId - DCA plan ID
   * @param userId - User ID
   * @returns Promise<IResponseData> - DCA plan response
   */
  async getDCAPlanById(planId: string, userId: string): Promise<IResponseData> {
    try {
      const dcaPlan = await this.dcaPlanModel
        .findOne({
          _id: planId,
          user: userId
        })
        .exec();

      if (!dcaPlan) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.dca.STRATEGY_NOT_FOUND
        });
      }

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: this.mapDCAPlanToResponse(dcaPlan)
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get DCA plan ${planId}:`, error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  /**
   * Get user's DCA plans with pagination
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise<IResponseData> - DCA plans response
   */
  async getUserDCAPlans(userId: string, page = 1, limit = 10): Promise<IResponseData> {
    try {
      const skip = (page - 1) * limit;

      const [dcaPlans, total] = await Promise.all([
        this.dcaPlanModel.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
        this.dcaPlanModel.countDocuments({ user: userId })
      ]);

      const mappedPlans = dcaPlans.map((plan) => this.mapDCAPlanToResponse(plan));

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          plans: mappedPlans,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      this.logger.error(`Failed to get DCA plans for user ${userId}:`, error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  /**
   * Get DCA plans by status
   * @param status - DCA plan status
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise<IResponseData> - DCA plans response
   */
  async getDCAPlansByStatus(status: string, page = 1, limit = 10): Promise<IResponseData> {
    try {
      const skip = (page - 1) * limit;

      const [dcaPlans, total] = await Promise.all([
        this.dcaPlanModel.find({ status }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
        this.dcaPlanModel.countDocuments({ status })
      ]);

      const mappedPlans = dcaPlans.map((plan) => this.mapDCAPlanToResponse(plan));

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          plans: mappedPlans,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      this.logger.error(`Failed to get DCA plans with status ${status}:`, error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  /**
   * Map DCA plan document to response interface
   * @param dcaPlan - DCA plan document
   * @returns IDCAPlanResponse - Mapped response
   */
  private mapDCAPlanToResponse(dcaPlan: DCAPlanDocument): IDCAPlanResponse {
    return {
      id: dcaPlan._id.toString(),
      user: dcaPlan.user.toString(),
      tokenIn: dcaPlan.tokenIn,
      tokenOut: dcaPlan.tokenOut,
      unitPerTrade: dcaPlan.unitPerTrade,
      frequency: dcaPlan.frequency,
      total_trades: dcaPlan.total_trades,
      dcaType: dcaPlan.dcaType,
      status: dcaPlan.status,
      systemFee: dcaPlan.systemFee,
      planGasFee: dcaPlan.planGasFee,
      startTime: dcaPlan.startTime,
      planEndTime: dcaPlan.planEndTime,
      pausedAt: dcaPlan.pausedAt,
      resumeAt: dcaPlan.resumeAt,
      contractPlanId: dcaPlan.contractPlanId,
      txhash: dcaPlan.txhash,
      txfee: dcaPlan.txfee,
      createdAt: (dcaPlan as any).createdAt || new Date(),
      updatedAt: (dcaPlan as any).updatedAt || new Date()
    };
  }

  /**
   * Approve USDC token for DCA contract
   * @param user - Current user
   * @param approveUSDCDto - USDC approval data
   * @returns Promise<IResponseData> - Challenge ID for frontend
   */
  async approveUSDC(user: IUser, approveUSDCDto: ApproveUSDCDto): Promise<IResponseData> {
    try {
      // Get user's wallet
      const walletResponse = await this.walletService.getMyWallet(user);
      if (!walletResponse || !walletResponse.data || !walletResponse.data.wallet) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.wallet.WALLET_NOT_FOUND
        });
      }

      const wallet = walletResponse.data.wallet;

      // Get user token
      const userToken = await this.circleService.getUserToken(user.circleUserId);

      // Convert amount to wei (USDC has 6 decimals)
      const amountInWei = Math.round(approveUSDCDto.amount * Math.pow(10, 6)).toString();

      // Create USDC approval challenge using Circle SDK
      const challengeResponse = await this.circleService.createUserTransactionContractExecutionChallenge({
        userToken: userToken,
        walletId: wallet.walletSetId,
        contractAddress: approveUSDCDto.ec2ContractAddress,
        abiFunctionSignature: 'approve(address,uint256)',
        abiParameters: [approveUSDCDto.contractAddress, amountInWei],
        refId: approveUSDCDto.refId || `dca-approve-${Date.now()}`,
        fee: {
          type: 'level',
          config: {
            feeLevel: 'MEDIUM'
          }
        }
      });

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          challengeId: challengeResponse.challengeId,
          contractAddress: approveUSDCDto.contractAddress,
          ec2ContractAddress: approveUSDCDto.ec2ContractAddress,
          amount: approveUSDCDto.amount,
          amountInWei: amountInWei,
          refId: approveUSDCDto.refId || `dca-approve-${Date.now()}`
        }
      };
    } catch (error) {
      this.logger.error(`Failed to create USDC approval challenge for user ${user.id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.dca.CREATE_STRATEGY_FAILED
      });
    }
  }

  /**
   * Create DCA plan on blockchain using Circle challenge
   * @param user - Current user
   * @param createDCAPlanBlockchainDto - DCA plan blockchain data
   * @returns Promise<IResponseData> - Challenge ID for frontend
   */
  async createDCAPlanBlockchain(user: IUser, createDCAPlanBlockchainDto: CreateDCAPlanBlockchainDto): Promise<IResponseData> {
    try {
      this.logger.log(`Creating DCA plan on blockchain for user ${user.id}`);

      // Get user's wallet
      const walletResponse = await this.walletService.getMyWallet(user);
      if (!walletResponse || !walletResponse.data || !walletResponse.data.wallet) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.wallet.WALLET_NOT_FOUND
        });
      }

      const wallet = walletResponse.data.wallet;

      // Get user token
      const userToken = await this.circleService.getUserToken(user.circleUserId);

      // Convert amounts to wei (USDC has 6 decimals)
      const amountPerIntervalInWei = Math.round(createDCAPlanBlockchainDto.amountPerInterval * Math.pow(10, 6)).toString();
      const userSystemFeeInWei = Math.round(createDCAPlanBlockchainDto.userSystemFee * Math.pow(10, 6)).toString();
      const userTransactionFeeInWei = Math.round(createDCAPlanBlockchainDto.userTransactionFee * Math.pow(10, 6)).toString();

      const challengeResponse = await this.circleService.createUserTransactionContractExecutionChallenge({
        userToken: userToken,
        walletId: wallet.walletSetId,
        contractAddress: createDCAPlanBlockchainDto.contractAddress,
        abiFunctionSignature: 'createPlan(address,address,uint256,uint256,uint256,uint256)',
        abiParameters: [
          createDCAPlanBlockchainDto.tokenIn,
          createDCAPlanBlockchainDto.tokenOut,
          amountPerIntervalInWei,
          createDCAPlanBlockchainDto.interval.toString(),
          userSystemFeeInWei,
          userTransactionFeeInWei
        ],
        refId: createDCAPlanBlockchainDto.refId || `dca-create-plan-${Date.now()}`,
        fee: {
          type: 'level',
          config: {
            feeLevel: 'MEDIUM'
          }
        }
      });

      this.logger.log(`DCA plan blockchain challenge created with challengeId: ${challengeResponse.challengeId}`);

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          challengeId: challengeResponse.challengeId,
          contractAddress: createDCAPlanBlockchainDto.contractAddress,
          tokenIn: createDCAPlanBlockchainDto.tokenIn,
          tokenOut: createDCAPlanBlockchainDto.tokenOut,
          amountPerInterval: createDCAPlanBlockchainDto.amountPerInterval,
          amountPerIntervalInWei: amountPerIntervalInWei,
          interval: createDCAPlanBlockchainDto.interval,
          userSystemFee: createDCAPlanBlockchainDto.userSystemFee,
          userSystemFeeInWei: userSystemFeeInWei,
          userTransactionFee: createDCAPlanBlockchainDto.userTransactionFee,
          userTransactionFeeInWei: userTransactionFeeInWei,
          refId: createDCAPlanBlockchainDto.refId || `dca-create-plan-${Date.now()}`
        }
      };
    } catch (error) {
      this.logger.error(`Failed to create DCA plan blockchain challenge for user ${user.id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.dca.CREATE_STRATEGY_FAILED
      });
    }
  }

  /**
   * Job 1: Check and activate pending DCA plans
   * Runs every second to check if any pending DCA plans should be activated
   */
  @Cron(CronExpression.EVERY_SECOND)
  async checkAndActivatePendingPlans(): Promise<void> {
    try {
      this.logger.log('Running job: Check and activate pending DCA plans');

      const currentTime = new Date();

      // Find DCA plans with status 'pending' and current time > startTime
      const pendingPlans = await this.dcaPlanModel.find({
        status: DCAPlanStatus.PENDING,
        startTime: { $lte: currentTime }
      });

      if (pendingPlans.length === 0) {
        this.logger.log('No pending DCA plans to activate');
        return;
      }

      this.logger.log(`Found ${pendingPlans.length} pending DCA plans to activate`);

      // Update status to 'active' for all pending plans that should be activated
      const updateResult = await this.dcaPlanModel.updateMany(
        {
          status: DCAPlanStatus.PENDING,
          startTime: { $lte: currentTime }
        },
        {
          $set: {
            status: DCAPlanStatus.ACTIVE,
            updatedAt: new Date()
          }
        }
      );

      this.logger.log(`Activated ${updateResult.modifiedCount} DCA plans`);
    } catch (error) {
      this.logger.error('Error in checkAndActivatePendingPlans job:', error);
    }
  }

  /**
   * Job 2: Execute active DCA plans
   * Runs every second to check and execute active DCA plans based on frequency
   */
  @Cron(CronExpression.EVERY_SECOND)
  async executeActiveDCAPlans(): Promise<void> {
    try {
      this.logger.log('Running job: Execute active DCA plans');

      // Get all active DCA plans
      const activePlans = await this.dcaPlanModel.find({
        status: DCAPlanStatus.ACTIVE
      });

      if (activePlans.length === 0) {
        this.logger.log('No active DCA plans to execute');
        return;
      }

      this.logger.log(`Found ${activePlans.length} active DCA plans`);

      const currentTime = new Date();

      for (const plan of activePlans) {
        try {
          // Get the latest execution record for this DCA plan
          const latestRecord = await this.dcaPlanRecordModel.findOne({ dcaPlan: plan._id }).sort({ executionTime: -1 });

          let shouldExecute = false;

          if (!latestRecord) {
            // No previous execution, check if it's time to start
            const timeSinceStart = currentTime.getTime() - plan.startTime.getTime();
            if (timeSinceStart >= parseInt(plan.frequency) * 1000) {
              shouldExecute = true;
            }
          } else {
            // Check if enough time has passed since last execution
            const timeSinceLastExecution = currentTime.getTime() - latestRecord.executionTime.getTime();
            if (timeSinceLastExecution >= parseInt(plan.frequency) * 1000) {
              shouldExecute = true;
            }
          }

          if (shouldExecute) {
            this.logger.log(`Executing DCA plan ${plan._id}`);
            await this.executeDCAPlan(plan);
          }
        } catch (error) {
          this.logger.error(`Error executing DCA plan ${plan._id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Error in executeActiveDCAPlans job:', error);
    }
  }

  /**
   * Execute a DCA plan
   * @param plan - DCA plan to execute
   */
  private async executeDCAPlan(plan: DCAPlanDocument): Promise<void> {
    try {
      // Create a new execution record
      const executionRecord = new this.dcaPlanRecordModel({
        dcaPlan: plan._id,
        executionTime: new Date(),
        status: DCAPlanRecordStatus.PENDING
      });

      await executionRecord.save();

      this.logger.log(`Created execution record ${executionRecord._id} for DCA plan ${plan._id}`);

      // TODO: Implement actual DCA execution on blockchain
      // This should call the smart contract's executePlan function
      // For now, we'll simulate the execution

      // Simulate execution delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update execution record with success
      await this.dcaPlanRecordModel.updateOne(
        { _id: executionRecord._id },
        {
          $set: {
            status: DCAPlanRecordStatus.COMPLETED,
            completedAt: new Date(),
            txHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Simulated tx hash
            amountIn: plan.unitPerTrade.toString(),
            amountOut: (parseFloat(plan.unitPerTrade) * 0.95).toString(), // Simulated output with 5% slippage
            gasUsed: '50000',
            blockNumber: Math.floor(Math.random() * 1000000) + 1000000
          }
        }
      );

      this.logger.log(`Successfully executed DCA plan ${plan._id}`);

      // Check if this was the last execution
      const totalExecutions = await this.dcaPlanRecordModel.countDocuments({
        dcaPlan: plan._id,
        status: DCAPlanRecordStatus.COMPLETED
      });

      if (totalExecutions >= plan.total_trades) {
        // Mark DCA plan as completed
        await this.dcaPlanModel.updateOne(
          { _id: plan._id },
          {
            $set: {
              status: DCAPlanRecordStatus.COMPLETED,
              updatedAt: new Date()
            }
          }
        );

        this.logger.log(`DCA plan ${plan._id} completed all ${plan.total_trades} trades`);
      }
    } catch (error) {
      this.logger.error(`Error executing DCA plan ${plan._id}:`, error);

      // Update execution record with failure
      const latestRecord = await this.dcaPlanRecordModel.findOne({ dcaPlan: plan._id }).sort({ executionTime: -1 });

      if (latestRecord) {
        await this.dcaPlanRecordModel.updateOne(
          { _id: latestRecord._id },
          {
            $set: {
              status: DCAPlanRecordStatus.FAILED,
              failedAt: new Date(),
              errorMessage: error.message
            }
          }
        );
      }
    }
  }

  /**
   * Get DCA plan execution records
   * @param dcaPlanId - DCA plan ID
   * @param page - Page number
   * @param limit - Records per page
   * @returns Promise<IResponseData> - Execution records
   */
  async getDCAPlanRecords(dcaPlanId: string, page = 1, limit = 10): Promise<IResponseData> {
    try {
      const skip = (page - 1) * limit;

      const records = await this.dcaPlanRecordModel
        .find({ dcaPlan: dcaPlanId })
        .sort({ executionTime: -1 })
        .skip(skip)
        .limit(limit)
        .populate('dcaPlan', 'tokenIn tokenOut unitPerTrade frequency');

      const total = await this.dcaPlanRecordModel.countDocuments({ dcaPlan: dcaPlanId });

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          records,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      this.logger.error(`Failed to get DCA plan records for plan ${dcaPlanId}:`, error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }
}
