// 獲取按鈕
var backToTopBtn = document.getElementById("backToTopBtn");

// 當滾動超過一定距離時顯示按鈕
window.onscroll = function() {
    scrollFunction();
};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
}

// 點擊按鈕返回頂部
backToTopBtn.onclick = function() {
    topFunction();
};

function topFunction() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}