// 導航欄響應式切換
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // 點擊導航欄外部時關閉選單
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });

    // 滾動時改變導航欄樣式
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        } else {
            navbar.style.backgroundColor = '#ffffff';
            navbar.style.boxShadow = 'none';
        }
    });

    // 模擬載入最新討論數據
    const discussionList = document.querySelector('.discussion-list');
    if (discussionList) {
        const discussions = [
            {
                title: '推薦的排氣管品牌',
                author: '小明',
                comments: 15,
                likes: 32
            },
            {
                title: 'R15改裝心得分享',
                author: '阿華',
                comments: 23,
                likes: 45
            },
            {
                title: '輪胎選擇建議',
                author: '小玉',
                comments: 8,
                likes: 19
            }
        ];

        discussions.forEach(discussion => {
            const discussionCard = document.createElement('div');
            discussionCard.className = 'discussion-card';
            discussionCard.innerHTML = `
                <h3>${discussion.title}</h3>
                <p>作者: ${discussion.author}</p>
                <div class="discussion-stats">
                    <span><i class="fas fa-comment"></i> ${discussion.comments}</span>
                    <span><i class="fas fa-heart"></i> ${discussion.likes}</span>
                </div>
            `;
            discussionList.appendChild(discussionCard);
        });
    }
});

// 平滑滾動效果
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
}); 