import {
  IsArray,
  IsString,
  IsOptional,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

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

export class AdjustUserPointDto {
  @IsInt()
  amount: number; // 正数为增加，负数为扣除

  @IsString()
  @IsNotEmpty()
  reason: string; // 操作原因
}
