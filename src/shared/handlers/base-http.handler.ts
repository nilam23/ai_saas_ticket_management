import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
  PayloadTooLargeException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';

export interface HttpResponse<TOutput> {
  status: {
    code: HttpStatus;
    message: string;
  };
  data?: TOutput;
}

export interface HttpErrorResponse {
  status: {
    code: HttpStatus;
    message: string;
  };
}

export abstract class BaseHttpHandler<TInput, TOutput> {
  public abstract handle(
    event: TInput,
  ): Promise<HttpResponse<TOutput>> | HttpResponse<TOutput>;

  protected ok(data?: TOutput): HttpResponse<TOutput> {
    return {
      status: {
        code: HttpStatus.OK,
        message: 'OK',
      },
      data: data ?? undefined,
    };
  }

  protected created(data?: TOutput): HttpResponse<TOutput> {
    return {
      status: {
        code: HttpStatus.CREATED,
        message: 'Created',
      },
      data: data ?? undefined,
    };
  }

  protected accepted(data?: TOutput): HttpResponse<TOutput> {
    return {
      status: {
        code: HttpStatus.ACCEPTED,
        message: 'Accepted',
      },
      data: data ?? undefined,
    };
  }

  protected badRequest(message: string): never {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.BAD_REQUEST,
        message,
      },
    };
    throw new BadRequestException(response);
  }

  protected unauthorized(message: string = 'Unauthorized'): never {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.UNAUTHORIZED,
        message,
      },
    };
    throw new UnauthorizedException(response);
  }

  protected forbidden(message: string = 'Forbidden'): never {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.FORBIDDEN,
        message,
      },
    };
    throw new ForbiddenException(response);
  }

  protected notFound(message: string): never {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.NOT_FOUND,
        message,
      },
    };
    throw new NotFoundException(response);
  }

  protected conflict(message: string): never {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.CONFLICT,
        message,
      },
    };
    throw new ConflictException(response);
  }

  protected gone(message: string): never {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.GONE,
        message,
      },
    };
    throw new GoneException(response);
  }

  protected payloadTooLarge(message: string = 'Payload Too Large'): never {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.PAYLOAD_TOO_LARGE,
        message,
      },
    };
    throw new PayloadTooLargeException(response);
  }

  protected unsupportedMediaType(
    message: string = 'Unsupported Media Type',
  ): never {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        message,
      },
    };
    throw new UnsupportedMediaTypeException(response);
  }

  protected unprocessableEntity(message: string): never {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.UNPROCESSABLE_ENTITY,
        message,
      },
    };
    throw new UnprocessableEntityException(response);
  }

  protected internalServerError(
    message: string = 'Internal Server Error',
  ): never {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
      },
    };
    throw new InternalServerErrorException(response);
  }

  protected notImplemented(message: string = 'Not Implemented'): never {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.NOT_IMPLEMENTED,
        message,
      },
    };
    throw new NotImplementedException(response);
  }

  protected badGateway(message: string = 'Bad Gateway'): never {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.BAD_GATEWAY,
        message,
      },
    };
    throw new BadGatewayException(response);
  }

  protected serviceUnavailable(message: string = 'Service Unavailable'): never {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.SERVICE_UNAVAILABLE,
        message,
      },
    };
    throw new ServiceUnavailableException(response);
  }
}
