import { IsArray, IsString, IsOptional } from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class UpdateUserRoleDto {
  @IsString()
  @IsOptional()
  roleId: string | null;
}
