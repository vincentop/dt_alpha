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

    // 訂閱類型切換發票資訊顯示
    const subscriptionTypeRadios = document.querySelectorAll('input[name="subscription-type"]');
    const invoiceSection = document.getElementById('invoice-section');

    function toggleInvoiceSection() {
        const selectedType = document.querySelector('input[name="subscription-type"]:checked');
        if (selectedType && invoiceSection) {
            if (selectedType.value === 'company') {
                invoiceSection.style.display = 'block';
            } else {
                invoiceSection.style.display = 'none';
            }
        }
    }

    subscriptionTypeRadios.forEach(radio => radio.addEventListener('change', toggleInvoiceSection));
    toggleInvoiceSection(); // 初始化

    // 隱私權同意checkbox控制按鈕啟用狀態
    const privacyAgreement = document.getElementById('privacy-agreement');
    const sendEmailBtn = document.getElementById('send-email-btn');
    const agreementCheckbox = document.querySelector('.agreement-checkbox');

    if (privacyAgreement && sendEmailBtn && agreementCheckbox) {
        // 處理checkbox狀態變化
        privacyAgreement.addEventListener('change', function() {
            sendEmailBtn.disabled = !this.checked;
            agreementCheckbox.classList.toggle('checked', this.checked);
        });

        // 處理整個區域的點擊事件
        agreementCheckbox.addEventListener('click', function(e) {
            // 如果點擊的不是checkbox本身，則手動觸發checkbox點擊
            if (e.target !== privacyAgreement) {
                e.preventDefault();
                privacyAgreement.checked = !privacyAgreement.checked;
                privacyAgreement.dispatchEvent(new Event('change'));
            }
        });
    }

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
            window.showFieldError(emailInput, 'Email格式不正確');
            return false;
        } else {
            window.clearFieldError(emailInput);
            return true;
        }
    }

    function clearEmailError() {
        window.clearFieldError(emailInput);
    }

    // 持卡人姓名驗證（只允許英文字母和空格，自動轉大寫）
    const cardholderNameInput = document.getElementById('cardholder-name');
    if (cardholderNameInput) {
        cardholderNameInput.addEventListener('input', function(e) {
            // 只保留英文字母和空格，並轉為大寫
            e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
        });

        cardholderNameInput.addEventListener('blur', function(e) {
            const name = e.target.value.trim();
            if (name && /[^a-zA-Z\s]/.test(name)) {
                window.showFieldError(e.target, '持卡人姓名只能包含英文字母');
                return false;
            } else {
                window.clearFieldError(e.target);
                return true;
            }
        });
    }

    // 信用卡有效期限驗證（月份和年份）
    const cardMonthInput = document.getElementById('card-month');
    const cardYearInput = document.getElementById('card-year');

    if (cardMonthInput) {
        cardMonthInput.addEventListener('input', function(e) {
            // 只保留數字
            let value = e.target.value.replace(/\D/g, '');
            // 限制最多2碼
            value = value.slice(0, 2);
            e.target.value = value;
        });

        cardMonthInput.addEventListener('blur', function(e) {
            let value = e.target.value;
            if (value) {
                const month = parseInt(value, 10);
                if (month < 1 || month > 12) {
                    window.showFieldError(e.target, '月份必須為 01~12');
                    return false;
                } else {
                    // 自動補0 (例如 1 變成 01)
                    e.target.value = value.padStart(2, '0');
                    window.clearFieldError(e.target);
                    return true;
                }
            } else {
                window.clearFieldError(e.target);
            }
        });
    }

    if (cardYearInput) {
        cardYearInput.addEventListener('input', function(e) {
            // 只保留數字
            let value = e.target.value.replace(/\D/g, '');
            // 限制最多2碼
            value = value.slice(0, 2);
            e.target.value = value;
        });

        cardYearInput.addEventListener('blur', function(e) {
            let value = e.target.value;
            if (value) {
                if (value.length !== 2) {
                    window.showFieldError(e.target, '年份必須為2碼數字');
                    return false;
                }

                // 檢查年份不能小於今年
                const currentYear = new Date().getFullYear() % 100; // 取得今年的後兩碼
                const inputYear = parseInt(value, 10);
                if (inputYear < currentYear) {
                    window.showFieldError(e.target, `年份不能小於今年 (${currentYear})`);
                    return false;
                }

                window.clearFieldError(e.target);
                return true;
            } else {
                window.clearFieldError(e.target);
            }
        });
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
            window.showFieldError(e.target, '請輸入數字');
            return false;
        } else {
            window.clearFieldError(e.target);
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
            window.showFieldError(e.target, '手機號碼必須為10碼數字');
            return false;
        } else if (mobile && !mobile.startsWith('09')) {
            window.showFieldError(e.target, '手機號碼必須以09開頭');
            return false;
        } else {
            window.clearFieldError(e.target);
            return true;
        }
    }

    // 通用錯誤顯示函數 - 設為全域
    window.showFieldError = function(input, message) {
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
    };

    window.clearFieldError = function(input) {
        input.style.borderColor = '';
        input.style.backgroundColor = '';

        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    };

    // 將函數設為全域，讓 sendEmail 可以訪問
    window.highlightMissingField = function(element) {
        if (element) {
            element.style.borderColor = '#dc2626';
            element.style.backgroundColor = '#fef2f2';
            element.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
            element.classList.add('missing-field');

            // 移除自動滾動功能，讓使用者可以看到底部的 toast 通知
            // element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // 將函數設為全域，讓 sendEmail 可以訪問
    window.clearAllFieldHighlights = function() {
        const highlightedFields = document.querySelectorAll('input[style*="border-color"], select[style*="border-color"]');
        highlightedFields.forEach(field => {
            field.style.borderColor = '';
            field.style.backgroundColor = '';
            field.style.boxShadow = '';
            field.classList.remove('missing-field');
        });
    };

    // 為所有輸入欄位添加焦點事件，清除高亮
    const allInputs = document.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (this.style.borderColor === 'rgb(220, 38, 38)') {
                this.style.borderColor = '';
                this.style.backgroundColor = '';
                this.style.boxShadow = '';
                this.classList.remove('missing-field');
            }
        });
    });

    // 也將清除單個欄位的函數設為全域
    window.clearFieldHighlight = function(element) {
        if (element) {
            element.style.borderColor = '';
            element.style.backgroundColor = '';
            element.style.boxShadow = '';
            element.classList.remove('missing-field');
        }
    };
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
        console.log('驗證結果:', validation);

        if (!validation.success) {
            console.log('驗證失敗:', validation.message);
            showMessage(validation.message, 'error');
            return;
        }

        // 建立 email 內容
        const emailContent = formatEmailContent(formData);
        console.log('Email內容已生成');

        // 建立包含收件人名字和日期的主旨
        const today = new Date();
        const todayString = today.getFullYear() + '-' +
                           String(today.getMonth() + 1).padStart(2, '0') + '-' +
                           String(today.getDate()).padStart(2, '0'); // 格式: YYYY-MM-DD
        const subscriberName = formData.subscriberName || '未提供姓名';
        const subject = `數位狂潮雜誌訂閱申請_${subscriberName}_${todayString}`;

        // 發送 email - 在新視窗中開啟
        const mailto = `mailto:Helen_Tseng@asus.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent)}`;
        console.log('準備開啟郵件:', mailto.substring(0, 100) + '...');

        window.open(mailto, '_blank');

        // 發送成功提示
        setTimeout(() => {
            showMessage('郵件已開啟，請在郵件程式中完成發送！', 'success');
        }, 1000);

    } catch (error) {
        console.error('發送郵件時發生錯誤:', error);
        console.error('錯誤堆疊:', error.stack);
        showMessage(`發送郵件時發生錯誤: ${error.message}`, 'error');
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

    // 起始期數
    const subscriptionPeriod = document.querySelector('input[name="subscription-period"]:checked');
    data.subscriptionPeriod = subscriptionPeriod ? subscriptionPeriod.nextElementSibling.textContent.trim() : '';

    // 付款方式
    const payment = document.querySelector('input[name="payment"]:checked');
    data.payment = payment ? payment.nextElementSibling.textContent.trim() : '';
    data.paymentValue = payment ? payment.value : '';
    
    // 總金額
    const totalPriceEl = document.getElementById('total-price');
    data.totalAmount = totalPriceEl ? totalPriceEl.textContent : '';

    // 匯款資料
    const remittanceAccountEl = document.getElementById('remittance-account');
    const remittanceDateEl = document.getElementById('remittance-date');
    const remittanceAmountEl = document.getElementById('remittance-amount');
    data.remittanceAccount = remittanceAccountEl ? remittanceAccountEl.value : '';
    data.remittanceDate = remittanceDateEl ? remittanceDateEl.value : '';
    data.remittanceAmount = remittanceAmountEl ? remittanceAmountEl.value : '';

    // 信用卡資料
    const cardNumberEl = document.getElementById('card-number');
    const cardholderNameEl = document.getElementById('cardholder-name');
    const cardMonthEl = document.getElementById('card-month');
    const cardYearEl = document.getElementById('card-year');
    const orderAmountEl = document.getElementById('order-amount');
    data.cardNumber = cardNumberEl ? cardNumberEl.value : '';
    data.cardholderName = cardholderNameEl ? cardholderNameEl.value : '';
    data.cardMonth = cardMonthEl ? cardMonthEl.value : '';
    data.cardYear = cardYearEl ? cardYearEl.value : '';
    data.orderAmount = orderAmountEl ? orderAmountEl.value : '';

    // 發票資訊
    const taxIdEl = document.getElementById('tax-id');
    const invoiceTitleEl = document.getElementById('invoice-title');
    const companyContactEl = document.getElementById('company-contact');
    const companyOwnerEl = document.getElementById('company-owner');
    const companyAddressEl = document.getElementById('company-address');
    const companyPhoneEl = document.getElementById('company-phone');
    data.taxId = taxIdEl ? taxIdEl.value : '';
    data.invoiceTitle = invoiceTitleEl ? invoiceTitleEl.value : '';
    data.companyContact = companyContactEl ? companyContactEl.value : '';
    data.companyOwner = companyOwnerEl ? companyOwnerEl.value : '';
    data.companyAddress = companyAddressEl ? companyAddressEl.value : '';
    data.companyPhone = companyPhoneEl ? companyPhoneEl.value : '';

    // 收件人資料
    const subscriptionType = document.querySelector('input[name="subscription-type"]:checked');
    data.subscriptionType = subscriptionType ? subscriptionType.nextElementSibling.textContent.trim() : '';
    const subscriberNameEl = document.getElementById('subscriber-name');
    const subscriberEmailEl = document.getElementById('subscriber-email');
    const subscriberPhoneEl = document.getElementById('subscriber-phone');
    const subscriberMobileEl = document.getElementById('subscriber-mobile');
    const recipientAddressEl = document.getElementById('recipient-address');
    data.subscriberName = subscriberNameEl ? subscriberNameEl.value : '';
    data.subscriberEmail = subscriberEmailEl ? subscriberEmailEl.value : '';
    data.subscriberPhone = subscriberPhoneEl ? subscriberPhoneEl.value : '';
    data.subscriberMobile = subscriberMobileEl ? subscriberMobileEl.value : '';
    data.recipientAddress = recipientAddressEl ? recipientAddressEl.value : '';
    
    return data;
}

function validateRequiredFields(data) {
    // 清除之前的錯誤高亮
    if (window.clearAllFieldHighlights) {
        window.clearAllFieldHighlights();
    }

    // 檢查基本必填欄位
    const requiredFields = [
        { key: 'subscribePlan', name: '訂閱方案', element: null },
        { key: 'delivery', name: '寄送方式', element: null },
        { key: 'payment', name: '付款方式', element: null },
        { key: 'subscriberName', name: '收件人姓名', element: document.getElementById('subscriber-name') },
        { key: 'subscriberEmail', name: 'Email', element: document.getElementById('subscriber-email') },
        { key: 'subscriberMobile', name: '手機', element: document.getElementById('subscriber-mobile') },
        { key: 'recipientAddress', name: '收件地址', element: document.getElementById('recipient-address') }
    ];

    const missingFields = [];

    for (const field of requiredFields) {
        if (!data[field.key] || data[field.key].trim() === '') {
            missingFields.push(field.name);
            if (field.element && window.highlightMissingField) {
                window.highlightMissingField(field.element);
            }
        }
    }

    if (missingFields.length > 0) {
        return {
            success: false,
            message: `請填寫必要資訊：${missingFields.join('、')}`
        };
    }

    // 個別欄位格式驗證
    const emailInput = document.getElementById('subscriber-email');
    const phoneInput = document.getElementById('subscriber-phone');
    const mobileInput = document.getElementById('subscriber-mobile');
    const companyPhoneInput = document.getElementById('company-phone');

    // Email格式驗證
    if (emailInput && emailInput.value && !validateEmailFormat(emailInput.value)) {
        if (window.highlightMissingField) window.highlightMissingField(emailInput);
        if (window.showFieldError) window.showFieldError(emailInput, 'Email格式不正確');
        return { success: false, message: 'Email格式不正確，請重新輸入' };
    }

    // 聯絡電話格式驗證
    if (phoneInput && phoneInput.value && !validatePhoneFormat(phoneInput.value)) {
        if (window.highlightMissingField) window.highlightMissingField(phoneInput);
        if (window.showFieldError) window.showFieldError(phoneInput, '請輸入數字');
        return { success: false, message: '聯絡電話格式不正確，請輸入數字' };
    }

    // 手機格式驗證
    if (mobileInput && mobileInput.value && !validateMobileFormat(mobileInput.value)) {
        if (window.highlightMissingField) window.highlightMissingField(mobileInput);
        if (window.showFieldError) window.showFieldError(mobileInput, '手機號碼格式不正確');
        return { success: false, message: '手機號碼格式不正確' };
    }

    // 發票資訊聯絡電話格式驗證
    if (companyPhoneInput && companyPhoneInput.value && !validatePhoneFormat(companyPhoneInput.value)) {
        if (window.highlightMissingField) window.highlightMissingField(companyPhoneInput);
        if (window.showFieldError) window.showFieldError(companyPhoneInput, '請輸入數字');
        return { success: false, message: '發票資訊中的聯絡電話格式不正確，請輸入數字' };
    }

    // 檢查隱私權同意checkbox
    const privacyAgreement = document.getElementById('privacy-agreement');
    if (!privacyAgreement || !privacyAgreement.checked) {
        return { success: false, message: '請勾選同意隱私權聲明才能發送申請' };
    }

    // 根據付款方式檢查相關欄位
    if (data.paymentValue === 'bank') {
        const bankFields = [
            { data: data.remittanceAccount, element: document.getElementById('remittance-account'), name: '匯款帳戶後五碼' },
            { data: data.remittanceDate, element: document.getElementById('remittance-date'), name: '匯款日期' }
        ];

        const missingBankFields = [];
        for (const field of bankFields) {
            if (!field.data || field.data.trim() === '') {
                missingBankFields.push(field.name);
                if (field.element && window.highlightMissingField) {
                    window.highlightMissingField(field.element);
                }
            }
        }

        if (missingBankFields.length > 0) {
            return { success: false, message: `請填寫完整的匯款資料：${missingBankFields.join('、')}` };
        }

        // 檢查匯款帳戶後五碼格式
        const remittanceAccountInput = document.getElementById('remittance-account');
        if (data.remittanceAccount && data.remittanceAccount.length !== 5) {
            if (window.highlightMissingField) window.highlightMissingField(remittanceAccountInput);
            return { success: false, message: '匯款帳戶後五碼必須為5位數字' };
        }
    } else if (data.paymentValue === 'credit') {
        const creditFields = [
            { data: data.cardNumber, element: document.getElementById('card-number'), name: '信用卡卡號' },
            { data: data.cardholderName, element: document.getElementById('cardholder-name'), name: '持卡人姓名' },
            { data: data.cardMonth, element: document.getElementById('card-month'), name: '有效期限月份' },
            { data: data.cardYear, element: document.getElementById('card-year'), name: '有效期限年份' }
        ];

        const missingCreditFields = [];
        for (const field of creditFields) {
            if (!field.data || field.data.trim() === '') {
                missingCreditFields.push(field.name);
                if (field.element && window.highlightMissingField) {
                    window.highlightMissingField(field.element);
                }
            }
        }

        if (missingCreditFields.length > 0) {
            return { success: false, message: `請填寫完整的信用卡資料：${missingCreditFields.join('、')}` };
        }

        // 檢查信用卡號格式（移除連字號後應為16碼）
        const cardNumberInput = document.getElementById('card-number');
        const cardNumberClean = data.cardNumber.replace(/\D/g, '');
        if (cardNumberClean.length !== 16) {
            if (window.highlightMissingField) window.highlightMissingField(cardNumberInput);
            return { success: false, message: '信用卡卡號必須為16位數字' };
        }

        // 檢查月份格式（01-12）
        const cardMonthInput = document.getElementById('card-month');
        const month = parseInt(data.cardMonth, 10);
        if (isNaN(month) || month < 1 || month > 12) {
            if (window.highlightMissingField) window.highlightMissingField(cardMonthInput);
            return { success: false, message: '有效期限月份必須為 01~12' };
        }

        // 檢查年份格式（2碼數字）
        const cardYearInput = document.getElementById('card-year');
        if (data.cardYear.length !== 2 || isNaN(data.cardYear)) {
            if (window.highlightMissingField) window.highlightMissingField(cardYearInput);
            return { success: false, message: '有效期限年份必須為2碼數字' };
        }

        // 檢查年份不能小於今年
        const currentYear = new Date().getFullYear() % 100; // 取得今年的後兩碼
        const inputYear = parseInt(data.cardYear, 10);
        if (inputYear < currentYear) {
            if (window.highlightMissingField) window.highlightMissingField(cardYearInput);
            return { success: false, message: `有效期限年份不能小於今年 (${currentYear})` };
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
    content += `起始期數：${data.subscriptionPeriod}\n`;
    content += `付款方式：${data.payment}\n`;
    content += `總金額：${data.totalAmount}\n\n`;
    
    // 付款資料
    if (data.paymentValue === 'bank') {
        content += `【匯款資料】\n`;
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

