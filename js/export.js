/**
 * 数据导出
 * 内部产品需求反馈工具 - 导出模块
 */

const ExportHandler = {
  // 导出状态
  state: {
    scope: 'filtered', // all | filtered
    fields: [],
    isExporting: false
  },
  
  // 元素引用
  elements: {},
  
  /**
   * 初始化
   */
  init() {
    this.cacheElements();
    this.bindEvents();
    this.checkPermission();
  },
  
  /**
   * 缓存元素
   */
  cacheElements() {
    this.elements = {
      modal: document.getElementById('exportModal'),
      exportForm: document.getElementById('exportForm'),
      progressSection: document.getElementById('progressSection'),
      successSection: document.getElementById('successSection'),
      modalFooter: document.getElementById('modalFooter'),
      progressBar: document.getElementById('progressBar'),
      progressText: document.getElementById('progressText'),
      exportBtn: document.getElementById('exportBtn')
    };
  },
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 导出范围单选
    document.querySelectorAll('input[name="exportScope"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.state.scope = e.target.value;
        document.querySelectorAll('input[name="exportScope"]').forEach(r => {
          r.closest('.radio-item').classList.remove('selected');
        });
        e.target.closest('.radio-item').classList.add('selected');
      });
    });
    
    // 点击遮罩关闭
    if (this.elements.modal) {
      this.elements.modal.addEventListener('click', (e) => {
        if (e.target === this.elements.modal) {
          this.closeModal();
        }
      });
    }
    
    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  },
  
  /**
   * 检查导出权限
   */
  checkPermission() {
    const userInfo = Utils.storage.get(Config.STORAGE_KEYS.USER_INFO);
    const isAdmin = userInfo?.role === 'admin' || userInfo?.is_product_manager;
    
    if (!isAdmin) {
      Utils.toast('您没有权限导出数据', 'error');
      setTimeout(() => {
        window.history.back();
      }, 1500);
    }
  },
  
  /**
   * 全选字段
   */
  selectAllFields() {
    document.querySelectorAll('input[name="fields"]').forEach(checkbox => {
      checkbox.checked = true;
    });
  },
  
  /**
   * 取消全选
   */
  deselectAllFields() {
    document.querySelectorAll('input[name="fields"]').forEach(checkbox => {
      checkbox.checked = false;
    });
  },
  
  /**
   * 开始导出
   */
  async startExport() {
    // 验证至少选择一个字段
    const selectedFields = document.querySelectorAll('input[name="fields"]:checked');
    if (selectedFields.length === 0) {
      Utils.toast('请至少选择一个导出字段', 'warning');
      return;
    }
    
    this.state.fields = Array.from(selectedFields).map(cb => cb.value);
    
    // 隐藏表单和底部
    if (this.elements.exportForm) {
      this.elements.exportForm.style.display = 'none';
    }
    if (this.elements.modalFooter) {
      this.elements.modalFooter.style.display = 'none';
    }
    
    // 显示进度
    if (this.elements.progressSection) {
      this.elements.progressSection.classList.add('show');
    }
    
    // 模拟进度
    let progress = 0;
    const updateProgress = () => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        this.finishExport();
      } else {
        if (this.elements.progressBar) {
          this.elements.progressBar.style.width = progress + '%';
        }
        if (this.elements.progressText) {
          this.elements.progressText.textContent = `生成中... ${Math.round(progress)}%`;
        }
        setTimeout(updateProgress, 300);
      }
    };
    
    updateProgress();
  },
  
  /**
   * 完成导出
   */
  async finishExport() {
    try {
      // 等待一下再显示成功
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 隐藏进度
      if (this.elements.progressSection) {
        this.elements.progressSection.classList.remove('show');
      }
      
      // 显示成功
      if (this.elements.successSection) {
        this.elements.successSection.classList.add('show');
      }
      
      // 更新下载信息
      const now = new Date();
      const filename = `需求反馈_${Utils.formatDateTime(now, 'YYYYMMDDHHmmss')}.xlsx`;
      const downloadName = document.querySelector('.download-name');
      const downloadMeta = document.querySelector('.download-meta');
      
      if (downloadName) {
        downloadName.textContent = filename;
      }
      if (downloadMeta) {
        const count = this.state.scope === 'all' ? 2458 : 158;
        downloadMeta.textContent = `${count}条记录 · 256 KB`;
      }
      
    } catch (error) {
      console.error('Export failed:', error);
      Utils.toast('导出失败，请重试', 'error');
      this.resetModal();
    }
  },
  
  /**
   * 下载文件
   */
  async downloadFile() {
    try {
      const closeLoading = Utils.showLoading('准备下载...');
      
      if (typeof MockData !== 'undefined') {
        // Mock 模式 - 生成示例 Excel
        await new Promise(resolve => setTimeout(resolve, 1000));
        // 实际项目中这里会调用后端 API 获取文件
        Utils.toast('演示模式：实际项目中将下载 Excel 文件', 'info');
      } else {
        // API 模式
        const result = await Api.exportRequirements({
          export_scope: this.state.scope,
          fields: this.state.fields
        });
        
        if (result.data?.download_url) {
          // 下载文件
          const response = await fetch(result.data.download_url);
          const blob = await response.blob();
          Utils.downloadFile(blob, result.data.file_name);
        }
      }
      
      closeLoading();
      Utils.toast('下载已开始', 'success');
      
    } catch (error) {
      console.error('Download failed:', error);
      Utils.toast('下载失败', 'error');
    }
  },
  
  /**
   * 关闭弹窗
   */
  closeModal() {
    this.resetModal();
    // 返回列表页
    window.location.href = 'list.html';
  },
  
  /**
   * 重置弹窗状态
   */
  resetModal() {
    if (this.elements.exportForm) {
      this.elements.exportForm.style.display = 'block';
    }
    if (this.elements.modalFooter) {
      this.elements.modalFooter.style.display = 'flex';
    }
    if (this.elements.progressSection) {
      this.elements.progressSection.classList.remove('show');
    }
    if (this.elements.successSection) {
      this.elements.successSection.classList.remove('show');
    }
    if (this.elements.progressBar) {
      this.elements.progressBar.style.width = '0%';
    }
    if (this.elements.progressText) {
      this.elements.progressText.textContent = '准备中... 0%';
    }
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  ExportHandler.init();
});

// 导出全局函数
window.selectAllFields = () => ExportHandler.selectAllFields();
window.deselectAllFields = () => ExportHandler.deselectAllFields();
window.startExport = () => ExportHandler.startExport();
window.downloadFile = () => ExportHandler.downloadFile();
window.closeModal = () => ExportHandler.closeModal();
