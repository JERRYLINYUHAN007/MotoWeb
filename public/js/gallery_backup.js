/**
 * gallery.js - MotoMod作品展示頁面功能
 */

/**
 * 初始化作品展示頁面
 */
function initGalleryPage() {
    console.log('開始初始化作品展示頁面功能');
    
    // 首先初始化上傳功能 - 確保按鈕事件正確綁定
    console.log('立即初始化上傳功能');
    initUploadFeature();
    
    // 載入作品集
    loadGalleryItems();
    
    // 初始化篩選功能
    initFilters();
    
    // 初始化檢視切換功能
    initViewToggle();
    
    // 初始化載入更多功能
    initLoadMore();
    
    // 初始化作品預覽功能
    initImagePreview();
    
    // 初始化搜尋功能
    initSearchFunction();
    
    // 添加側邊欄初始化
    initSidebar();
    
    // 初始化排序選擇器
    handleSortChange();
    
    // 初始化篩選標籤
    updateFilterTags();
    
    console.log('所有功能初始化完成');
}