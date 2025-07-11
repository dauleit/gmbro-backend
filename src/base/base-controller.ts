import { HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
interface IMessage {
  message: string;
  status: number;
  code: string;
}

export interface IResponseData {
  message: IMessage;
  data?: any;
}

export class BaseController {
  responseBadRequest(@Res() res: Response, data: IResponseData) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      ...data.message,
      data: data.data || null
    });
  }

  responseNotFound(@Res() res: Response, data: IResponseData) {
    return res.status(HttpStatus.NOT_FOUND).json({
      ...data.message,
      data: data.data || null
    });
  }

  responseInternalServerError(@Res() res: Response, data: IResponseData) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ...data.message,
      data: data.data || null
    });
  }

  responseSuccess(@Res() res: Response, data: IResponseData) {
    return res.status(HttpStatus.OK).json({
      ...data.message,
      data: data.data || null
    });
  }

  responseCreated(@Res() res: Response, data: IResponseData) {
    return res.status(HttpStatus.CREATED).json({
      ...data.message,
      data: data.data || null
    });
  }
}
