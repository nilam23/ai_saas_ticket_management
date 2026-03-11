import { BadRequestException, HttpStatus } from '@nestjs/common';
import { HttpErrorResponse } from 'src/shared/handlers/base-http.handler';

export class S3UploadException extends BadRequestException {
  constructor(message: string = 'Upload to S3 failed') {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
      },
    };
    super(response);
    this.message = message;
  }
}

export class S3FetchObjectException extends BadRequestException {
  constructor(message: string = 'Fetch object from S3 failed') {
    const response: HttpErrorResponse = {
      status: {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
      },
    };
    super(response);
    this.message = message;
  }
}
