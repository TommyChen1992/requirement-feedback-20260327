/**
 * API 接口封装
 * 内部产品需求反馈工具 - API 模块
 */

const Api = {
  /**
   * 通用请求方法
   * @param {string} url - 请求地址
   * @param {object} options - 请求选项
   * @returns {Promise<any>}
   */
  async request(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // 添加认证 token
    const token = localStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(`${Config.API_BASE_URL}${url}`, mergedOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  /**
   * 文件上传请求
   * @param {string} url - 请求地址
   * @param {FormData} formData - 表单数据
   * @param {function} onProgress - 进度回调
   * @returns {Promise<any>}
   */
  async upload(url, formData, onProgress = null) {
    const token = localStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
    
    const options = {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    };

    try {
      const response = await fetch(`${Config.API_BASE_URL}${url}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Upload failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  },

  // ==================== 认证接口 ====================

  /**
   * SSO 登录
   * @param {string} ticket - SSO 票据
   * @param {string} redirectUri - 回调地址
   * @returns {Promise<any>}
   */
  async ssoLogin(ticket, redirectUri) {
    return this.request('/auth/sso', {
      method: 'POST',
      body: JSON.stringify({ ticket, redirect_uri: redirectUri }),
    });
  },

  /**
   * 登出
   * @returns {Promise<any>}
   */
  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  },

  // ==================== 需求接口 ====================

  /**
   * 提交需求
   * @param {FormData} formData - 需求表单数据
   * @returns {Promise<any>}
   */
  async submitRequirement(formData) {
    const token = localStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
    
    try {
      const response = await fetch(`${Config.API_BASE_URL}/requirements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '提交失败');
      }

      return data;
    } catch (error) {
      console.error('Submit requirement failed:', error);
      throw error;
    }
  },

  /**
   * 获取需求列表
   * @param {object} params - 查询参数
   * @returns {Promise<any>}
   */
  async getRequirements(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.pageSize) queryParams.append('page_size', params.pageSize);
    if (params.departmentId) {
      (Array.isArray(params.departmentId) ? params.departmentId : [params.departmentId])
        .forEach(id => queryParams.append('department_id', id));
    }
    if (params.requirementType) {
      (Array.isArray(params.requirementType) ? params.requirementType : [params.requirementType])
        .forEach(type => queryParams.append('requirement_type', type));
    }
    if (params.priority) {
      (Array.isArray(params.priority) ? params.priority : [params.priority])
        .forEach(p => queryParams.append('priority', p));
    }
    if (params.startDate) queryParams.append('start_date', params.startDate);
    if (params.endDate) queryParams.append('end_date', params.endDate);
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.sortBy) queryParams.append('sort_by', params.sortBy);
    if (params.sortOrder) queryParams.append('sort_order', params.sortOrder);

    return this.request(`/requirements?${queryParams.toString()}`);
  },

  /**
   * 获取需求详情
   * @param {string|number} id - 需求 ID
   * @returns {Promise<any>}
   */
  async getRequirementDetail(id) {
    return this.request(`/requirements/${id}`);
  },

  /**
   * 更新需求
   * @param {string|number} id - 需求 ID
   * @param {object} data - 更新数据
   * @returns {Promise<any>}
   */
  async updateRequirement(id, data) {
    return this.request(`/requirements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * 删除需求
   * @param {string|number} id - 需求 ID
   * @returns {Promise<any>}
   */
  async deleteRequirement(id) {
    return this.request(`/requirements/${id}`, {
      method: 'DELETE',
    });
  },

  // ==================== 附件接口 ====================

  /**
   * 上传附件
   * @param {File} file - 文件对象
   * @param {function} onProgress - 进度回调
   * @returns {Promise<any>}
   */
  async uploadAttachment(file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.upload('/attachments/upload', formData, onProgress);
  },

  /**
   * 下载附件
   * @param {string|number} id - 附件 ID
   * @returns {Promise<Blob>}
   */
  async downloadAttachment(id) {
    const token = localStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
    
    const response = await fetch(`${Config.API_BASE_URL}/attachments/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('下载失败');
    }

    return response.blob();
  },

  /**
   * 删除附件
   * @param {string|number} id - 附件 ID
   * @returns {Promise<any>}
   */
  async deleteAttachment(id) {
    return this.request(`/attachments/${id}`, {
      method: 'DELETE',
    });
  },

  // ==================== 评论接口 ====================

  /**
   * 获取评论列表
   * @param {string|number} requirementId - 需求 ID
   * @returns {Promise<any>}
   */
  async getComments(requirementId) {
    return this.request(`/requirements/${requirementId}/comments`);
  },

  /**
   * 发表评论
   * @param {string|number} requirementId - 需求 ID
   * @param {string} content - 评论内容
   * @param {array} mentions - @提及的用户列表
   * @returns {Promise<any>}
   */
  async submitComment(requirementId, content, mentions = []) {
    return this.request(`/requirements/${requirementId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, mentions }),
    });
  },

  /**
   * 更新评论
   * @param {string|number} commentId - 评论 ID
   * @param {string} content - 新内容
   * @returns {Promise<any>}
   */
  async updateComment(commentId, content) {
    return this.request(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  /**
   * 删除评论
   * @param {string|number} commentId - 评论 ID
   * @returns {Promise<any>}
   */
  async deleteComment(commentId) {
    return this.request(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  // ==================== 导出接口 ====================

  /**
   * 导出数据
   * @param {object} params - 导出参数
   * @returns {Promise<any>}
   */
  async exportRequirements(params) {
    return this.request('/requirements/export', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // ==================== 部门接口 ====================

  /**
   * 获取部门列表
   * @returns {Promise<any>}
   */
  async getDepartments() {
    return this.request('/departments');
  },
};

// 导出 API
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Api;
}
