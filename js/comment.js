/**
 * 评论互动
 * 内部产品需求反馈工具 - 评论模块
 */

const CommentHandler = {
  // 当前需求 ID
  requirementId: null,
  
  // 评论列表
  comments: [],
  
  // 编辑中的评论 ID
  editingCommentId: null,
  
  // 元素引用
  elements: {},
  
  /**
   * 初始化
   */
  init() {
    this.requirementId = Utils.getUrlParam('id') || Utils.storage.get('rft_current_requirement_id');
    this.cacheElements();
    this.bindEvents();
    this.loadComments();
    this.checkPermission();
  },
  
  /**
   * 缓存元素
   */
  cacheElements() {
    this.elements = {
      editor: document.getElementById('commentEditor'),
      commentsList: document.querySelector('.comments-list'),
      commentsCount: document.querySelector('.comments-count'),
      permissionTip: document.getElementById('permissionTip'),
      commentInputSection: document.querySelector('.comment-input-section')
    };
  },
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 回车提交评论
    if (this.elements.editor) {
      this.elements.editor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.submitComment();
        }
      });
    }
  },
  
  /**
   * 检查权限
   */
  checkPermission() {
    // 模拟权限检查
    const userInfo = Utils.storage.get(Config.STORAGE_KEYS.USER_INFO);
    const hasPermission = true; // 实际应从后端获取
    
    if (!hasPermission) {
      if (this.elements.permissionTip) {
        this.elements.permissionTip.classList.add('show');
      }
      if (this.elements.commentInputSection) {
        this.elements.commentInputSection.style.display = 'none';
      }
    }
  },
  
  /**
   * 加载评论
   */
  async loadComments() {
    if (!this.requirementId) {
      console.error('Requirement ID is required');
      return;
    }
    
    try {
      let result;
      
      if (typeof MockData !== 'undefined') {
        // Mock 模式
        await new Promise(resolve => setTimeout(resolve, 300));
        result = {
          data: MockData.comments.filter(c => c.requirement_id === this.requirementId)
        };
      } else {
        // API 模式
        result = await Api.getComments(this.requirementId);
      }
      
      this.comments = result.data || [];
      this.renderComments();
      
    } catch (error) {
      console.error('Load comments failed:', error);
      Utils.toast('加载评论失败', 'error');
    }
  },
  
  /**
   * 渲染评论
   */
  renderComments() {
    const { commentsList, commentsCount } = this.elements;
    if (!commentsList) return;
    
    if (this.comments.length === 0) {
      commentsList.innerHTML = `
        <div class="empty-state" style="padding: 40px 20px;">
          <div class="empty-icon">💬</div>
          <div class="empty-title">暂无评论</div>
          <div class="empty-desc">快来发表第一条评论吧</div>
        </div>
      `;
    } else {
      commentsList.innerHTML = this.comments.map(comment => this.renderCommentItem(comment)).join('');
    }
    
    // 更新评论数
    if (commentsCount) {
      commentsCount.textContent = `共 ${this.comments.length} 条评论`;
    }
    
    // 滚动到底部
    commentsList.scrollTop = commentsList.scrollHeight;
  },
  
  /**
   * 渲染单条评论
   */
  renderCommentItem(comment) {
    const userInfo = Utils.storage.get(Config.STORAGE_KEYS.USER_INFO);
    const isOwnComment = userInfo && userInfo.id === comment.user_id;
    const canEdit = isOwnComment && this.canEditComment(comment.created_at);
    const canDelete = isOwnComment || (userInfo && userInfo.role === 'admin');
    
    return `
      <div class="comment-item ${comment.is_deleted ? 'deleted' : ''}" data-id="${comment.id}">
        <div class="comment-header">
          <div class="comment-author">
            <div class="comment-avatar">${Utils.getNameInitial(comment.user_name)}</div>
            <div class="comment-info">
              <span class="comment-name">${this.escapeHtml(comment.user_name)}</span>
              <span class="comment-dept">${this.escapeHtml(comment.department_name)}</span>
            </div>
          </div>
          <span class="comment-time">${Utils.formatRelativeTime(comment.created_at)}</span>
        </div>
        <div class="comment-content">${this.renderCommentContent(comment.content)}</div>
        <div class="comment-actions">
          <button class="comment-action" onclick="CommentHandler.replyComment(${comment.id})">回复</button>
          ${canEdit ? `<button class="comment-action" onclick="CommentHandler.editComment(${comment.id})">编辑</button>` : ''}
          ${canDelete ? `<button class="comment-action" onclick="CommentHandler.deleteComment(${comment.id})">删除</button>` : ''}
        </div>
        <div class="reply-input-wrapper" id="replyWrapper-${comment.id}"></div>
      </div>
    `;
  },
  
  /**
   * 渲染评论内容
   */
  renderCommentContent(content) {
    // 处理@提及
    content = content.replace(/@(\S+)/g, '<span class="mention">@$1</span>');
    // 处理换行
    content = content.replace(/\n/g, '<br>');
    return content;
  },
  
  /**
   * 判断是否可以编辑
   */
  canEditComment(commentTime) {
    const now = new Date();
    const commentDate = new Date(commentTime);
    const diffMinutes = (now - commentDate) / 1000 / 60;
    return diffMinutes <= 5; // 5 分钟内可编辑
  },
  
  /**
   * 发表评论
   */
  async submitComment() {
    const { editor } = this.elements;
    if (!editor) return;
    
    const content = editor.innerText.trim();
    
    if (!content) {
      Utils.toast('请输入评论内容', 'warning');
      return;
    }
    
    if (content.length < Config.EDITOR.COMMENT_MIN_LENGTH) {
      Utils.toast(`评论内容至少${Config.EDITOR.COMMENT_MIN_LENGTH}个字`, 'warning');
      return;
    }
    
    try {
      let result;
      
      if (typeof MockData !== 'undefined') {
        // Mock 模式
        await new Promise(resolve => setTimeout(resolve, 300));
        const userInfo = Utils.storage.get(Config.STORAGE_KEYS.USER_INFO) || { name: '当前用户', department: { name: '部门' } };
        result = {
          data: {
            id: Date.now(),
            requirement_id: this.requirementId,
            user_id: userInfo.id || 'current',
            user_name: userInfo.name,
            department_name: userInfo.department?.name,
            content: content,
            created_at: new Date().toISOString(),
            is_deleted: false
          }
        };
      } else {
        // API 模式
        result = await Api.submitComment(this.requirementId, content);
      }
      
      // 添加到列表
      this.comments.push(result.data);
      this.renderComments();
      
      // 清空输入框
      editor.innerText = '';
      
      Utils.toast('评论发表成功', 'success');
      
    } catch (error) {
      console.error('Submit comment failed:', error);
      Utils.toast(error.message || '评论失败，请重试', 'error');
    }
  },
  
  /**
   * 编辑评论
   */
  async editComment(commentId) {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return;
    
    const newContent = prompt('编辑评论：', comment.content);
    if (newContent === null || !newContent.trim()) return;
    
    try {
      if (typeof MockData !== 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 300));
        comment.content = newContent;
      } else {
        await Api.updateComment(commentId, newContent);
        comment.content = newContent;
      }
      
      this.renderComments();
      Utils.toast('评论已更新', 'success');
      
    } catch (error) {
      console.error('Update comment failed:', error);
      Utils.toast('更新失败', 'error');
    }
  },
  
  /**
   * 删除评论
   */
  async deleteComment(commentId) {
    if (!await Utils.confirm('确定要删除这条评论吗？')) return;
    
    try {
      if (typeof MockData !== 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 300));
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
          comment.is_deleted = true;
          comment.content = '该评论已删除';
        }
      } else {
        await Api.deleteComment(commentId);
        this.comments = this.comments.filter(c => c.id !== commentId);
      }
      
      this.renderComments();
      Utils.toast('评论已删除', 'success');
      
    } catch (error) {
      console.error('Delete comment failed:', error);
      Utils.toast('删除失败', 'error');
    }
  },
  
  /**
   * 回复评论
   */
  replyComment(commentId) {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return;
    
    const wrapper = document.getElementById(`replyWrapper-${commentId}`);
    if (!wrapper) return;
    
    if (wrapper.classList.contains('show')) {
      wrapper.classList.remove('show');
      wrapper.innerHTML = '';
      return;
    }
    
    wrapper.innerHTML = `
      <div class="reply-editor" contenteditable="true" data-placeholder="回复 @${comment.user_name}..."></div>
      <div class="reply-actions">
        <button class="btn btn-secondary btn-sm" onclick="CommentHandler.cancelReply(${commentId})">取消</button>
        <button class="btn btn-primary btn-sm" onclick="CommentHandler.submitReply(${commentId})">提交</button>
      </div>
    `;
    wrapper.classList.add('show');
    
    const editor = wrapper.querySelector('.reply-editor');
    editor.focus();
    editor.innerText = `@${comment.user_name} `;
  },
  
  /**
   * 取消回复
   */
  cancelReply(commentId) {
    const wrapper = document.getElementById(`replyWrapper-${commentId}`);
    if (wrapper) {
      wrapper.classList.remove('show');
      wrapper.innerHTML = '';
    }
  },
  
  /**
   * 提交回复
   */
  async submitReply(commentId) {
    const wrapper = document.getElementById(`replyWrapper-${commentId}`);
    const editor = wrapper?.querySelector('.reply-editor');
    if (!editor) return;
    
    const content = editor.innerText.trim();
    if (content.length < Config.EDITOR.COMMENT_MIN_LENGTH) {
      Utils.toast(`回复内容至少${Config.EDITOR.COMMENT_MIN_LENGTH}个字`, 'warning');
      return;
    }
    
    // 提交回复（简化处理，实际应作为独立评论）
    await this.submitComment();
    this.cancelReply(commentId);
  },
  
  /**
   * 格式化评论
   */
  formatComment(command) {
    document.execCommand(command, false, null);
    this.elements.editor?.focus();
  },
  
  /**
   * 插入@提及
   */
  insertMention() {
    const mention = prompt('请输入要@的同事姓名或工号：');
    if (mention && this.elements.editor) {
      this.elements.editor.focus();
      document.execCommand('insertText', false, `@${mention} `);
    }
  },
  
  /**
   * 插入表情
   */
  insertEmoji() {
    const emojis = ['😊', '👍', '👎', '✅', '❌', '⭐', '🎉', '💡', '🤔', '👀'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    if (this.elements.editor) {
      this.elements.editor.focus();
      document.execCommand('insertText', false, emoji);
    }
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
  CommentHandler.init();
});

// 导出全局函数
window.submitComment = () => CommentHandler.submitComment();
window.editComment = (btn) => {
  const commentItem = btn.closest('.comment-item');
  const id = parseInt(commentItem.dataset.id);
  CommentHandler.editComment(id);
};
window.deleteComment = (btn) => {
  const commentItem = btn.closest('.comment-item');
  const id = parseInt(commentItem.dataset.id);
  CommentHandler.deleteComment(id);
};
window.formatComment = (command) => CommentHandler.formatComment(command);
window.insertMention = () => CommentHandler.insertMention();
window.insertEmoji = () => CommentHandler.insertEmoji();
