import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seeding & migration fix...');

  // 1. 创建/更新角色 (Role)
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', permissions: ['*'] },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      isDefault: true,
      permissions: ['article:create', 'comment:create', 'upload:image'],
    },
  });

  await prisma.role.upsert({
    where: { name: 'muted' },
    update: {},
    create: { name: 'muted', permissions: ['article:read'] },
  });

  console.log(`Roles created/updated: admin, user, muted`);

  const levelConfigs = [
    {
      level: 0,
      threshold: 0,
      perks: {
        uploadLimit: 0, // 0MB
        dailyCheckInBonus: 5, // 每日签到送5积分
        canSetAvatarFrame: false, // Lv0 不能换头像框 (比如)
      },
    },
    {
      level: 1,
      threshold: 100, // 需要 100 经验
      perks: {
        uploadLimit: 1024 * 1024 * 5, // 5MB
        dailyCheckInBonus: 5,
        canSetAvatarFrame: true,
        nicknameColor: '#3498db', // 名字变蓝
      },
    },
    {
      level: 2,
      threshold: 500,
      perks: {
        uploadLimit: 1024 * 1024 * 8, // 8MB
        dailyCheckInBonus: 10,
        canSetAvatarFrame: true,
        nicknameColor: '#3498db',
      },
    },
    {
      level: 3,
      threshold: 1500,
      perks: {
        uploadLimit: 1024 * 1024 * 30, // 30MB
        dailyCheckInBonus: 10,
        canSetAvatarFrame: true,
        nicknameColor: '#9b59b6', // 名字变紫
      },
    },
    {
      level: 4,
      threshold: 2000,
      perks: {
        uploadLimit: 1024 * 1024 * 50, // 50MB
        dailyCheckInBonus: 10,
        canSetAvatarFrame: true,
        nicknameColor: '#9b59b6', // 名字变紫
      },
    },
  ];

  for (const config of levelConfigs) {
    await prisma.levelRule.upsert({
      where: { level: config.level },
      update: {
        threshold: config.threshold,
        perks: config.perks, // 允许更新现有配置
      },
      create: {
        level: config.level,
        threshold: config.threshold,
        perks: config.perks,
      },
    });
  }

  // 查找所有 roleId 为 null 的用户
  const usersWithoutRole = await prisma.user.count({
    where: { roleId: null },
  });

  if (usersWithoutRole > 0) {
    console.log(`⚠️ Found ${usersWithoutRole} users without role. Fixing...`);

    // 将所有没有角色的用户，统一设置为 'user' 角色
    await prisma.user.updateMany({
      where: { roleId: null },
      data: {
        roleId: userRole.id, // 赋予普通用户 ID
      },
    });
    console.log(
      `✅ Fixed! All existing users are now assigned to '${userRole.name}' role.`,
    );
  } else {
    console.log('👍 All users already have roles.');
  }

  // 3. 创建初始管理员 (如果不存在)
  const adminEmail = 'admin@acg.com';
  const hashedPassword = await bcrypt.hash('df11gbsp25t', 8); // 初始密码

  // 注意：这里使用 upsert 防止重复运行报错
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail }, // 假设 email 是 @unique
    update: {}, // 如果已存在，什么都不做
    create: {
      email: adminEmail,
      password: hashedPassword,
      username: 'achamster',

      // 关键：关联 Admin 角色
      role: {
        connect: { id: adminRole.id },
      },

      // 初始等级与经验
      level: 99,
      exp: 999999,
    },
  });

  console.log(`ADMIN user created: ${adminUser.email} / password123`);
  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
