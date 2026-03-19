import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AgentReviewAction } from '../enums/message.enum';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class ReviewAiResponseDto {
  @IsEnum(AgentReviewAction)
  @IsNotEmpty()
  action: AgentReviewAction;

  @IsOptional()
  @IsString()
  updatedResponse?: string;
}
