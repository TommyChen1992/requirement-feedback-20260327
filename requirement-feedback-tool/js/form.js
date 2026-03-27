/**
 * 表单验证与提交
 * 内部产品需求反馈工具 - 表单模块
 */

const FormHandler = {
  // 当前上传的文件
  uploadedFiles: [],
  
  // 表单元素引用
  elements: {},
  
  /**
   * 初始化表单
   */
  init() {
    this.cacheElements();
    this.bindEvents();
    this.loadUserinfo();
    this.loadDepartments();
    this.loadDraft();
  },
  
  /**
   * 缓存表单元素
   */
  cacheElements() {
    this.elements = {
      form: document.getElementById('requirementForm'),
      department: document.getElementById('department'),
      requirementType: document.querySelectorAll('input[name="requirementType"]'),
      priority: document.querySelectorAll('input[name="priority"]'),
      editor: document.getElementById('editor'),
      charCount: document.getElementById('charCount'),
      uploadArea: document.getElementById('uploadArea'),
      fileInput: document.getElementById('fileInput'),
      fileList: document.getElementById('fileList'),
      successModal: document.getElementById('successModal'),
      requirementNo: document.getElementById('requirementNo')
    };
  },
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 表单提交
    if (this.elements.form) {
      this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    // 单选按钮样式
    document.querySelectorAll('.radio-item').forEach(item => {
      item.addEventListener('click', function() {
        const input = this.querySelector('input[type="radio"]');
        if (input) {
          const name = input.name;
          document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
            radio.closest('.radio-item').classList.remove('selected');
          });
          this.classList.add('selected');
          input.checked = true;
        }
      });
    });
    
    // 富文本编辑器字数统计
    if (this.elements.editor && this.elements.charCount) {
      this.elements.editor.addEventListener('input', () => this.handleEditorInput());
    }
    
    // 附件上传
    if (this.elements.uploadArea && this.elements.fileInput) {
      this.bindUploadEvents();
    }
  },
  
  /**
   * 绑定上传事件
   */
  bindUploadEvents() {
    const { uploadArea, fileInput } = this.elements;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      this.handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
      fileInput.value = ''; // 重置以便重复选择同一文件
    });
  },
  
  /**
   * 加载用户信息
   */
  async loadUserinfo() {
    const userInfo = Utils.storage.get(Config.STORAGE_KEYS.USER_INFO);
    if (userInfo) {
      const userNameInput = document.querySelector('input[name="userName"]');
      if (userNameInput) {
        userNameInput.value = userInfo.name;
      }
    }
  },
  
  /**
   * 加载部门列表
   */
  async loadDepartments() {
    try {
      // 优先从 Mock 数据加载
      let departments = [];
      
      if (typeof MockData !== 'undefined' && MockData.departments) {
        departments = MockData.departments;
      } else {
        // 调用 API
        const response = await Api.getDepartments();
        departments = response.data || [];
      }
      
      this.renderDepartmentOptions(departments);
    } catch (error) {
      console.error('Load departments failed:', error);
      // 使用默认部门列表
      this.renderDefaultDepartments();
    }
  },
  
  /**
   * 渲染部门选项
   */
  renderDepartmentOptions(departments) {
    const select = this.elements.department;
    if (!select) return;
    
    // 清空现有选项（保留第一个）
    select.innerHTML = '<option value="">请选择部门</option>';
    
    departments.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept.id;
      option.textContent = dept.name;
      select.appendChild(option);
      
      // 递归添加子部门
      if (dept.children && dept.children.length > 0) {
        dept.children.forEach(child => {
          const childOption = document.createElement('option');
          childOption.value = child.id;
          childOption.textContent = '  └─ ' + child.name;
          select.appendChild(childOption);
        });
      }
    });
    
    // 自动填充用户部门
    const userInfo = Utils.storage.get(Config.STORAGE_KEYS.USER_INFO);
    if (userInfo && userInfo.department) {
      select.value = userInfo.department.id;
    }
  },
  
  /**
   * 渲染默认部门
   */
  renderDefaultDepartments() {
    const select = this.elements.department;
    if (!select) return;
    
    const defaultDepts = [
      { value: 'product', label: '产品部' },
      { value: 'development', label: '研发部' },
      { value: 'design', label: '设计部' },
      { value: 'operation', label: '运营部' },
      { value: 'sales', label: '销售部' },
      { value: 'service', label: '客服部' },
      { value: 'hr', label: '人力资源部' },
      { value: 'finance', label: '财务部' },
      { value: 'other', label: '其他' }
    ];
    
    select.innerHTML = '<option value="">请选择部门</option>';
    defaultDepts.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept.value;
      option.textContent = dept.label;
      select.appendChild(option);
    });
  },
  
  /**
   * 加载草稿
   */
  loadDraft() {
    const draft = Utils.storage.get(Config.STORAGE_KEYS.FORM_DRAFT);
    if (draft) {
      if (this.elements.department && draft.departmentId) {
        this.elements.department.value = draft.departmentId;
      }
      if (this.elements.editor && draft.description) {
        this.elements.editor.innerHTML = draft.description;
        this.handleEditorInput();
      }
      // 可以添加更多字段的恢复逻辑
    }
  },
  
  /**
   * 保存草稿
   */
  saveDraft() {
    const draft = {
      departmentId: this.elements.department?.value,
      description: this.elements.editor?.innerHTML,
      savedAt: new Date().toISOString()
    };
    Utils.storage.set(Config.STORAGE_KEYS.FORM_DRAFT, draft);
  },
  
  /**
   * 处理编辑器输入
   */
  handleEditorInput() {
    const { editor, charCount } = this.elements;
    if (!editor || !charCount) return;
    
    const text = editor.innerText || '';
    const length = text.length;
    
    charCount.textContent = length;
    
    // 更新字数提示样式
    charCount.classList.remove('warning', 'error');
    if (length > Config.EDITOR.MAX_LENGTH) {
      charCount.classList.add('error');
    } else if (length > Config.EDITOR.MAX_LENGTH * 0.9) {
      charCount.classList.add('warning');
    }
    
    // 自动保存草稿（防抖）
    Utils.debounce(() => this.saveDraft(), 1000)();
  },
  
  /**
   * 处理文件上传
   */
  handleFiles(files) {
    for (let file of files) {
      if (this.uploadedFiles.length >= Config.UPLOAD.MAX_FILE_COUNT) {
        Utils.toast('最多可上传 5 个附件', 'warning');
        break;
      }
      
      if (file.size > Config.UPLOAD.MAX_FILE_SIZE) {
        Utils.toast(`文件"${file.name}"超过 10MB，无法上传`, 'error');
        continue;
      }
      
      if (!this.isValidFileType(file)) {
        Utils.toast(`不支持的文件格式：${file.name}`, 'error');
        continue;
      }
      
      this.uploadedFiles.push(file);
    }
    
    this.renderFileList();
  },
  
  /**
   * 验证文件类型
   */
  isValidFileType(file) {
    const allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.gif',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx'
    ];
    
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    return allowedExtensions.includes(ext);
  },
  
  /**
   * 渲染文件列表
   */
  renderFileList() {
    const { fileList } = this.elements;
    if (!fileList) return;
    
    fileList.innerHTML = '';
    
    this.uploadedFiles.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <div class="file-icon">${this.getFileIcon(file.name)}</div>
        <div class="file-info">
          <div class="file-name" title="${file.name}">${file.name}</div>
          <div class="file-size">${Utils.formatFileSize(file.size)}</div>
        </div>
        <button type="button" class="file-delete" onclick="FormHandler.deleteFile(${index})">删除</button>
      `;
      fileList.appendChild(fileItem);
    });
  },
  
  /**
   * 获取文件图标
   */
  getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
      'pdf': '📕',
      'doc': '📘', 'docx': '📘',
      'xls': '📗', 'xlsx': '📗'
    };
    return icons[ext] || '📄';
  },
  
  /**
   * 删除文件
   */
  deleteFile(index) {
    this.uploadedFiles.splice(index, 1);
    this.renderFileList();
  },
  
  /**
   * 表单验证
   */
  validateForm() {
    let isValid = true;
    
    // 验证部门
    const departmentGroup = document.getElementById('departmentGroup');
    if (this.elements.department && !this.elements.department.value) {
      if (departmentGroup) departmentGroup.classList.add('error');
      isValid = false;
    } else if (departmentGroup) {
      departmentGroup.classList.remove('error');
    }
    
    // 验证需求类型
    const typeGroup = document.getElementById('typeGroup');
    const selectedType = document.querySelector('input[name="requirementType"]:checked');
    if (!selectedType) {
      if (typeGroup) typeGroup.classList.add('error');
      isValid = false;
    } else if (typeGroup) {
      typeGroup.classList.remove('error');
    }
    
    // 验证优先级
    const priorityGroup = document.getElementById('priorityGroup');
    const selectedPriority = document.querySelector('input[name="priority"]:checked');
    if (!selectedPriority) {
      if (priorityGroup) priorityGroup.classList.add('error');
      isValid = false;
    } else if (priorityGroup) {
      priorityGroup.classList.remove('error');
    }
    
    // 验证需求描述
    const descriptionGroup = document.getElementById('descriptionGroup');
    const description = this.elements.editor?.innerText || '';
    if (description.length < Config.EDITOR.MIN_LENGTH || description.length > Config.EDITOR.MAX_LENGTH) {
      if (descriptionGroup) descriptionGroup.classList.add('error');
      isValid = false;
    } else if (descriptionGroup) {
      descriptionGroup.classList.remove('error');
    }
    
    if (!isValid) {
      Utils.toast('请完善表单信息', 'error');
    }
    
    return isValid;
  },
  
  /**
   * 处理表单提交
   */
  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }
    
    const closeLoading = Utils.showLoading('提交中...');
    
    try {
      // 构建 FormData
      const formData = new FormData();
      formData.append('department_id', this.elements.department.value);
      formData.append('department_name', this.elements.department.options[this.elements.department.selectedIndex].text);
      formData.append('requirement_type', document.querySelector('input[name="requirementType"]:checked').value);
      formData.append('priority', document.querySelector('input[name="priority"]:checked').value);
      formData.append('description', this.elements.editor.innerHTML);
      
      // 添加附件
      this.uploadedFiles.forEach(file => {
        formData.append('attachments', file);
      });
      
      // 提交
      let result;
      if (typeof MockData !== 'undefined') {
        // Mock 模式
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = {
          code: 200,
          data: {
            id: Date.now(),
            requirement_no: Utils.generateRequirementNo(1),
            created_at: Utils.formatDateTime(new Date())
          },
          message: '提交成功'
        };
      } else {
        // API 模式
        result = await Api.submitRequirement(formData);
      }
      
      // 清除草稿
      Utils.storage.remove(Config.STORAGE_KEYS.FORM_DRAFT);
      
      // 显示成功弹窗
      this.showSuccess(result.data.requirement_no);
      
    } catch (error) {
      console.error('Submit failed:', error);
      Utils.toast(error.message || '提交失败，请重试', 'error');
    } finally {
      closeLoading();
    }
  },
  
  /**
   * 显示成功弹窗
   */
  showSuccess(requirementNo) {
    if (this.elements.requirementNo) {
      this.elements.requirementNo.textContent = requirementNo;
    }
    if (this.elements.successModal) {
      this.elements.successModal.classList.add('active');
    }
  },
  
  /**
   * 关闭成功弹窗
   */
  closeModal() {
    if (this.elements.successModal) {
      this.elements.successModal.classList.remove('active');
    }
    this.resetForm();
    // 跳转到列表页
    window.location.href = 'list.html';
  },
  
  /**
   * 重置表单
   */
  resetForm() {
    if (this.elements.form) {
      this.elements.form.reset();
    }
    if (this.elements.editor) {
      this.elements.editor.innerHTML = '';
      this.handleEditorInput();
    }
    this.uploadedFiles = [];
    this.renderFileList();
    
    // 清除错误状态
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('error');
    });
    
    // 重置单选样式
    document.querySelectorAll('.radio-item').forEach(item => {
      item.classList.remove('selected');
    });
    const defaultPriority = document.querySelector('input[name="priority"][value="P2"]');
    if (defaultPriority) {
      defaultPriority.closest('.radio-item').classList.add('selected');
    }
  },
  
  /**
   * 复制需求编号
   */
  async copyRequirementNo() {
    const no = this.elements.requirementNo?.textContent;
    if (!no) return;
    
    const success = await Utils.copyToClipboard(no);
    if (success) {
      Utils.toast('已复制到剪贴板', 'success');
    } else {
      Utils.toast('复制失败', 'error');
    }
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  FormHandler.init();
});

// 导出全局函数
window.resetForm = () => FormHandler.resetForm();
window.closeModal = () => FormHandler.closeModal();
window.copyRequirementNo = () => FormHandler.copyRequirementNo();
window.formatText = (command, value = null) => {
  document.execCommand(command, false, value);
  FormHandler.elements.editor?.focus();
};
