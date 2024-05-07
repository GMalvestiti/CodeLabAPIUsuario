import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { IResponseException } from '../interfaces/response-exception.interface';

export class ResponseExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    return response.status(status).json({
      message: this.transformResponseException(exception as IResponseException),
      data: null,
    });
  }

  private transformResponseException(exception: IResponseException): string {
    if (exception.response?.message) {
      return exception.response.message;
    }

    return exception.message;
  }
}
