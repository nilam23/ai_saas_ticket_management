import { AgentLevel, AgentSkill } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(AgentLevel)
  @IsNotEmpty()
  level: AgentLevel;

  @IsEnum(AgentSkill, { each: true })
  @IsNotEmpty()
  skills: AgentSkill[];
}
