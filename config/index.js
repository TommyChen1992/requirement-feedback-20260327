/**
 * 配置项
 * 内部产品需求反馈工具 - 前端配置
 */

const Config = {
  // API 基础地址
  API_BASE_URL: '/api',
  
  // 应用配置
  APP: {
    NAME: '内部产品需求反馈工具',
    VERSION: '1.0.0',
    // 每页显示条数
    PAGE_SIZE: 20,
    // 最大导出条数
    MAX_EXPORT_COUNT: 10000,
    // 导出频率限制（秒）
    EXPORT_COOLDOWN: 60
  },
  
  // 文件上传配置
  UPLOAD: {
    // 单文件最大大小（10MB）
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    // 最大文件数量
    MAX_FILE_COUNT: 5,
    // 允许的文件类型
    ALLOWED_TYPES: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    // 文件扩展名映射
    EXTENSIONS: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  },
  
  // 需求类型
  REQUIREMENT_TYPES: {
    FEATURE_OPTIMIZATION: { value: 'feature_optimization', label: '功能优化' },
    BUG_FIX: { value: 'bug_fix', label: 'Bug 修复' },
    NEW_FEATURE: { value: 'new_feature', label: '新需求' },
    EXPERIENCE_OPTIMIZATION: { value: 'experience_optimization', label: '体验优化' },
    OTHER: { value: 'other', label: '其他' }
  },
  
  // 优先级配置
  PRIORITIES: {
    P0: { value: 'P0', label: '紧急', color: '#dc3545', responseTime: '24 小时内响应' },
    P1: { value: 'P1', label: '高', color: '#fd7e14', responseTime: '3 个工作日内响应' },
    P2: { value: 'P2', label: '中', color: '#0d6efd', responseTime: '1 周内响应' },
    P3: { value: 'P3', label: '低', color: '#6c757d', responseTime: '2 周内响应' }
  },
  
  // 状态配置
  STATUS: {
    SUBMITTED: { value: 'submitted', label: '已提交' },
    PROCESSING: { value: 'processing', label: '处理中' },
    CLOSED: { value: 'closed', label: '已关闭' }
  },
  
  // 本地存储键名
  STORAGE_KEYS: {
    USER_INFO: 'rft_user_info',
    AUTH_TOKEN: 'rft_auth_token',
    FILTER_STATE: 'rft_filter_state',
    FORM_DRAFT: 'rft_form_draft'
  },
  
  // 富文本编辑器配置
  EDITOR: {
    // 最小字数
    MIN_LENGTH: 20,
    // 最大字数
    MAX_LENGTH: 5000,
    // 评论最小字数
    COMMENT_MIN_LENGTH: 5
  },
  
  // 主题色
  THEME: {
    PRIMARY: '#c91623',
    PRIMARY_HOVER: '#a8121d',
    SUCCESS: '#52c41a',
    WARNING: '#faad14',
    ERROR: '#dc3545',
    BORDER: '#e0e0e0',
    BG_GRAY: '#f5f7fa',
    TEXT_PRIMARY: '#333333',
    TEXT_SECONDARY: '#666666',
    TEXT_PLACEHOLDER: '#999999'
  }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Config;
}
