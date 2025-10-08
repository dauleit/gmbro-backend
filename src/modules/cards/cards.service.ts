import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card, CardDocument } from './schemas/card.schema';
import { CircleService } from 'src/common/modules/circle/circle.service';
import { ICircleEncryptionKeyResponse } from './interfaces/circle-encryption-key.interface';
import { CreateCardDto } from './dto/create-card.dto';
import { IResponseData } from 'src/base/base-controller';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage';
import { InternalServerErrorException } from 'src/common/exceptions/internal-server-error.exception';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(@InjectModel(Card.name) private readonly cardModel: Model<CardDocument>, private readonly circleService: CircleService) {}

  async getEncryptionKey(): Promise<IResponseData> {
    try {
      this.logger.log('Getting encryption key from Circle...');

      const circleResponse = await this.circleService.getCircleEncryptionKey();
      const encryptionKey: ICircleEncryptionKeyResponse = circleResponse.data;

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          keyId: encryptionKey.keyId,
          publicKey: encryptionKey.publicKey,
          version: encryptionKey.version
        }
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async createCard(cardData: CreateCardDto, userId: string): Promise<IResponseData> {
    try {
      this.logger.log('Creating card on Circle...');

      // Create card on Circle
      const circleResponse = await this.circleService.createCircleCard(cardData, userId);

      const circleCard = circleResponse.data;
      // Save card to database
      const cardToSave = {
        user: userId,
        circleCardId: circleCard.id,
        cardType: circleCard.fundingType,
        cardNetwork: circleCard.network,
        lastFourDigits: circleCard.last4,
        expiryMonth: parseInt(cardData.expMonth),
        expiryYear: parseInt(cardData.expYear),
        cardholderName: circleCard.billingDetails.name,
        email: cardData.metadata.email,
        phoneNumber: cardData.metadata.phoneNumber,
        billingAddress: {
          line1: circleCard.billingDetails.line1,
          line2: circleCard.billingDetails.line2 || '',
          city: circleCard.billingDetails.city,
          district: circleCard.billingDetails.district,
          country: circleCard.billingDetails.country,
          postalCode: circleCard.billingDetails.postalCode
        },
        status: circleCard.status,
        isDefault: false,
        circleMetadata: {
          cardId: circleCard.id
        },
        metadata: circleCard.metadata,
        createdBy: userId
      };

      const newCard = new this.cardModel(cardToSave);
      const savedCard = await newCard.save();

      return {
        message: ERROR_MESSAGES.common.CREATED,
        data: { card: savedCard }
      };
    } catch (error) {
      this.logger.error('Error creating card:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async getUserCards(userId: string): Promise<IResponseData> {
    try {
      this.logger.log(`Getting cards for user: ${userId}`);

      const cards = await this.cardModel.find({ user: userId }).sort({ createdAt: -1 }).lean();
      if (cards.length) {
        const cardDetails = await this.circleService.getCardDetail(cards[0].circleCardId);
        console.log(cardDetails);
      }
      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: { cards }
      };
    } catch (error) {
      this.logger.error('Error getting user cards:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async findCardById(cardId: string): Promise<CardDocument> {
    return this.cardModel.findOne({ _id: cardId });
  }
}
