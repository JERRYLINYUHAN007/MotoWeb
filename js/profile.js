document.addEventListener('DOMContentLoaded', () => {
    // 標籤頁切換
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // 更新按鈕狀態
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // 更新內容顯示
            tabContents.forEach(content => {
                content.style.display = content.id === tabId ? 'block' : 'none';
            });
        });
    });

    // 模態框控制
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    const editProfileModal = document.getElementById('editProfileModal');
    const closeModal = document.querySelector('.close-modal');

    if (editProfileBtn && editProfileModal) {
        editProfileBtn.addEventListener('click', () => {
            editProfileModal.style.display = 'block';
            // 載入當前用戶資料
            loadUserProfile();
        });

        closeModal.addEventListener('click', () => {
            editProfileModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === editProfileModal) {
                editProfileModal.style.display = 'none';
            }
        });
    }

    // 表單提交處理
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(editProfileForm);
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

            try {
                // 這裡應該是實際的 API 調用
                // const response = await fetch('/api/profile', {
                //     method: 'PUT',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify(userData)
                // });

                // 模擬更新成功
                console.log('更新的資料：', userData);
                alert('個人資料更新成功！');
                editProfileModal.style.display = 'none';
                // 重新載入個人資料
                updateProfileDisplay(userData);
            } catch (error) {
                console.error('更新失敗：', error);
                alert('更新失敗，請稍後再試。');
            }
        });
    }

    // 頭像和封面圖片上傳
    const editAvatar = document.querySelector('.edit-avatar');
    const editCover = document.querySelector('.edit-cover');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    const handleImageUpload = async (file, type) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('type', type);

            // 這裡應該是實際的 API 調用
            // const response = await fetch('/api/upload-image', {
            //     method: 'POST',
            //     body: formData
            // });

            // 模擬上傳成功
            console.log(`${type} 上傳成功`);
            alert('圖片上傳成功！');

            // 更新預覽圖片
            const reader = new FileReader();
            reader.onload = (e) => {
                if (type === 'avatar') {
                    document.querySelector('.profile-avatar img').src = e.target.result;
                    document.querySelector('.user-menu .avatar').src = e.target.result;
                } else {
                    document.querySelector('.profile-cover').style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${e.target.result})`;
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('上傳失敗：', error);
            alert('圖片上傳失敗，請稍後再試。');
        }
    };

    if (editAvatar) {
        editAvatar.addEventListener('click', () => {
            fileInput.click();
            fileInput.onchange = (e) => {
                if (e.target.files[0]) {
                    handleImageUpload(e.target.files[0], 'avatar');
                }
            };
        });
    }

    if (editCover) {
        editCover.addEventListener('click', () => {
            fileInput.click();
            fileInput.onchange = (e) => {
                if (e.target.files[0]) {
                    handleImageUpload(e.target.files[0], 'cover');
                }
            };
        });
    }

    // 標籤管理
    const addTagBtn = document.querySelector('.add-tag-btn');
    if (addTagBtn) {
        addTagBtn.addEventListener('click', () => {
            const tagName = prompt('請輸入新標籤名稱：');
            if (tagName && tagName.trim()) {
                addTag(tagName.trim());
            }
        });
    }

    // 車庫管理
    const addVehicleBtn = document.querySelector('.add-vehicle-btn');
    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', () => {
            // 這裡可以打開添加車輛的模態框
            alert('添加車輛功能開發中...');
        });
    }

    // 登出功能
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                // 這裡應該是實際的 API 調用
                // await fetch('/api/logout', {
                //     method: 'POST'
                // });

                // 模擬登出成功
                alert('登出成功！');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('登出失敗：', error);
                alert('登出失敗，請稍後再試。');
            }
        });
    }
});

// 輔助函數
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

function updateProfileDisplay(userData) {
    document.querySelector('.profile-details h1').firstChild.textContent = userData.displayName + ' ';
    document.querySelector('.user-bio').textContent = userData.bio;
    document.querySelector('.info-group p').textContent = userData.location;
}

function addTag(tagName) {
    const tagsContainer = document.querySelector('.tags');
    const addTagBtn = document.querySelector('.add-tag-btn');
    
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = tagName;
    
    // 在添加按鈕前插入新標籤
    tagsContainer.insertBefore(tag, addTagBtn);
} 