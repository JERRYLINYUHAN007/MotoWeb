/**
 * settings.js
 * 處理帳號設定頁面的功能與互動
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initSettingsTabs();
    initAccountForms();
    initEmailModal();
    initSecurityForms();
    initDeviceControls();
    initNotificationSettings();
    initPrivacySettings();
    initDataControls();
});

/**
 * 初始化設定頁標籤切換功能
 */
function initSettingsTabs() {
    const navLinks = document.querySelectorAll('.settings-nav a');
    const sections = document.querySelectorAll('.settings-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // 更新活動標籤
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // 顯示對應的設定區塊
            sections.forEach(section => {
                if (section.id === targetSection) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
            
            // 更新 URL 錨點，但不重新載入頁面
            history.replaceState(null, null, `#${targetSection}`);
        });
    });
    
    // 根據 URL 錨點顯示對應的設定區塊
    if (window.location.hash) {
        const targetSection = window.location.hash.substring(1);
        const targetLink = document.querySelector(`.settings-nav a[data-section="${targetSection}"]`);
        
        if (targetLink) {
            targetLink.click();
        }
    }
}

/**
 * 初始化帳號表單
 */
function initAccountForms() {
    const accountForm = document.getElementById('accountForm');
    
    if (accountForm) {
        accountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 取得表單數據
            const formData = new FormData(this);
            
            // 模擬 API 請求
            console.log('更新帳號資訊:', {
                username: formData.get('username'),
                phone: formData.get('phone'),
                language: formData.get('language')
            });
            
            // 顯示成功訊息
            showNotification('帳號資訊已更新', 'success');
        });
    }
}

/**
 * 初始化電子郵件變更模態框
 */
function initEmailModal() {
    const changeEmailBtn = document.getElementById('changeEmailBtn');
    const emailModal = document.getElementById('changeEmailModal');
    const closeModal = emailModal ? emailModal.querySelector('.close-modal') : null;
    const cancelBtn = document.getElementById('cancelEmailChange');
    const emailForm = document.getElementById('changeEmailForm');
    
    // 打開模態框
    if (changeEmailBtn && emailModal) {
        changeEmailBtn.addEventListener('click', function(e) {
            e.preventDefault();
            emailModal.classList.add('open');
            document.body.style.overflow = 'hidden'; // 防止背景滾動
        });
    }
    
    // 關閉模態框
    if (closeModal) {
        closeModal.addEventListener('click', closeEmailModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeEmailModal);
    }
    
    // 點擊模態框背景關閉
    if (emailModal) {
        emailModal.addEventListener('click', function(e) {
            if (e.target === emailModal) {
                closeEmailModal();
            }
        });
    }
    
    // 處理表單提交
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const newEmail = formData.get('newEmail');
            
            // 模擬 API 請求
            console.log('變更電子郵件:', {
                newEmail: newEmail,
                password: formData.get('confirmEmailPassword')
            });
            
            // 更新顯示的電子郵件
            document.getElementById('email').value = newEmail;
            document.getElementById('currentEmail').value = newEmail;
            
            // 顯示成功訊息並關閉模態框
            showNotification('電子郵件已變更，驗證郵件已發送至新信箱', 'success');
            closeEmailModal();
        });
    }
}

/**
 * 關閉電子郵件模態框
 */
function closeEmailModal() {
    const emailModal = document.getElementById('changeEmailModal');
    if (emailModal) {
        emailModal.classList.remove('open');
        document.body.style.overflow = ''; // 恢復背景滾動
    }
}

/**
 * 初始化安全設定表單
 */
function initSecurityForms() {
    const securityForm = document.getElementById('securityForm');
    
    if (securityForm) {
        securityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // 簡單的前端驗證
            if (!currentPassword) {
                showNotification('請輸入目前密碼', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showNotification('新密碼與確認密碼不相符', 'error');
                return;
            }
            
            // 密碼複雜度檢查
            if (newPassword && newPassword.length < 8) {
                showNotification('新密碼至少需要8個字元', 'error');
                return;
            }
            
            // 模擬 API 請求
            console.log('更新密碼:', {
                currentPassword,
                newPassword
            });
            
            // 清空表單
            this.reset();
            
            // 顯示成功訊息
            showNotification('密碼已成功更新', 'success');
        });
        
        // 監聽雙重驗證開關
        const twoFactorToggle = document.querySelector('input[name="twoFactor"]');
        if (twoFactorToggle) {
            twoFactorToggle.addEventListener('change', function() {
                const isEnabled = this.checked;
                
                // 模擬 API 請求
                console.log('雙重驗證狀態更改:', isEnabled);
                
                // 顯示提示訊息
                if (isEnabled) {
                    showNotification('雙重驗證已啟用', 'success');
                    // 這裡通常會跳轉到設定雙重驗證的流程
                } else {
                    showNotification('雙重驗證已停用', 'info');
                }
            });
        }
    }
}

/**
 * 初始化裝置控制功能
 */
function initDeviceControls() {
    const deviceLogoutBtns = document.querySelectorAll('.device-item .btn-danger:not([disabled])');
    const logoutAllBtn = document.getElementById('logoutAllDevices');
    
    deviceLogoutBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const deviceItem = this.closest('.device-item');
            const deviceName = deviceItem.querySelector('h4').textContent;
            
            // 模擬 API 請求
            console.log('登出裝置:', deviceName);
            
            // 從列表中移除裝置項目
            deviceItem.style.opacity = '0';
            setTimeout(() => {
                deviceItem.remove();
                showNotification(`已從 ${deviceName} 登出`, 'success');
            }, 300);
        });
    });
    
    if (logoutAllBtn) {
        logoutAllBtn.addEventListener('click', function() {
            // 模擬 API 請求
            console.log('登出所有其他裝置');
            
            // 從列表中移除非當前裝置
            const otherDevices = document.querySelectorAll('.device-item:not(.current)');
            otherDevices.forEach(device => {
                device.style.opacity = '0';
                setTimeout(() => {
                    device.remove();
                }, 300);
            });
            
            showNotification('已從所有其他裝置登出', 'success');
        });
    }
}

/**
 * 初始化通知設定
 */
function initNotificationSettings() {
    const saveNotificationsBtn = document.getElementById('saveNotifications');
    
    if (saveNotificationsBtn) {
        saveNotificationsBtn.addEventListener('click', function() {
            // 收集所有通知設定的狀態
            const settings = {
                emailNotif: document.querySelector('input[name="emailNotif"]').checked,
                pushNotif: document.querySelector('input[name="pushNotif"]').checked,
                commentNotif: document.querySelector('input[name="commentNotif"]').checked,
                likeNotif: document.querySelector('input[name="likeNotif"]').checked,
                eventNotif: document.querySelector('input[name="eventNotif"]').checked,
                productNotif: document.querySelector('input[name="productNotif"]').checked,
                systemNotif: document.querySelector('input[name="systemNotif"]').checked
            };
            
            // 模擬 API 請求
            console.log('儲存通知設定:', settings);
            
            showNotification('通知設定已更新', 'success');
        });
    }
}

/**
 * 初始化隱私設定
 */
function initPrivacySettings() {
    const savePrivacyBtn = document.getElementById('savePrivacy');
    
    if (savePrivacyBtn) {
        savePrivacyBtn.addEventListener('click', function() {
            // 收集所有隱私設定
            const settings = {
                profileVisibility: document.querySelector('select[name="profileVisibility"]').value,
                garageVisibility: document.querySelector('select[name="garageVisibility"]').value,
                contactVisibility: document.querySelector('select[name="contactVisibility"]').value,
                allowTagging: document.querySelector('input[name="allowTagging"]').checked,
                showActivity: document.querySelector('input[name="showActivity"]').checked
            };
            
            // 模擬 API 請求
            console.log('儲存隱私設定:', settings);
            
            showNotification('隱私設定已更新', 'success');
        });
    }
}

/**
 * 初始化資料控制功能
 */
function initDataControls() {
    // 刪除帳號功能
    const deleteAccountBtn = document.querySelector('.data-option .btn-danger');
    
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            // 顯示確認刪除帳號的對話框
            if (confirm('您確定要永久刪除您的帳號嗎？此操作無法撤銷，所有資料將被永久刪除。')) {
                // 模擬 API 請求
                console.log('請求刪除帳號');
                
                showNotification('已提交帳號刪除申請，請檢查您的電子郵件以確認此操作。', 'info');
            }
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