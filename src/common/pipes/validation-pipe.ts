import { Injectable, PipeTransform, ArgumentMetadata, HttpException, HttpStatus } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ERROR_MESSAGES } from '../constants/errorMessage';
import { BadRequestException } from '../exceptions/bad-request.exception';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    // Skip validation for primitive types and undefined/null values
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Only validate if value exists (for optional parameters)
    if (value === undefined || value === null) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException({ message: ERROR_MESSAGES.common.BAD_REQUEST, data: errors });
    }

    return value;
  }

  /**
   * Build Errors to send it to the frontend
   * @param errors
   * @returns
   */
  private buildError(errors) {
    const result = {};

    errors.forEach((el) => {
      const prop = el.property;

      if (el?.children) {
        this.buildError(el?.children);
      } else {
        Object.entries(el?.constraints).forEach((constraint) => {
          result[prop] = constraint[1];
        });
      }
    });

    return result;
  }

  /**
   * To Validate
   * @param metatype
   * @returns
   */
  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find((type) => metatype === type);
  }
}
