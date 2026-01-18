import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

// ==================== DTOs (Data Transfer Objects) ====================

/**
 * 用户注册请求DTO
 */
export class RegisterDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsString({ message: '用户名必须是字符串' })
  username: string;

  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少为6位' })
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

/**
 * 用户登录请求DTO
 */
export class LoginDto {
  @IsString({ message: '用户名必须是字符串' })
  username: string;

  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少为6位' })
  password: string;
}

/**
 * 刷新令牌请求DTO
 */
export class RefreshTokenDto {
  @IsString({ message: '刷新令牌必须是字符串' })
  refreshToken: string;
}

// ==================== Payload Types ====================

/**
 * JWT Access Token 载荷类型
 */
export interface JwtPayload {
  username: string;
  sub: number; // userId
}

/**
 * 设备信息类型
 */
export interface DeviceInfo {
  ip?: string;
  ua?: string; // user-agent
}

// ==================== Response Types ====================

/**
 * 用户基本信息响应类型
 */
export interface UserInfoResponse {
  id: number;
  username: string;
  avatar: string | null;
}

/**
 * 登录响应类型
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  userInfo: UserInfoResponse;
}

/**
 * 刷新令牌响应类型
 */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * 刷新令牌成功响应类型
 */
export interface RefreshSuccessResponse {
  message: string;
}

// ==================== Service Internal Types ====================

/**
 * 认证后的用户类型（不包含密码）
 */
export interface AuthenticatedUser {
  id: number;
  email: string;
  username: string;
  avatar: string | null;
  point: number;
  createdAt: Date;
}

/**
 * 扩展的 Express Request 类型，用于认证后的请求
 */
export interface AuthenticatedRequest {
  user: AuthenticatedUser;
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
}

/**
 * 创建刷新令牌所需的数据类型
 */
export interface CreateRefreshTokenData {
  userId: number;
  tokenHash: string;
  deviceIp?: string;
  userAgent?: string;
}
