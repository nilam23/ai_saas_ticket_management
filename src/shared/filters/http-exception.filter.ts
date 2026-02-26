import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

interface ExceptionResponseBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

function isExceptionResponseBody(obj: unknown): obj is ExceptionResponseBody {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('message' in obj || 'error' in obj || 'statusCode' in obj)
  );
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'status' in exceptionResponse
    ) {
      return response.status(status).json(exceptionResponse);
    }

    if (exception instanceof BadRequestException) {
      if (isExceptionResponseBody(exceptionResponse)) {
        if (Array.isArray(exceptionResponse.message)) {
          const validationMessages = exceptionResponse.message.join(', ');
          return response.status(status).json({
            status: {
              code: status,
              message: validationMessages,
            },
          });
        }

        if (typeof exceptionResponse.message === 'string') {
          return response.status(status).json({
            status: {
              code: status,
              message: exceptionResponse.message,
            },
          });
        }
      }
    }

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : isExceptionResponseBody(exceptionResponse)
          ? exceptionResponse.message || exception.message
          : exception.message;

    return response.status(status).json({
      status: {
        code: status,
        message: Array.isArray(message) ? message.join(', ') : message,
      },
    });
  }
}
