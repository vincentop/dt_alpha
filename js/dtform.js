document.addEventListener('DOMContentLoaded', function () {
    const radioOptions = document.querySelectorAll('.radio-option, .card-type');

    radioOptions.forEach(option => {
        option.addEventListener('click', function (e) {
            // 防止事件冒泡
            e.stopPropagation();

            const radio = this.querySelector('input[type="radio"]');
            if (radio && !radio.checked) {
                radio.checked = true;
                // 觸發 change 事件
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        // 防止點擊 radio 或 label 時重複觸發
        const radio = option.querySelector('input[type="radio"]');
        const label = option.querySelector('label');

        if (radio) {
            radio.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }

        if (label) {
            label.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }
    });

    const planRadios = document.querySelectorAll('input[name="subscribe-plan"]');
    const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const postageText = document.getElementById('postage-text');
    const totalPrice = document.getElementById('total-price');
    const remittanceAmount = document.getElementById('remittance-amount');
    const orderAmount = document.getElementById('order-amount');
    const bankTransferSection = document.getElementById('bank-transfer-section');
    const creditCardSection = document.getElementById('credit-card-section');

    function calculateTotal() {
        let total = 0;
        const selectedPlan = document.querySelector('input[name="subscribe-plan"]:checked');
        const selectedDelivery = document.querySelector('input[name="delivery"]:checked');

        if (selectedPlan) {
            if (selectedPlan.value === '1year') {
                total += 300;
                postageText.textContent = '（加付郵資NT$ 100）';
            } else if (selectedPlan.value === '2years') {
                total += 600;
                postageText.textContent = '（加付郵資NT$ 200）';
            }
        }

        if (selectedDelivery && selectedDelivery.value === 'registered') {
            if (selectedPlan && selectedPlan.value === '1year') {
                total += 100;
            } else if (selectedPlan && selectedPlan.value === '2years') {
                total += 200;
            }
        }

        totalPrice.textContent = `NT$ ${total}`;
        remittanceAmount.value = `NT$ ${total}`;
        orderAmount.value = `NT$ ${total}`;
    }

    function togglePaymentSections() {
        const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
        if (selectedPayment === 'bank') {
            bankTransferSection.style.display = 'block';
            creditCardSection.style.display = 'none';
        } else {
            bankTransferSection.style.display = 'none';
            creditCardSection.style.display = 'block';
        }
    }

    planRadios.forEach(radio => radio.addEventListener('change', calculateTotal));
    deliveryRadios.forEach(radio => radio.addEventListener('change', calculateTotal));
    paymentRadios.forEach(radio => radio.addEventListener('change', togglePaymentSections));

    calculateTotal();
    togglePaymentSections();

    const cardNumberInput = document.getElementById('card-number');
    const cardLogo = document.getElementById('card-logo');

    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value;

        // 1. Remove non-numeric characters
        let numericValue = value.replace(/\D/g, '');

        // 2. Limit length to 16 digits
        numericValue = numericValue.slice(0, 16);

        // 3. Identify card type
        const cardType = getCardType(numericValue);

        // 4. Update logo
        cardLogo.className = 'card-logo'; // Reset classes
        if (cardType) {
            cardLogo.classList.add(cardType);
        }

        // 5. Add hyphens for formatting
        let formattedValue = '';
        for (let i = 0; i < numericValue.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += '-';
            }
            formattedValue += numericValue[i];
        }

        // 6. Update the input value
        e.target.value = formattedValue;
    });

    function getCardType(number) {
        // Visa: Starts with 4
        if (/^4/.test(number)) {
            return 'visa';
        }
        // Mastercard: Starts with 51-55
        if (/^5[1-5]/.test(number)) {
            return 'mastercard';
        }
        // JCB: Starts with 3528-3589
        if (/^35(2[89]|[3-8][0-9])/.test(number)) {
            return 'jcb';
        }
        return null; // Unknown
    }

    // Email 格式驗證
    const emailInput = document.getElementById('subscriber-email');
    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', clearEmailError);
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (email && !emailPattern.test(email)) {
            showFieldError(emailInput, 'Email格式不正確');
            return false;
        } else {
            clearFieldError(emailInput);
            return true;
        }
    }

    function clearEmailError() {
        clearFieldError(emailInput);
    }

    // 聯絡電話驗證（區碼+數字）
    const phoneInputs = [
        document.getElementById('subscriber-phone'),
        document.getElementById('company-phone')
    ];

    phoneInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', formatPhone);
            input.addEventListener('blur', validatePhone);
        }
    });

    function formatPhone(e) {
        let value = e.target.value.replace(/\D/g, ''); // 只保留數字
        e.target.value = value;
    }

    function validatePhone(e) {
        const phone = e.target.value.trim();

        // 只檢查是否包含非數字字符
        if (phone && /\D/.test(phone)) {
            showFieldError(e.target, '請輸入數字');
            return false;
        } else {
            clearFieldError(e.target);
            return true;
        }
    }

    // 手機號碼驗證和格式化（10碼數字，自動加入-）
    const mobileInput = document.getElementById('subscriber-mobile');
    if (mobileInput) {
        mobileInput.addEventListener('input', formatMobile);
        mobileInput.addEventListener('blur', validateMobile);
    }

    function formatMobile(e) {
        let value = e.target.value.replace(/\D/g, ''); // 只保留數字

        // 限制最多10碼
        value = value.slice(0, 10);

        // 自動格式化：09XX-XXXXXX
        if (value.length > 4) {
            value = value.slice(0, 4) + '-' + value.slice(4);
        }

        e.target.value = value;
    }

    function validateMobile(e) {
        const mobile = e.target.value.replace(/\D/g, ''); // 移除非數字字符進行驗證

        if (mobile && mobile.length !== 10) {
            showFieldError(e.target, '手機號碼必須為10碼數字');
            return false;
        } else if (mobile && !mobile.startsWith('09')) {
            showFieldError(e.target, '手機號碼必須以09開頭');
            return false;
        } else {
            clearFieldError(e.target);
            return true;
        }
    }

    // 通用錯誤顯示函數
    function showFieldError(input, message) {
        input.style.borderColor = '#e74c3c';
        input.style.backgroundColor = '#fdf2f2';

        // 移除現有的錯誤訊息
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // 加入新的錯誤訊息
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '4px';

        input.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(input) {
        input.style.borderColor = '';
        input.style.backgroundColor = '';

        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
});

// Email 發送功能
function sendEmail() {
    console.log('sendEmail 函數被調用');

    try {
        // 收集所有表單資料
        const formData = collectFormData();
        console.log('表單資料:', formData);

        // 檢查必填欄位
        const validation = validateRequiredFields(formData);
        if (!validation.success) {
            showMessage(validation.message, 'error');
            return;
        }

        // 建立 email 內容
        const emailContent = formatEmailContent(formData);
        console.log('Email內容已生成');

        // 發送 email - 在新視窗中開啟
        const mailto = `mailto:Helen_Tseng@asus.com?subject=數位狂潮雜誌訂閱申請&body=${encodeURIComponent(emailContent)}`;
        console.log('準備開啟郵件:', mailto.substring(0, 100) + '...');

        window.open(mailto, '_blank');

        // 發送成功提示
        setTimeout(() => {
            showMessage('郵件已開啟，請在郵件程式中完成發送！', 'success');
        }, 1000);

    } catch (error) {
        console.error('發送郵件時發生錯誤:', error);
        showMessage('發送郵件時發生錯誤，請檢查控制台', 'error');
    }
}

function collectFormData() {
    const data = {};
    
    // 訂閱方案
    const subscribePlan = document.querySelector('input[name="subscribe-plan"]:checked');
    data.subscribePlan = subscribePlan ? subscribePlan.nextElementSibling.textContent.trim() : '';
    
    // 配送方式
    const delivery = document.querySelector('input[name="delivery"]:checked');
    data.delivery = delivery ? delivery.nextElementSibling.textContent.trim() : '';
    
    // 付款方式
    const payment = document.querySelector('input[name="payment"]:checked');
    data.payment = payment ? payment.nextElementSibling.textContent.trim() : '';
    data.paymentValue = payment ? payment.value : '';
    
    // 總金額
    data.totalAmount = document.getElementById('total-price').textContent;
    
    // 匯款資料
    data.orderDate = document.getElementById('order-date').value;
    data.remittanceAccount = document.getElementById('remittance-account').value;
    data.remittanceDate = document.getElementById('remittance-date').value;
    data.remittanceAmount = document.getElementById('remittance-amount').value;
    
    // 信用卡資料
    data.cardNumber = document.getElementById('card-number').value;
    data.cardholderName = document.getElementById('cardholder-name').value;
    const cardMonth = document.querySelector('select[name="card-month"]');
    const cardYear = document.querySelector('select[name="card-year"]');
    data.cardMonth = cardMonth ? cardMonth.value : '';
    data.cardYear = cardYear ? cardYear.value : '';
    data.orderAmount = document.getElementById('order-amount').value;
    
    // 發票資訊
    data.taxId = document.getElementById('tax-id').value;
    data.invoiceTitle = document.getElementById('invoice-title').value;
    data.companyContact = document.getElementById('company-contact').value;
    data.companyOwner = document.getElementById('company-owner').value;
    data.companyAddress = document.getElementById('company-address').value;
    data.companyPhone = document.getElementById('company-phone').value;
    
    // 收件人資料
    const subscriptionType = document.querySelector('input[name="subscription-type"]:checked');
    data.subscriptionType = subscriptionType ? subscriptionType.nextElementSibling.textContent.trim() : '';
    data.subscriberName = document.getElementById('subscriber-name').value;
    data.subscriberEmail = document.getElementById('subscriber-email').value;
    data.subscriberPhone = document.getElementById('subscriber-phone').value;
    data.subscriberMobile = document.getElementById('subscriber-mobile').value;
    data.recipientAddress = document.getElementById('recipient-address').value;
    
    return data;
}

function validateRequiredFields(data) {
    // 檢查基本必填欄位
    const requiredFields = ['subscribePlan', 'delivery', 'payment', 'subscriberName', 'subscriberEmail', 'subscriberPhone', 'recipientAddress'];

    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            return { success: false, message: '請填寫完整的必要資訊後再發送' };
        }
    }

    // 個別欄位格式驗證
    const emailInput = document.getElementById('subscriber-email');
    const phoneInput = document.getElementById('subscriber-phone');
    const mobileInput = document.getElementById('subscriber-mobile');
    const companyPhoneInput = document.getElementById('company-phone');

    // Email格式驗證
    if (emailInput && emailInput.value && !validateEmailFormat(emailInput.value)) {
        showFieldError(emailInput, 'Email格式不正確');
        return { success: false, message: 'Email格式不正確，請重新輸入' };
    }

    // 聯絡電話格式驗證
    if (phoneInput && phoneInput.value && !validatePhoneFormat(phoneInput.value)) {
        showFieldError(phoneInput, '請輸入數字');
        return { success: false, message: '聯絡電話格式不正確，請輸入數字' };
    }

    // 手機格式驗證
    if (mobileInput && mobileInput.value && !validateMobileFormat(mobileInput.value)) {
        showFieldError(mobileInput, '手機號碼格式不正確');
        return { success: false, message: '手機號碼格式不正確，請輸入10碼數字' };
    }

    // 發票資訊聯絡電話格式驗證
    if (companyPhoneInput && companyPhoneInput.value && !validatePhoneFormat(companyPhoneInput.value)) {
        showFieldError(companyPhoneInput, '請輸入數字');
        return { success: false, message: '發票資訊中的聯絡電話格式不正確，請輸入數字' };
    }

    // 根據付款方式檢查相關欄位
    if (data.paymentValue === 'bank') {
        if (!data.orderDate || !data.remittanceAccount || !data.remittanceDate) {
            return { success: false, message: '請填寫完整的匯款資料（訂購日期、匯款帳戶後五碼、匯款日期）' };
        }
    } else if (data.paymentValue === 'credit') {
        if (!data.cardNumber || !data.cardholderName || !data.cardMonth || !data.cardYear) {
            return { success: false, message: '請填寫完整的信用卡資料（卡號、持卡人姓名、有效期限）' };
        }
    }

    return { success: true };
}

// 格式驗證輔助函數
function validateEmailFormat(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email.trim());
}

function validatePhoneFormat(phone) {
    // 只檢查是否為數字
    return !/\D/.test(phone.trim());
}

function validateMobileFormat(mobile) {
    const cleanMobile = mobile.replace(/\D/g, '');
    return cleanMobile.length === 10 && cleanMobile.startsWith('09');
}

function formatEmailContent(data) {
    let content = `數位狂潮雜誌訂閱申請資料\n`;
    content += `================================\n\n`;
    
    // 訂閱資訊
    content += `【訂閱資訊】\n`;
    content += `訂閱方案：${data.subscribePlan}\n`;
    content += `配送方式：${data.delivery}\n`;
    content += `付款方式：${data.payment}\n`;
    content += `總金額：${data.totalAmount}\n\n`;
    
    // 付款資料
    if (data.paymentValue === 'bank') {
        content += `【匯款資料】\n`;
        content += `訂購日期：${data.orderDate}\n`;
        content += `匯款帳戶後五碼：${data.remittanceAccount}\n`;
        content += `匯款日期：${data.remittanceDate}\n`;
        content += `匯款金額：${data.remittanceAmount}\n\n`;
    } else if (data.paymentValue === 'credit') {
        content += `【信用卡資料】\n`;
        content += `信用卡卡號：${data.cardNumber}\n`;
        content += `持卡人姓名：${data.cardholderName}\n`;
        content += `有效期限：${data.cardMonth}/${data.cardYear}\n`;
        content += `訂購金額：${data.orderAmount}\n\n`;
    }
    
    // 發票資訊（如有填寫）
    if (data.taxId || data.invoiceTitle) {
        content += `【發票資訊】\n`;
        if (data.taxId) content += `統一編號：${data.taxId}\n`;
        if (data.invoiceTitle) content += `發票抬頭：${data.invoiceTitle}\n`;
        if (data.companyContact) content += `公司聯絡人：${data.companyContact}\n`;
        if (data.companyOwner) content += `公司負責人：${data.companyOwner}\n`;
        if (data.companyAddress) content += `公司營利地址：${data.companyAddress}\n`;
        if (data.companyPhone) content += `聯絡電話：${data.companyPhone}\n`;
        content += `\n`;
    }
    
    // 收件人資料
    content += `【收件人資料】\n`;
    content += `訂閱類型：${data.subscriptionType}\n`;
    content += `收件單位/收件人：${data.subscriberName}\n`;
    content += `E-mail：${data.subscriberEmail}\n`;
    content += `聯絡電話：${data.subscriberPhone}\n`;
    if (data.subscriberMobile) content += `手機：${data.subscriberMobile}\n`;
    content += `收件地址：${data.recipientAddress}\n\n`;
    
    content += `================================\n`;
    content += `此訂閱申請由數位狂潮雜誌官網自動產生\n`;
    content += `申請時間：${new Date().toLocaleString('zh-TW')}\n`;
    
    return content;
}

// 訊息顯示函數
function showMessage(message, type = 'info') {
    const messageDisplay = document.getElementById('message-display');
    if (!messageDisplay) return;

    // 清除現有的樣式類別
    messageDisplay.className = 'message-display';
    messageDisplay.textContent = message;

    // 加入新的樣式類別
    messageDisplay.classList.add(type, 'show');

    // 5秒後自動隱藏訊息
    setTimeout(() => {
        messageDisplay.classList.remove('show');
    }, 5000);
}

