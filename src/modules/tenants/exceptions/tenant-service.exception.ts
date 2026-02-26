import {
  ConflictException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { HttpErrorResponse } from 'src/shared/handlers/base-http.handler';

export class TenantNotFoundException extends NotFoundException {
  constructor(message: string = 'Tenant not found') {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.NOT_FOUND,
        message,
      },
    };
    super(response);
    this.message = message;
  }
}

export class TenantAlreadyExistsException extends ConflictException {
  constructor(message: string = 'Tenant already exists') {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.CONFLICT,
        message,
      },
    };
    super(response);
    this.message = message;
  }
}
