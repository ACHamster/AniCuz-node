export const PERMISSIONS_DEFINITIONS = [
  // Article permissions
  { code: 'article:create', group: 'Article', desc: '允许发布文章' },
  { code: 'article:read', group: 'Article', desc: '允许阅读文章' },
  // { code: 'article:edit', group: 'Article', desc: '允许编辑自己的文章' },
  // { code: 'article:edit:any', group: 'Article', desc: '允许编辑任何文章' },
  // { code: 'article:delete', group: 'Article', desc: '允许删除自己的文章' },
  { code: 'article:delete:any', group: 'Article', desc: '允许删除任何文章' },
  { code: 'article:like', group: 'Article', desc: '允许点赞文章' },
  {
    code: 'article:updateStatus',
    group: 'Article',
    desc: '允许修改文章状态（草稿/发布/封禁）',
  },
  {
    code: 'article:updateStatus:any',
    group: 'Article',
    desc: '允许修改任何文章状态（草稿/发布/封禁）',
  },
  { code: 'article:view:draft', group: 'Article', desc: '允许查看草稿文章' },

  // Comment permissions
  { code: 'comment:create', group: 'Comment', desc: '允许发表评论' },
  { code: 'comment:delete', group: 'Comment', desc: '允许删除自己的评论' },
  { code: 'comment:delete:any', group: 'Comment', desc: '允许删除任何评论' },
  // { code: 'comment:like', group: 'Comment', desc: '允许点赞评论' },

  // Upload permissions
  { code: 'upload:image', group: 'Upload', desc: '允许上传图片' },
  // { code: 'upload:delete', group: 'Upload', desc: '允许删除自己上传的文件' },
  { code: 'upload:delete:any', group: 'Upload', desc: '允许删除任何上传文件' },

  // User permissions
  { code: 'user:editUsername', group: 'User', desc: '允许编辑自己的信息' },
  { code: 'user:edit:any', group: 'User', desc: '允许编辑任何用户信息' },
  { code: 'user:ban', group: 'User', desc: '允许封禁用户' },
  { code: 'user:unban', group: 'User', desc: '允许解封用户' },
  { code: 'user:delete', group: 'User', desc: '允许删除用户账户' },
  {
    code: 'user:view:sensitive',
    group: 'User',
    desc: '允许查看敏感信息（邮箱等）',
  },
  { code: 'user:assign:role', group: 'User', desc: '允许分配角色' },
  { code: 'user:manage:exp', group: 'User', desc: '允许管理用户经验值' },
  { code: 'user:manage:point', group: 'User', desc: '允许管理用户积分' },

  // Board permissions
  { code: 'board:create', group: 'Board', desc: '允许创建板块' },
  // { code: 'board:read', group: 'Board', desc: '允许查看板块' },
  { code: 'board:edit', group: 'Board', desc: '允许编辑板块' },
  { code: 'board:delete', group: 'Board', desc: '允许删除板块' },
  { code: 'board:manage', group: 'Board', desc: '允许管理板块（管理员权限）' },

  // Tag permissions
  { code: 'tag:create', group: 'Tag', desc: '允许创建标签' },
  { code: 'tag:read', group: 'Tag', desc: '允许查看标签' },
  { code: 'tag:edit', group: 'Tag', desc: '允许编辑标签' },
  { code: 'tag:delete', group: 'Tag', desc: '允许删除标签' },
  { code: 'tag:manage', group: 'Tag', desc: '允许管理标签' },

  // Role permissions
  { code: 'role:create', group: 'Role', desc: '允许创建角色' },
  { code: 'role:read', group: 'Role', desc: '允许查看角色' },
  { code: 'role:edit', group: 'Role', desc: '允许编辑角色' },
  { code: 'role:delete', group: 'Role', desc: '允许删除角色' },
  { code: 'role:assign', group: 'Role', desc: '允许分配角色给用户' },

  // Level & Reward permissions
  { code: 'level:manage', group: 'Level', desc: '允许管理等级规则' },
  { code: 'reward:checkin', group: 'Reward', desc: '允许签到获取奖励' },
  { code: 'reward:claim', group: 'Reward', desc: '允许领取奖励' },

  // System permissions
  { code: 'system:config', group: 'System', desc: '允许修改系统配置' },
  { code: 'system:log:view', group: 'System', desc: '允许查看系统日志' },
  { code: 'system:stats:view', group: 'System', desc: '允许查看系统统计数据' },
  { code: 'system:backup', group: 'System', desc: '允许备份系统数据' },

  // Moderation permissions
  { code: 'moderation:review', group: 'Moderation', desc: '允许审核内容' },
  { code: 'moderation:report:view', group: 'Moderation', desc: '允许查看举报' },
  {
    code: 'moderation:report:handle',
    group: 'Moderation',
    desc: '允许处理举报',
  },
  { code: 'moderation:content:ban', group: 'Moderation', desc: '允许封禁内容' },

  // 超级管理员权限
  { code: '*', group: 'All', desc: '超级管理员权限（所有权限）' },
];
