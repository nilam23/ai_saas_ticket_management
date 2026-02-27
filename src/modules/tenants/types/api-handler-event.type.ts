import { AuditContext } from 'src/modules/audit/types/audit.type';

export type UploadDocHandlerEvent = {
  file: Express.Multer.File;
  auditContext: AuditContext;
};
