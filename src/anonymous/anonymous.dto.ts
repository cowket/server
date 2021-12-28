import { IsString, Length } from 'class-validator'

export class CreateWorkspaceDto {
  @IsString()
  @Length(1, 20)
  workspace_name: string
}
