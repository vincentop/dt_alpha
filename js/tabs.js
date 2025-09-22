document.addEventListener('DOMContentLoaded', function() {
  // 處理原有的標籤按鈕（向後相容）
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // 處理新的現代標籤按鈕
  const modernTabButtons = document.querySelectorAll('.tab-button-modern');
  
  // 原有標籤功能
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update button styles
      tabButtons.forEach(btn => {
        btn.removeAttribute('aria-current');
      });
      button.setAttribute('aria-current', 'page');
      // Show/hide content
      const targetId = button.id.replace('tab-', 'content-');
      tabContents.forEach(content => {
        if (content.id === targetId) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });

  // 新的現代標籤功能
  modernTabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // 移除所有按鈕的active狀態
      modernTabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.removeAttribute('aria-current');
      });
      
      // 為點擊的按鈕添加active狀態
      button.classList.add('active');
      button.setAttribute('aria-current', 'page');
      
      // 獲取目標內容ID
      const targetId = button.getAttribute('data-tab');
      
      // 切換內容顯示
      tabContents.forEach(content => {
        if (content.id === targetId) {
          content.classList.add('active');
          // 添加淡入動畫
          content.style.animation = 'fadeIn 0.3s ease';
        } else {
          content.classList.remove('active');
        }
      });
      
      // 添加點擊回饋效果
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = '';
      }, 150);
    });
  });


  // 為統計數字添加計數動畫
  const statNumbers = document.querySelectorAll('.stat-number');
  const animateNumbers = () => {
    statNumbers.forEach(stat => {
      const finalNumber = stat.textContent;
      const isPlus = finalNumber.includes('+');
      const numericValue = parseInt(finalNumber.replace(/\D/g, ''));
      let currentNumber = 0;
      const increment = Math.ceil(numericValue / 30);
      
      const counter = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= numericValue) {
          currentNumber = numericValue;
          clearInterval(counter);
        }
        stat.textContent = currentNumber + (isPlus ? '+' : '');
      }, 50);
    });
  };

  // 使用Intersection Observer來觸發數字動畫
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNumbers();
        observer.unobserve(entry.target);
      }
    });
  });

  const statsContainer = document.querySelector('.content-stats');
  if (statsContainer) {
    observer.observe(statsContainer);
  }

  // CTA按鈕增強效果
  const ctaButton = document.querySelector('.cta-button-modern');
  if (ctaButton) {
    ctaButton.addEventListener('mouseenter', () => {
      ctaButton.style.transform = 'translateY(-3px) scale(1.05)';
    });
    
    ctaButton.addEventListener('mouseleave', () => {
      ctaButton.style.transform = 'translateY(0) scale(1)';
    });
  }
});

// 添加CSS動畫關鍵幀（如果還沒有的話）
if (!document.querySelector('#ripple-animation')) {
  const style = document.createElement('style');
  style.id = 'ripple-animation';
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}