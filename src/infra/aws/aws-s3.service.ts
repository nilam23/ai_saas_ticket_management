import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import {
  AWS_ACCESS_KEY,
  AWS_REGION,
  AWS_S3_BUCKET,
  AWS_SECRET_KEY,
} from 'src/shared/utils/env-config.utils';
import { normalizeError } from 'src/shared/utils/error.utils';
import { S3UploadException } from './exceptions';

@Injectable()
export class AwsS3Service {
  private readonly logger = new Logger(AwsS3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucket = AWS_S3_BUCKET;

  constructor() {
    this.s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
      },
    });
  }

  public async uploadFile(
    key: string,
    body: Buffer,
    acl: ObjectCannedACL = 'private',
    contentType: string = 'application/octet-stream',
    contentDisposition: string = '',
  ): Promise<void> {
    try {
      this.logger.log(
        `Preparing object to upload to S3. Key: ${key}, Bucket: ${this.bucket}, Acl: ${acl}`,
      );
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ACL: acl,
        ContentType: contentType,
        ...(contentDisposition && { ContentDisposition: contentDisposition }),
      });

      await this.s3Client.send(command);
    } catch (error) {
      const { message } = normalizeError(error);
      this.logger.log(
        `Upload to S3 failed. Key: ${key}, Bucket: ${this.bucket}, Acl: ${acl}`,
      );
      throw new S3UploadException(message);
    }
  }
}
