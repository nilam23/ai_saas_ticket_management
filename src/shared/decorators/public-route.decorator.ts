import { SetMetadata } from '@nestjs/common';
import { PUBLIC_ROUTE_METADATA_KEY } from '../constants/common.constant';

export const Public = () => SetMetadata(PUBLIC_ROUTE_METADATA_KEY, true);
