/**
 * Mock 数据
 * 内部产品需求反馈工具 - 模拟数据（用于本地开发测试）
 */

const MockData = {
  // 用户信息
  user: {
    id: 'user001',
    name: 'chenzhenwei01',
    email: 'chenzhenwei01@company.com',
    department: {
      id: 'product',
      name: '产品部'
    },
    role: 'user',
    is_product_manager: false
  },
  
  // 部门列表
  departments: [
    {
      id: 'product',
      name: '产品部',
      parent_id: null,
      level: 1,
      children: [
        { id: 'product-1', name: '产品一组', parent_id: 'product', level: 2 },
        { id: 'product-2', name: '产品二组', parent_id: 'product', level: 2 }
      ]
    },
    {
      id: 'development',
      name: '研发部',
      parent_id: null,
      level: 1,
      children: [
        { id: 'dev-frontend', name: '前端组', parent_id: 'development', level: 2 },
        { id: 'dev-backend', name: '后端组', parent_id: 'development', level: 2 },
        { id: 'dev-mobile', name: '移动端组', parent_id: 'development', level: 2 }
      ]
    },
    {
      id: 'design',
      name: '设计部',
      parent_id: null,
      level: 1,
      children: []
    },
    {
      id: 'operation',
      name: '运营部',
      parent_id: null,
      level: 1,
      children: []
    },
    {
      id: 'sales',
      name: '销售部',
      parent_id: null,
      level: 1,
      children: []
    },
    {
      id: 'service',
      name: '客服部',
      parent_id: null,
      level: 1,
      children: []
    },
    {
      id: 'hr',
      name: '人力资源部',
      parent_id: null,
      level: 1,
      children: []
    },
    {
      id: 'finance',
      name: '财务部',
      parent_id: null,
      level: 1,
      children: []
    }
  ],
  
  // 需求列表
  requirements: [
    {
      id: 1,
      requirement_no: 'REQ-20260327-001',
      user_id: 'user001',
      user_name: 'chenzhenwei01',
      user_email: 'chenzhenwei01@company.com',
      department_id: 'product',
      department_name: '产品部',
      requirement_type: 'feature_optimization',
      priority: 'P1',
      description_preview: '优化企业邮箱移动端邮件搜索功能，支持按发件人、时间范围、附件类型等多条件组合搜索',
      description: '<p><strong>背景：</strong></p><p>目前企业邮箱移动端的搜索功能较为简单...</p>',
      attachment_count: 2,
      status: 'submitted',
      created_at: '2026-03-27 10:30:00',
      updated_at: '2026-03-27 10:30:00'
    },
    {
      id: 2,
      requirement_no: 'REQ-20260326-015',
      user_id: 'user002',
      user_name: '张三',
      user_email: 'zhangsan@company.com',
      department_id: 'sales',
      department_name: '销售部',
      requirement_type: 'new_feature',
      priority: 'P2',
      description_preview: '外贸通客户管理模块增加批量导入功能，支持 Excel 模板导入',
      description: '<p>建议增加客户批量导入功能...</p>',
      attachment_count: 1,
      status: 'submitted',
      created_at: '2026-03-26 15:20:00',
      updated_at: '2026-03-26 15:20:00'
    },
    {
      id: 3,
      requirement_no: 'REQ-20260326-014',
      user_id: 'user003',
      user_name: '李四',
      user_email: 'lisi@company.com',
      department_id: 'service',
      department_name: '客服部',
      requirement_type: 'bug_fix',
      priority: 'P0',
      description_preview: '修复邮件发送时附件超过 50MB 导致上传失败的 Bug',
      description: '<p>发现一个严重 Bug...</p>',
      attachment_count: 0,
      status: 'processing',
      created_at: '2026-03-26 14:10:00',
      updated_at: '2026-03-26 14:10:00'
    },
    {
      id: 4,
      requirement_no: 'REQ-20260325-008',
      user_id: 'user004',
      user_name: '王五',
      user_email: 'wangwu@company.com',
      department_id: 'development',
      department_name: '研发部',
      requirement_type: 'experience_optimization',
      priority: 'P2',
      description_preview: '优化邮件列表加载速度，增加虚拟滚动支持',
      description: '<p>当前邮件列表在数据量大时加载缓慢...</p>',
      attachment_count: 3,
      status: 'submitted',
      created_at: '2026-03-25 11:45:00',
      updated_at: '2026-03-25 11:45:00'
    },
    {
      id: 5,
      requirement_no: 'REQ-20260325-007',
      user_id: 'user005',
      user_name: '赵六',
      user_email: 'zhaoliu@company.com',
      department_id: 'operation',
      department_name: '运营部',
      requirement_type: 'new_feature',
      priority: 'P3',
      description_preview: '增加邮件定时发送功能，支持设置多个定时任务',
      description: '<p>建议增加定时发送功能...</p>',
      attachment_count: 0,
      status: 'submitted',
      created_at: '2026-03-25 09:30:00',
      updated_at: '2026-03-25 09:30:00'
    },
    {
      id: 6,
      requirement_no: 'REQ-20260324-022',
      user_id: 'user006',
      user_name: '钱七',
      user_email: 'qianqi@company.com',
      department_id: 'design',
      department_name: '设计部',
      requirement_type: 'bug_fix',
      priority: 'P1',
      description_preview: '修复移动端邮件预览时图片显示不全的问题',
      description: '<p>移动端预览邮件时图片显示异常...</p>',
      attachment_count: 1,
      status: 'processing',
      created_at: '2026-03-24 16:20:00',
      updated_at: '2026-03-24 16:20:00'
    },
    {
      id: 7,
      requirement_no: 'REQ-20260324-021',
      user_id: 'user007',
      user_name: '孙八',
      user_email: 'sunba@company.com',
      department_id: 'product',
      department_name: '产品部',
      requirement_type: 'feature_optimization',
      priority: 'P2',
      description_preview: '优化邮件搜索功能，支持全文检索',
      description: '<p>当前搜索仅支持标题匹配...</p>',
      attachment_count: 0,
      status: 'submitted',
      created_at: '2026-03-24 14:00:00',
      updated_at: '2026-03-24 14:00:00'
    },
    {
      id: 8,
      requirement_no: 'REQ-20260323-018',
      user_id: 'user008',
      user_name: '周九',
      user_email: 'zhoujiu@company.com',
      department_id: 'sales',
      department_name: '销售部',
      requirement_type: 'new_feature',
      priority: 'P3',
      description_preview: '增加邮件签名模板功能，支持多套签名切换',
      description: '<p>销售团队需要多套签名模板...</p>',
      attachment_count: 2,
      status: 'submitted',
      created_at: '2026-03-23 10:15:00',
      updated_at: '2026-03-23 10:15:00'
    },
    {
      id: 9,
      requirement_no: 'REQ-20260322-012',
      user_id: 'user009',
      user_name: '吴十',
      user_email: 'wushi@company.com',
      department_id: 'service',
      department_name: '客服部',
      requirement_type: 'bug_fix',
      priority: 'P0',
      description_preview: '修复邮件撤回功能在特定情况下失效的问题',
      description: '<p>邮件撤回功能存在 Bug...</p>',
      attachment_count: 0,
      status: 'processing',
      created_at: '2026-03-22 17:30:00',
      updated_at: '2026-03-22 17:30:00'
    },
    {
      id: 10,
      requirement_no: 'REQ-20260322-011',
      user_id: 'user010',
      user_name: '郑一',
      user_email: 'zhengyi@company.com',
      department_id: 'development',
      department_name: '研发部',
      requirement_type: 'feature_optimization',
      priority: 'P1',
      description_preview: '优化邮件分类功能，支持自定义标签和智能分类',
      description: '<p>建议增强邮件分类功能...</p>',
      attachment_count: 1,
      status: 'submitted',
      created_at: '2026-03-22 11:00:00',
      updated_at: '2026-03-22 11:00:00'
    }
  ],
  
  // 评论数据
  comments: [
    {
      id: 1,
      requirement_id: 1,
      user_id: 'user003',
      user_name: '李四',
      department_name: '产品部',
      content: '这个需求很有价值！移动端搜索确实需要增强。我补充几点建议：\n1. 建议增加搜索历史记录功能\n2. 支持搜索结果排序（按时间/按相关性）\n3. 考虑增加语音搜索功能',
      created_at: '2026-03-27 11:00:00',
      is_deleted: false
    },
    {
      id: 2,
      requirement_id: 1,
      user_id: 'user004',
      user_name: '王五',
      department_name: '研发部',
      content: '从技术实现角度，这个需求的工作量评估如下：\n- 前端改造：3 人日\n- 后端接口：2 人日\n- 测试验证：1 人日\n\n建议排期到下个迭代，预计 4 月中旬可以上线。',
      created_at: '2026-03-27 14:30:00',
      is_deleted: false
    },
    {
      id: 3,
      requirement_id: 1,
      user_id: 'user001',
      user_name: 'chenzhenwei01',
      department_name: '产品部',
      content: '感谢 @李四 @王五 的补充！@王五 提到的排期我了解了，那我们先把需求细节完善一下，等评审通过后正式立项。',
      created_at: '2026-03-27 15:00:00',
      is_deleted: false
    }
  ],
  
  // 需求详情（用于 detail.html）
  requirementDetail: {
    id: 1,
    requirement_no: 'REQ-20260327-001',
    user: {
      id: 'user001',
      name: 'chenzhenwei01',
      email: 'chenzhenwei01@company.com'
    },
    department: {
      id: 'product',
      name: '产品部'
    },
    requirement_type: 'feature_optimization',
    priority: 'P1',
    description: '<p><strong>背景：</strong></p><p>目前企业邮箱移动端的搜索功能较为简单，仅支持关键词匹配，无法进行多条件组合搜索。在实际使用中，用户经常需要查找特定发件人、特定时间段内带有附件的邮件，现有功能无法满足这些需求。</p><br><p><strong>需求详情：</strong></p><p>1. 增加高级搜索入口，支持展开/收起</p><p>2. 支持按发件人搜索（支持模糊匹配）</p><p>3. 支持按时间范围搜索（开始日期 - 结束日期）</p><p>4. 支持按附件类型筛选（有附件/无附件/特定类型）</p><p>5. 支持多条件组合搜索</p><p>6. 支持保存常用搜索条件</p><br><p><strong>预期效果：</strong></p><p>提升移动端邮件搜索效率，减少用户查找邮件的时间，提升用户体验。</p>',
    attachments: [
      {
        id: 1,
        file_name: '搜索界面原型.png',
        file_size: 262144,
        download_url: '/api/attachments/1/download'
      },
      {
        id: 2,
        file_name: '需求详细说明.docx',
        file_size: 131072,
        download_url: '/api/attachments/2/download'
      }
    ],
    created_at: '2026-03-27 10:30:00',
    updated_at: '2026-03-27 10:30:00',
    status: 'submitted'
  }
};

// 导出 Mock 数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockData;
}
