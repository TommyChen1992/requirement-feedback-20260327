# 内部产品需求反馈工具 - 前端项目

## 项目简介

内部产品需求反馈工具是一款面向企业内部的产品需求收集和管理系统，帮助员工便捷地提交产品改进建议，产品团队高效地管理和处理需求反馈。

## 技术栈

- **原生 HTML/CSS/JavaScript** - 无需框架，降低学习成本
- **CSS 变量** - 管理主题色和样式
- **Fetch API** - 进行网络请求
- **LocalStorage** - 存储本地状态

## 项目结构

```
requirement-feedback-tool/
├── index.html              # 需求提交页
├── list.html               # 需求列表页
├── detail.html             # 需求详情页
├── export-modal.html       # 数据导出弹窗
├── css/
│   ├── common.css          # 公共样式
│   ├── form.css            # 表单样式
│   ├── list.css            # 列表样式
│   └── comment.css         # 评论样式
├── js/
│   ├── common.js           # 公共工具函数
│   ├── form.js             # 表单验证与提交
│   ├── list.js             # 列表筛选与搜索
│   ├── comment.js          # 评论互动
│   └── export.js           # 数据导出
├── components/
│   ├── header.html         # 页面头部组件
│   ├── filter.html         # 筛选组件
│   └── export-modal.html   # 导出弹窗组件
├── api/
│   └── index.js            # API 接口封装
├── config/
│   └── index.js            # 配置项
├── mock/
│   └── data.js             # Mock 数据（本地开发用）
└── README.md               # 项目说明
```

## 快速开始

### 本地开发（使用 Mock 数据）

1. 直接用浏览器打开 `index.html` 即可开始使用
2. 所有数据使用 `mock/data.js` 中的模拟数据
3. 无需后端服务，适合前端开发和演示

```bash
# 或使用任意静态文件服务器
npx http-server ./requirement-feedback-tool
# 访问 http://localhost:8080
```

### 生产部署（对接真实 API）

1. 修改 `config/index.js` 中的 `API_BASE_URL` 为实际后端地址
2. 确保后端 API 接口已就绪（参考 PRD 第 6 节接口定义）
3. 部署到 Web 服务器（Nginx/Apache 等）

```javascript
// config/index.js
const Config = {
  API_BASE_URL: 'https://your-api-server.com/api',
  // ...
};
```

## 功能模块

### 1. 需求提交（index.html）

- 企业 SSO 登录（模拟接口）
- 表单自动填充（反馈人、部门）
- 需求类型选择（功能优化/Bug 修复/新需求/体验优化/其他）
- 优先级选择（P0/P1/P2/P3）
- 富文本编辑器（支持加粗、斜体、列表等）
- 附件上传（拖拽上传，最多 5 个，单文件≤10MB）
- 表单验证（必填项、字数限制、文件格式）
- 提交成功后生成需求编号

### 2. 需求列表（list.html）

- 需求列表展示（分页，每页 20 条）
- 多条件筛选（部门、类型、优先级、时间范围）
- 关键词搜索（需求描述、反馈人、编号）
- 列表排序（按提交时间、优先级等）
- 数据导出（仅产品管理员可见）

### 3. 需求详情（detail.html）

- 需求完整信息展示
- 附件预览与下载
- 评论互动（发表评论、@提及、编辑删除）
- 权限控制（仅提交人和产品管理员可见）

### 4. 数据导出（export-modal.html）

- 导出范围选择（全部数据/筛选结果）
- 导出字段选择
- Excel 文件生成与下载
- 导出限制提示（10000 条上限、频率限制）

## API 接口

项目已封装完整的 API 接口模块（`api/index.js`），包含：

| 接口 | 方法 | 说明 |
|-----|------|------|
| /api/auth/sso | POST | SSO 登录 |
| /api/auth/logout | POST | 登出 |
| /api/requirements | POST | 提交需求 |
| /api/requirements | GET | 获取需求列表 |
| /api/requirements/:id | GET | 获取需求详情 |
| /api/requirements/:id | PUT | 更新需求 |
| /api/requirements/:id | DELETE | 删除需求 |
| /api/requirements/export | POST | 导出数据 |
| /api/attachments/upload | POST | 上传附件 |
| /api/attachments/:id/download | GET | 下载附件 |
| /api/attachments/:id | DELETE | 删除附件 |
| /api/requirements/:id/comments | GET | 获取评论列表 |
| /api/requirements/:id/comments | POST | 发表评论 |
| /api/comments/:id | PUT | 更新评论 |
| /api/comments/:id | DELETE | 删除评论 |
| /api/departments | GET | 获取部门列表 |

## 配置说明

### config/index.js

```javascript
const Config = {
  API_BASE_URL: '/api',           // API 基础地址
  
  APP: {
    PAGE_SIZE: 20,                // 每页显示条数
    MAX_EXPORT_COUNT: 10000,      // 最大导出条数
    EXPORT_COOLDOWN: 60           // 导出频率限制（秒）
  },
  
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024,  // 单文件最大 10MB
    MAX_FILE_COUNT: 5,                // 最多 5 个文件
    ALLOWED_TYPES: [...]              // 允许的文件类型
  },
  
  EDITOR: {
    MIN_LENGTH: 20,               // 需求描述最小字数
    MAX_LENGTH: 5000,             // 需求描述最大字数
    COMMENT_MIN_LENGTH: 5         // 评论最小字数
  }
};
```

## 本地存储

使用 LocalStorage 存储以下数据：

| 键名 | 说明 |
|-----|------|
| rft_user_info | 用户信息 |
| rft_auth_token | 认证 Token |
| rft_filter_state | 筛选条件状态 |
| rft_form_draft | 表单草稿 |
| rft_current_requirement | 当前查看的需求 |

## 浏览器兼容性

| 浏览器 | 版本要求 |
|-------|---------|
| Chrome | 90+ |
| Edge | 90+ |
| Safari | 14+ |
| Firefox | 88+ |

## 开发规范

### 代码风格

- 使用 ES6+ 语法
- 函数命名采用驼峰式
- 常量命名采用大写下划线
- 注释完整，关键逻辑必有注释

### 错误处理

- API 请求统一捕获错误
- 表单验证友好提示
- 网络异常降级处理

### 性能优化

- 列表数据分页加载
- 图片懒加载（如需）
- 防抖节流优化频繁操作

## 部署说明

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/requirement-feedback-tool;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend-server:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 后续优化建议

1. **引入构建工具** - 使用 Webpack/Vite 进行代码打包和优化
2. **TypeScript 支持** - 增强代码类型安全
3. **单元测试** - 使用 Jest 编写测试用例
4. **E2E 测试** - 使用 Cypress 进行端到端测试
5. **性能监控** - 接入前端性能监控平台
6. **国际化支持** - 多语言切换

## 问题反馈

如有问题或建议，请联系产品团队。

---

**版本：** 1.0.0  
**更新日期：** 2026-03-27  
**维护团队：** 产品技术部
