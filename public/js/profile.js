/**
 * profile.js
 * 處理個人資料頁面的各種交互功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initProfileTabs();
    initEditProfileModal();
    setupLogoutButton();
    loadUserProfile();
});

/**
 * 初始化個人資料頁標籤切換功能
 */
function initProfileTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // 切換活動標籤
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 切換標籤內容
            tabContents.forEach(content => {
                if (content.id === tabName + 'Tab') {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            });
        });
    });
}

/**
 * 初始化編輯個人資料模態框
 */
function initEditProfileModal() {
    const editBtn = document.querySelector('.edit-btn');
    const modal = document.getElementById('editProfileModal');
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelEdit');
    const profileForm = document.getElementById('profileForm');
    
    // 打開模態框
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden'; // 防止背景滾動
        });
    }
    
    // 關閉模態框的多種方式
    if (closeModal) {
        closeModal.addEventListener('click', closeEditModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeEditModal);
    }
    
    // 點擊模態框背景關閉
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeEditModal();
            }
        });
    }
    
    // 表單提交處理
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 獲取表單數據
            const formData = new FormData(this);
            const userData = {
                displayName: formData.get('displayName'),
                bio: formData.get('bio'),
                location: formData.get('location'),
                privacy: {
                    showEmail: formData.get('showEmail') === 'on',
                    showLocation: formData.get('showLocation') === 'on',
                    publicProfile: formData.get('publicProfile') === 'on'
                }
            };
            
            // 更新頁面上的個人資料顯示
            updateProfileDisplay(userData);
            
            // 模擬API請求保存數據
            console.log('保存的個人資料:', userData);
            
            // 顯示成功提示並關閉模態框
            showNotification('個人資料已更新', 'success');
            closeEditModal();
        });
    }
}

/**
 * 關閉編輯個人資料模態框
 */
function closeEditModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = ''; // 恢復背景滾動
    }
}

/**
 * 設置登出按鈕功能
 */
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 清除登入狀態
            localStorage.removeItem('isLoggedIn');
            
            // 顯示登出成功通知
            showNotification('登出成功！', 'success');
            
            // 重定向到首頁
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 1500);
        });
    }
}

/**
 * 顯示通知訊息
 */
function showNotification(message, type = 'info') {
    // 檢查是否已存在通知元素
    let notification = document.querySelector('.notification');
    
    // 如果不存在，創建新的通知元素
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    // 設置通知類型和訊息
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 添加顯示類別
    notification.classList.add('show');

    // 設定自動消失
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * 載入用戶個人資料數據
 */
function loadUserProfile() {
    // 模擬從 API 獲取用戶資料
    const userData = {
        displayName: '用戶名稱',
        bio: '分享您的個人簡介...',
        location: '台北市',
        privacy: {
            showEmail: true,
            showLocation: true,
            publicProfile: true
        }
    };

    // 填充表單
    document.getElementById('displayName').value = userData.displayName;
    document.getElementById('bio').value = userData.bio;
    document.getElementById('location').value = userData.location;
    document.querySelector('input[name="showEmail"]').checked = userData.privacy.showEmail;
    document.querySelector('input[name="showLocation"]').checked = userData.privacy.showLocation;
    document.querySelector('input[name="publicProfile"]').checked = userData.privacy.publicProfile;
}

/**
 * 更新個人資料顯示
 */
function updateProfileDisplay(userData) {
    document.querySelector('.profile-details h1').firstChild.textContent = userData.displayName + ' ';
    document.querySelector('.user-bio').textContent = userData.bio;
    document.querySelector('.info-group p').textContent = userData.location;
}

/**
 * 處理頭像和封面圖片上傳
 */
function initImageUpload() {
    const avatarBtn = document.querySelector('.edit-avatar-btn');
    const coverBtn = document.querySelector('.edit-cover-btn');
    
    // 創建隱藏的文件輸入元素
    function createFileInput() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        return fileInput;
    }
    
    // 顯示通知
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 2秒後消失
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
    
    // 處理頭像上傳
    if (avatarBtn) {
        avatarBtn.addEventListener('click', function() {
            const fileInput = createFileInput();
            document.body.appendChild(fileInput);
            
            fileInput.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    // 預覽圖片
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        document.querySelector('.profile-avatar img').src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                    
                    // 上傳圖片到伺服器
                    const formData = new FormData();
                    formData.append('avatar', file);
                    
                    fetch('/api/profile/avatar', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(err => {
                                throw new Error(err.error || '上傳頭像失敗');
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        showNotification(data.message || '頭像已更新', 'success');
                        // 更新導航欄頭像
                        if (document.querySelector('.user-menu .avatar')) {
                            document.querySelector('.user-menu .avatar').src = data.avatarPath;
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification(error.message || '上傳失敗，請稍後再試', 'error');
                    });
                }
                document.body.removeChild(fileInput);
            });
            
            fileInput.click();
        });
    }
    
    // 處理封面圖片上傳
    if (coverBtn) {
        coverBtn.addEventListener('click', function() {
            const fileInput = createFileInput();
            document.body.appendChild(fileInput);
            
            fileInput.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    // 預覽圖片
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const profileCover = document.querySelector('.profile-cover');
                        if (profileCover) {
                            profileCover.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${e.target.result})`;
                        }
                    };
                    reader.readAsDataURL(file);
                    
                    // 上傳圖片到伺服器
                    const formData = new FormData();
                    formData.append('cover', file);
                    
                    fetch('/api/profile/cover', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(err => {
                                throw new Error(err.error || '上傳封面失敗');
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        showNotification(data.message || '封面圖片已更新', 'success');
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification(error.message || '上傳失敗，請稍後再試', 'error');
                    });
                }
                document.body.removeChild(fileInput);
            });
            
            fileInput.click();
        });
    }
} 