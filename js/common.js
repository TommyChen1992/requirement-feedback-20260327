/**
 * 公共工具函数
 * 内部产品需求反馈工具 - 通用工具
 */

const Utils = {
  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  },

  /**
   * 格式化日期时间
   * @param {Date|string|number} date - 日期
   * @param {string} format - 格式
   * @returns {string}
   */
  formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 格式化相对时间
   * @param {Date|string|number} date - 日期
   * @returns {string}
   */
  formatRelativeTime(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    if (diff < minute) return '刚刚';
    if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
    if (diff < day) return `${Math.floor(diff / hour)}小时前`;
    if (diff < week) return `${Math.floor(diff / day)}天前`;
    
    return this.formatDateTime(d, 'YYYY-MM-DD');
  },

  /**
   * 生成需求编号
   * @param {number} sequence - 当日序号
   * @returns {string}
   */
  generateRequirementNo(sequence) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seqStr = String(sequence).padStart(3, '0');
    return `REQ-${dateStr}-${seqStr}`;
  },

  /**
   * 获取用户姓名首字
   * @param {string} name - 姓名
   * @returns {string}
   */
  getNameInitial(name) {
    if (!name) return '?';
    return name.charAt(0);
  },

  /**
   * 防抖函数
   * @param {function} func - 函数
   * @param {number} wait - 等待时间
   * @returns {function}
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * 节流函数
   * @param {function} func - 函数
   * @param {number} limit - 限制时间
   * @returns {function}
   */
  throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * 复制到剪贴板
   * @param {string} text - 文本
   * @returns {Promise<boolean>}
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        return true;
      } catch (e) {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  },

  /**
   * 下载文件
   * @param {Blob} blob - 文件内容
   * @param {string} filename - 文件名
   */
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * 获取 URL 参数
   * @param {string} name - 参数名
   * @returns {string|null}
   */
  getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

  /**
   * 设置 URL 参数
   * @param {string} name - 参数名
   * @param {string} value - 参数值
   */
  setUrlParam(name, value) {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  },

  /**
   * 本地存储操作
   */
  storage: {
    get(key) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Storage set error:', e);
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Storage remove error:', e);
      }
    },
    clear() {
      try {
        localStorage.clear();
      } catch (e) {
        console.error('Storage clear error:', e);
      }
    }
  },

  /**
   * 验证邮箱
   * @param {string} email - 邮箱地址
   * @returns {boolean}
   */
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * 验证手机号
   * @param {string} phone - 手机号
   * @returns {boolean}
   */
  isValidPhone(phone) {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
  },

  /**
   * 去除 HTML 标签
   * @param {string} html - HTML 字符串
   * @returns {string}
   */
  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },

  /**
   * 转义 HTML
   * @param {string} str - 字符串
   * @returns {string}
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * 高亮文本
   * @param {string} text - 原文本
   * @param {string} keyword - 关键词
   * @returns {string}
   */
  highlightText(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  },

  /**
   * 截断文本
   * @param {string} text - 文本
   * @param {number} length - 长度
   * @param {string} suffix - 后缀
   * @returns {string}
   */
  truncate(text, length = 50, suffix = '...') {
    if (!text || text.length <= length) return text;
    return text.slice(0, length) + suffix;
  },

  /**
   * 显示 Toast 提示
   * @param {string} message - 消息
   * @param {string} type - 类型 (success/error/warning/info)
   * @param {number} duration - 持续时间
   */
  toast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      border-radius: 4px;
      color: white;
      font-size: 14px;
      z-index: 9999;
      background: ${type === 'success' ? '#52c41a' : type === 'error' ? '#dc3545' : type === 'warning' ? '#faad14' : '#0d6efd'};
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * 显示加载提示
   * @param {string} message - 消息
   * @returns {function} 关闭函数
   */
  showLoading(message = '加载中...') {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9998;
      ">
        <div style="
          background: white;
          padding: 24px 32px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        ">
          <div style="
            width: 32px;
            height: 32px;
            border: 3px solid #e0e0e0;
            border-top-color: #c91623;
            border-radius: 50%;
            margin: 0 auto 12px;
            animation: spin 1s linear infinite;
          "></div>
          <div style="font-size: 14px; color: #333;">${message}</div>
        </div>
      </div>
    `;
    document.body.appendChild(loading);
    
    return () => loading.remove();
  },

  /**
   * 确认对话框
   * @param {string} message - 消息
   * @returns {Promise<boolean>}
   */
  confirm(message) {
    return new Promise((resolve) => {
      const result = window.confirm(message);
      resolve(result);
    });
  },

  /**
   * 解析 HTML 字符串为 DOM
   * @param {string} html - HTML 字符串
   * @returns {DocumentFragment}
   */
  parseHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content;
  },

  /**
   * 加载 HTML 组件
   * @param {string} url - 组件 URL
   * @param {string} selector - 目标选择器
   */
  async loadComponent(url, selector) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const element = document.querySelector(selector);
      if (element) {
        element.innerHTML = html;
      }
    } catch (error) {
      console.error('Load component failed:', error);
    }
  }
};

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// 导出工具
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
