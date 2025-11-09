function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.getAttribute('data-field');
    let isValid = true;
    let errorText = '';

    switch(fieldType) {
        case 'firstName':
        case 'lastName':
            if (value.length < 2) {
                isValid = false;
                errorText = 'Please enter a valid value';
            }
            break;
        case 'email':
            if (!isValidEmail(value)) {
                isValid = false;
                errorText = 'Please enter a valid value';
            }
            break;
        case 'password':
            if (value.length < 6) {
                isValid = false;
                errorText = 'Please enter a valid value';
            }
            break;
        case 'repeatPassword':
            const passwordField = document.querySelector('input[data-field="password"]');
            if (value !== passwordField.value) {
                isValid = false;
                errorText = 'Please enter a valid value';
            }
            break;
        case 'birthDate':
            // Для поля даты проверяем только если оно не пустое
            if (value !== '' && !isValidDate(value)) {
                isValid = false;
                errorText = 'Please enter a valid date';
            }
            break;
    }

    // Находим контейнер поля
    const container = field.closest('.input, .div-2');
    if (container) {
        const errorMessage = container.querySelector('.error-message');
        const inputContainer = container.querySelector('.input-2');
        const redCircle = container.querySelector('.ellipse-2');
        
        if (!isValid) {
            // Добавляем класс ошибки к полю ввода и контейнеру
            field.classList.add('error');
            if (inputContainer) {
                inputContainer.classList.add('error');
            }
            
            // Показываем ошибку и красную точку
            if (errorMessage) {
                errorMessage.textContent = errorText;
                errorMessage.style.display = 'block';
                container.classList.add('has-error');
            }
            if (inputContainer) {
                inputContainer.style.borderColor = 'var(--red)';
            }
            if (redCircle && fieldType !== 'birthDate') {
                redCircle.style.display = 'block';
            }
        } else {
            // Убираем класс ошибки
            field.classList.remove('error');
            if (inputContainer) {
                inputContainer.classList.remove('error');
            }
            
            // Скрываем ошибку и красную точку
            if (errorMessage) {
                errorMessage.style.display = 'none';
                container.classList.remove('has-error');
            }
            if (inputContainer) {
                inputContainer.style.borderColor = 'var(--violet-light)';
            }
            if (redCircle && fieldType !== 'birthDate') {
                // Для обязательных полей скрываем красную точку только если поле заполнено и валидно
                if (value.length > 0) {
                    redCircle.style.display = 'none';
                } else {
                    redCircle.style.display = 'block';
                }
            }
        }
    }

    return isValid;
}
// Проверка чекбоксов
function validateCheckboxes() {
    const checkbox1 = document.querySelector('.checkbox .checkbox-input');
    const checkbox2 = document.querySelector('.checkbox-2 .checkbox-input');
    let isValid = true;

    // Проверяем второй чекбокс (согласие на обработку данных)
    if (!checkbox2.checked) {
        showCheckboxError(checkbox2, 'You must accept the terms and conditions');
        isValid = false;
    } else {
        hideCheckboxError(checkbox2);
    }

    return isValid;
}

// Показать ошибку для чекбокса
function showCheckboxError(checkbox, message) {
    const container = checkbox.closest('.checkbox, .checkbox-2');
    let errorMessage = container.querySelector('.checkbox-error');
    
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.className = 'checkbox-error';
        container.appendChild(errorMessage);
    }
    
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    container.classList.add('has-error');
}

// Скрыть ошибку для чекбокса
function hideCheckboxError(checkbox) {
    const container = checkbox.closest('.checkbox, .checkbox-2');
    const errorMessage = container.querySelector('.checkbox-error');
    
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
    container.classList.remove('has-error');
}

// Проверка email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Проверка даты в формате DD.MM.YYYY (необязательное поле)
function isValidDate(dateString) {
    if (dateString === '') return true; // Пустое поле - валидно
    
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(dateString)) return false;

    const parts = dateString.split('.');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Проверка корректности даты
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // Проверка для месяцев с 30 днями
    if ([4, 6, 9, 11].includes(month) && day > 30) return false;
    
    // Проверка февраля
    if (month === 2) {
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        if (day > (isLeapYear ? 29 : 28)) return false;
    }

    // Проверка что дата не в будущем
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return inputDate <= today;
}

// Проверка всей формы
function validateForm() {
    let isFormValid = true;
    const fieldsToValidate = document.querySelectorAll('.input-field[data-field]');
    
    // Проверяем поля ввода
    fieldsToValidate.forEach(field => {
        // Пропускаем необязательные пустые поля
        const fieldType = field.getAttribute('data-field');
        const value = field.value.trim();
        
        if (fieldType === 'birthDate' && value === '') {
            // Поле даты пустое и необязательное - пропускаем валидацию
            return;
        }
        
        if (!validateField(field)) {
            isFormValid = false;
        }
    });

    // Проверяем чекбоксы
    if (!validateCheckboxes()) {
        isFormValid = false;
    }

    return isFormValid;
}

// Инициализация валидации
function initValidation() {
    // Добавляем data-атрибуты для полей
    const fields = document.querySelectorAll('.input-field');
    fields.forEach(field => {
        const container = field.closest('.input, .div-2');
        if (container) {
            const label = container.querySelector('.title');
            if (label) {
                const labelText = label.textContent.toLowerCase();
                if (labelText.includes('first name')) field.setAttribute('data-field', 'firstName');
                else if (labelText.includes('last name')) field.setAttribute('data-field', 'lastName');
                else if (labelText.includes('email')) field.setAttribute('data-field', 'email');
                else if (labelText.includes('password') && !labelText.includes('repeat')) field.setAttribute('data-field', 'password');
                else if (labelText.includes('repeat')) field.setAttribute('data-field', 'repeatPassword');
                else if (labelText.includes('date of birth')) field.setAttribute('data-field', 'birthDate');
            }
            
            // Убираем красный кружок с поля даты (оно необязательное)
            if (container.querySelector('.title')?.textContent.toLowerCase().includes('date of birth')) {
                const redCircle = container.querySelector('.ellipse-2');
                if (redCircle) {
                    redCircle.style.display = 'none';
                }
            }
        }

        // Создаем элемент для сообщения об ошибке
        if (!container.querySelector('.error-message')) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            container.appendChild(errorMessage);
        }

        // Обработчики событий для валидации
        field.addEventListener('blur', function() {
            validateField(this);
        });

        field.addEventListener('input', function() {
            // При вводе убираем красную обводку, но оставляем сообщение об ошибке до повторной проверки
            const container = this.closest('.input, .div-2');
            const inputContainer = container.querySelector('.input-2');
            if (inputContainer) {
                inputContainer.style.borderColor = 'var(--violet-light)';
            }
            
            // Специальная проверка для повторного пароля при изменении основного пароля
            if (this.getAttribute('data-field') === 'password') {
                const repeatPassword = document.querySelector('input[data-field="repeatPassword"]');
                if (repeatPassword && repeatPassword.value) {
                    validateField(repeatPassword);
                }
            }
        });
    });

    // Добавляем обработчики для чекбоксов
    const checkboxes = document.querySelectorAll('.checkbox-input');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // При изменении состояния чекбокса убираем ошибку
            hideCheckboxError(this);
            
            // Обновляем стиль чекбокса
            const rectangle = this.nextElementSibling.querySelector('.rectangle');
            if (this.checked) {
                rectangle.style.backgroundColor = 'var(--violet)';
                rectangle.style.borderColor = 'var(--violet)';
            } else {
                rectangle.style.backgroundColor = 'var(--white)';
                rectangle.style.borderColor = 'var(--violet-light)';
            }
        });
    });

    // Обработчик для кнопки регистрации
    const registerButton = document.querySelector('.button-filled');
    if (registerButton) {
        registerButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                // Форма валидна, переходим на следующую страницу
                window.location.href = 'success.html';
            } else {
                // Показываем общее сообщение об ошибке
                const firstError = document.querySelector('.error-message[style*="display: block"], .checkbox-error[style*="display: block"]');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }
}

// Добавляем стили для сообщений об ошибках
const validationStyles = `
    .error-message {
        font-family: var(--regular-14-font-family);
        font-size: 12px;
        color: var(--red);
        display: none;
        position: absolute;
        bottom: -18px;
        left: 0;
        width: 100%;
        pointer-events: none;
    }
    
    .checkbox-error {
        font-family: var(--regular-14-font-family);
        font-size: 12px;
        color: var(--red);
        display: none;
        margin-top: 5px;
        width: 100%;
    }
    
    .input, .div-2 {
        position: relative;
        margin-bottom: 25px;
    }
    
    .input.has-error, .div-2.has-error {
        margin-bottom: 30px;
    }
    
    .checkbox, .checkbox-2 {
        position: relative;
        margin-bottom: 15px;
    }
    
    .checkbox.has-error, .checkbox-2.has-error {
        margin-bottom: 25px;
    }
    
    .input-2.error {
        border-color: var(--red) !important;
        animation: shake 0.5s ease;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = validationStyles;
document.head.appendChild(styleSheet);

// Инициализируем валидацию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Ждем немного, чтобы остальной код инициализировался
    setTimeout(initValidation, 100);
});