/**
 * 列表筛选与搜索
 * 内部产品需求反馈工具 - 列表模块
 */

const ListHandler = {
  // 当前状态
  state: {
    page: 1,
    pageSize: Config.APP.PAGE_SIZE,
    total: 0,
    totalPages: 0,
    filters: {
      departmentId: [],
      requirementType: [],
      priority: [],
      startDate: '',
      endDate: '',
      keyword: ''
    },
    sortBy: 'created_at',
    sortOrder: 'desc'
  },
  
  // 数据缓存
  data: [],
  
  /**
   * 初始化
   */
  init() {
    this.loadState();
    this.bindEvents();
    this.loadRequirements();
  },
  
  /**
   * 加载保存的状态
   */
  loadState() {
    const savedState = Utils.storage.get(Config.STORAGE_KEYS.FILTER_STATE);
    if (savedState) {
      this.state = { ...this.state, ...savedState };
      this.applyFiltersToUI();
    }
  },
  
  /**
   * 保存状态
   */
  saveState() {
    Utils.storage.set(Config.STORAGE_KEYS.FILTER_STATE, {
      filters: this.state.filters,
      sortBy: this.state.sortBy,
      sortOrder: this.state.sortOrder
    });
  },
  
  /**
   * 应用筛选条件到 UI
   */
  applyFiltersToUI() {
    const { filters } = this.state;
    
    const deptSelect = document.getElementById('filterDepartment');
    if (deptSelect && filters.departmentId.length > 0) {
      deptSelect.value = filters.departmentId[0];
    }
    
    const typeSelect = document.getElementById('filterType');
    if (typeSelect && filters.requirementType.length > 0) {
      typeSelect.value = filters.requirementType[0];
    }
    
    const prioritySelect = document.getElementById('filterPriority');
    if (prioritySelect && filters.priority.length > 0) {
      prioritySelect.value = filters.priority[0];
    }
    
    const startDateInput = document.getElementById('startDate');
    if (startDateInput && filters.startDate) {
      startDateInput.value = filters.startDate;
    }
    
    const endDateInput = document.getElementById('endDate');
    if (endDateInput && filters.endDate) {
      endDateInput.value = filters.endDate;
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput && filters.keyword) {
      searchInput.value = filters.keyword;
    }
  },
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 筛选条件变化
    document.querySelectorAll('.filter-select, .date-input').forEach(el => {
      el.addEventListener('change', () => {
        this.updateFilters();
        this.loadRequirements();
      });
    });
    
    // 搜索
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchRequirements();
        }
      });
    }
    
    // 排序
    document.querySelectorAll('.data-table th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (field) {
          this.toggleSort(field);
        }
      });
    });
  },
  
  /**
   * 更新筛选条件
   */
  updateFilters() {
    const deptSelect = document.getElementById('filterDepartment');
    const typeSelect = document.getElementById('filterType');
    const prioritySelect = document.getElementById('filterPriority');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    this.state.filters = {
      departmentId: deptSelect?.value ? [deptSelect.value] : [],
      requirementType: typeSelect?.value ? [typeSelect.value] : [],
      priority: prioritySelect?.value ? [prioritySelect.value] : [],
      startDate: startDateInput?.value || '',
      endDate: endDateInput?.value || '',
      keyword: this.state.filters.keyword
    };
    
    this.saveState();
  },
  
  /**
   * 搜索
   */
  searchRequirements() {
    const searchInput = document.getElementById('searchInput');
    this.state.filters.keyword = searchInput?.value?.trim() || '';
    this.state.page = 1;
    this.saveState();
    this.loadRequirements();
  },
  
  /**
   * 重置筛选
   */
  resetFilters() {
    const deptSelect = document.getElementById('filterDepartment');
    const typeSelect = document.getElementById('filterType');
    const prioritySelect = document.getElementById('filterPriority');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const searchInput = document.getElementById('searchInput');
    
    if (deptSelect) deptSelect.value = '';
    if (typeSelect) typeSelect.value = '';
    if (prioritySelect) prioritySelect.value = '';
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    if (searchInput) searchInput.value = '';
    
    this.state.filters = {
      departmentId: [],
      requirementType: [],
      priority: [],
      startDate: '',
      endDate: '',
      keyword: ''
    };
    this.state.page = 1;
    
    Utils.storage.remove(Config.STORAGE_KEYS.FILTER_STATE);
    this.loadRequirements();
  },
  
  /**
   * 切换排序
   */
  toggleSort(field) {
    if (this.state.sortBy === field) {
      this.state.sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.state.sortBy = field;
      this.state.sortOrder = 'desc';
    }
    
    this.updateSortUI();
    this.loadRequirements();
  },
  
  /**
   * 更新排序 UI
   */
  updateSortUI() {
    document.querySelectorAll('.data-table th.sortable').forEach(th => {
      th.classList.remove('asc', 'desc');
      if (th.dataset.sort === this.state.sortBy) {
        th.classList.add(this.state.sortOrder);
      }
    });
  },
  
  /**
   * 加载需求列表
   */
  async loadRequirements() {
    const tableBody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');
    const tableContainer = document.querySelector('.table-container');
    
    if (tableBody) {
      tableBody.innerHTML = this.renderSkeleton(5);
    }
    
    try {
      let result;
      
      if (typeof MockData !== 'undefined') {
        // Mock 模式
        await new Promise(resolve => setTimeout(resolve, 500));
        result = this.filterMockData(MockData.requirements);
      } else {
        // API 模式
        result = await Api.getRequirements({
          page: this.state.page,
          pageSize: this.state.pageSize,
          ...this.state.filters,
          sortBy: this.state.sortBy,
          sortOrder: this.state.sortOrder
        });
      }
      
      const list = result.data?.list || result.list || [];
      const pagination = result.data?.pagination || result.pagination || {};
      
      this.data = list;
      this.state.total = pagination.total || list.length;
      this.state.totalPages = pagination.total_pages || Math.ceil(this.state.total / this.state.pageSize);
      
      if (list.length === 0) {
        if (tableContainer) tableContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
      } else {
        if (tableContainer) tableContainer.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
        if (tableBody) tableBody.innerHTML = this.renderTableRows(list);
      }
      
      this.renderPagination();
      
    } catch (error) {
      console.error('Load requirements failed:', error);
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="9" class="text-center" style="padding: 40px;">
              <div class="error-state">
                <div class="error-icon">⚠️</div>
                <div class="error-title">加载失败</div>
                <div class="error-desc">${error.message || '请稍后重试'}</div>
                <button class="btn btn-primary" onclick="ListHandler.loadRequirements()">重试</button>
              </div>
            </td>
          </tr>
        `;
      }
    }
  },
  
  /**
   * 过滤 Mock 数据
   */
  filterMockData(data) {
    const { filters, sortBy, sortOrder, page, pageSize } = this.state;
    
    let filtered = [...data];
    
    // 部门筛选
    if (filters.departmentId.length > 0) {
      filtered = filtered.filter(item => filters.departmentId.includes(item.department_id));
    }
    
    // 类型筛选
    if (filters.requirementType.length > 0) {
      filtered = filtered.filter(item => filters.requirementType.includes(item.requirement_type));
    }
    
    // 优先级筛选
    if (filters.priority.length > 0) {
      filtered = filtered.filter(item => filters.priority.includes(item.priority));
    }
    
    // 日期筛选
    if (filters.startDate) {
      filtered = filtered.filter(item => item.created_at >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(item => item.created_at <= filters.endDate);
    }
    
    // 关键词搜索
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(item => 
        item.requirement_no.toLowerCase().includes(keyword) ||
        item.user_name.toLowerCase().includes(keyword) ||
        item.description_preview.toLowerCase().includes(keyword)
      );
    }
    
    // 排序
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'priority') {
        const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
        aVal = priorityOrder[aVal] || 99;
        bVal = priorityOrder[bVal] || 99;
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);
    
    return {
      list: paginated,
      pagination: {
        total: filtered.length,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(filtered.length / pageSize)
      }
    };
  },
  
  /**
   * 渲染表格行
   */
  renderTableRows(list) {
    return list.map(item => `
      <tr>
        <td data-label="需求编号" class="requirement-no">${item.requirement_no}</td>
        <td data-label="需求标题" class="requirement-title" title="${this.escapeHtml(item.description_preview)}">${this.escapeHtml(item.description_preview)}</td>
        <td data-label="反馈人">${this.escapeHtml(item.user_name)}</td>
        <td data-label="部门"><span class="tag">${this.escapeHtml(item.department_name)}</span></td>
        <td data-label="类型"><span class="tag">${this.getRequirementTypeLabel(item.requirement_type)}</span></td>
        <td data-label="优先级"><span class="priority-badge priority-${item.priority.toLowerCase()}">${item.priority}</span></td>
        <td data-label="提交时间">${item.created_at}</td>
        <td data-label="附件"><span class="attachment-icon">📎 ${item.attachment_count}</span></td>
        <td data-label="操作"><a class="action-link" onclick="ListHandler.viewDetail('${item.requirement_no}')">详情</a></td>
      </tr>
    `).join('');
  },
  
  /**
   * 渲染骨架屏
   */
  renderSkeleton(count = 5) {
    return Array(count).fill(0).map(() => `
      <tr>
        <td><div class="skeleton skeleton-text" style="width: 120px;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 200px;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 80px;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 60px;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 60px;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 32px;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 100px;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 40px;"></div></td>
        <td><div class="skeleton skeleton-text" style="width: 40px;"></div></td>
      </tr>
    `).join('');
  },
  
  /**
   * 渲染分页
   */
  renderPagination() {
    const paginationEl = document.querySelector('.pagination');
    if (!paginationEl) return;
    
    const { page, totalPages, total, pageSize } = this.state;
    
    const infoEl = paginationEl.querySelector('.pagination-info');
    if (infoEl) {
      infoEl.innerHTML = `共 <strong>${total}</strong> 条记录，每页 <strong>${pageSize}</strong> 条，共 <strong>${totalPages}</strong> 页`;
    }
    
    const controlsEl = paginationEl.querySelector('.pagination-controls');
    if (!controlsEl) return;
    
    controlsEl.innerHTML = `
      <button class="page-btn" onclick="ListHandler.changePage(1)" ${page === 1 ? 'disabled' : ''}>首页</button>
      <button class="page-btn" onclick="ListHandler.changePage(${page - 1})" ${page === 1 ? 'disabled' : ''}>上一页</button>
      ${this.renderPageNumbers()}
      <button class="page-btn" onclick="ListHandler.changePage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>下一页</button>
      <button class="page-btn" onclick="ListHandler.changePage(${totalPages})" ${page === totalPages ? 'disabled' : ''}>末页</button>
      <div class="page-jump">
        <span>跳转到</span>
        <input type="number" class="jump-input" id="jumpPage" min="1" max="${totalPages}" value="${page}">
        <button class="page-btn" onclick="ListHandler.jumpToPage()">确定</button>
      </div>
    `;
  },
  
  /**
   * 渲染页码
   */
  renderPageNumbers() {
    const { page, totalPages } = this.state;
    const pages = [];
    
    // 始终显示第一页
    if (page > 3) {
      pages.push('<button class="page-btn" onclick="ListHandler.changePage(1)">1</button>');
      if (page > 4) {
        pages.push('<span>...</span>');
      }
    }
    
    // 显示当前页附近
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(`<button class="page-btn ${i === page ? 'active' : ''}" onclick="ListHandler.changePage(${i})">${i}</button>`);
    }
    
    // 始终显示最后一页
    if (page < totalPages - 2) {
      if (page < totalPages - 3) {
        pages.push('<span>...</span>');
      }
      pages.push(`<button class="page-btn" onclick="ListHandler.changePage(${totalPages})">${totalPages}</button>`);
    }
    
    return pages.join('');
  },
  
  /**
   * 切换页码
   */
  changePage(page) {
    if (page < 1 || page > this.state.totalPages || page === this.state.page) return;
    this.state.page = page;
    this.loadRequirements();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  
  /**
   * 跳转页码
   */
  jumpToPage() {
    const input = document.getElementById('jumpPage');
    const page = parseInt(input?.value) || 1;
    this.changePage(page);
  },
  
  /**
   * 查看详情
   */
  viewDetail(requirementNo) {
    // 从 Mock 数据或 API 获取详情
    const item = this.data.find(r => r.requirement_no === requirementNo);
    if (item) {
      Utils.storage.set('rft_current_requirement', item);
    }
    window.location.href = `detail.html?id=${requirementNo}`;
  },
  
  /**
   * 获取需求类型标签
   */
  getRequirementTypeLabel(type) {
    const types = {
      'feature_optimization': '功能优化',
      'bug_fix': 'Bug 修复',
      'new_feature': '新需求',
      'experience_optimization': '体验优化',
      'other': '其他'
    };
    return types[type] || type;
  },
  
  /**
   * HTML 转义
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  ListHandler.init();
});

// 导出全局函数
window.searchRequirements = () => ListHandler.searchRequirements();
window.resetFilters = () => ListHandler.resetFilters();
window.viewDetail = (no) => ListHandler.viewDetail(no);
window.changePage = (page) => ListHandler.changePage(page);
window.jumpToPage = () => ListHandler.jumpToPage();
window.showExportModal = () => {
  window.location.href = 'export-modal.html';
};
