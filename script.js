const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .clear-button {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 22px;
    color: var(--black);
    font-weight: normal;
    transition: all 0.3s ease;
    z-index: 2;
  }
  
  .clear-button:hover {
    color: var(--violet);
    transform: translateY(-50%) scale(1.1);
  }
  
  .input-2 {
    position: relative;
  }
`;
document.head.appendChild(style);

// Функция для обновления стрелочек календаря
function updateCalendarArrows() {
  const prevIcon = document.querySelector('.datepicker-nav-button.prev img');
  const nextIcon = document.querySelector('.datepicker-nav-button.next img');
  
  if (prevIcon && nextIcon) {
    if (document.body.classList.contains('dark-theme')) {
      prevIcon.src = 'img/right_black.svg';
      nextIcon.src = 'img/right_black.svg';
    } else {
      prevIcon.src = 'img/right.svg';
      nextIcon.src = 'img/right.svg';
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Элементы календаря
  const datepickerOverlay = document.getElementById('datepicker-overlay');
  const datepickerClose = document.querySelector('.datepicker-close');
  const datepickerBody = document.querySelector('.datepicker-body');
  const daysContainer = document.querySelector('.datepicker-days');
  
  // Поле ввода даты
  const dateInput = document.querySelector('input[placeholder="DD.MM.YYYY"]');
  
  let currentDate = new Date();
  let selectedDate = null;
  
  // Переменные для быстрой прокрутки
  let scrollInterval = null;
  let scrollTimeout = null;
  let scrollSpeed = 300; // начальная скорость в мс
  let minScrollSpeed = 50; // минимальная скорость (максимальная частота)
  let scrollAcceleration = 0.9; // коэффициент ускорения (чем меньше, тем быстрее ускоряется)
  let isScrolling = false;
  let currentDirection = 0; // 1 для вперед, -1 для назад

  // Месяцы на русском
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULE', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  // Создаем крестик для поля даты
  if (dateInput) {
    const clearButton = document.createElement('div');
    clearButton.className = 'clear-button';
    clearButton.innerHTML = '×';
    clearButton.style.display = 'none';
    
    // Добавляем крестик в контейнер инпута даты
    dateInput.parentElement.appendChild(clearButton);
    
    // Обработчик для показа/скрытия крестика
    dateInput.addEventListener('input', function() {
      if (this.value.length > 0) {
        this.style.color = 'var(--violet)';
        clearButton.style.display = 'flex';
      } else {
        this.style.color = 'var(--black)';
        clearButton.style.display = 'none';
      }
    });
    
    // Очистка поля даты при клике на крестик
    clearButton.addEventListener('click', function(e) {
      e.stopPropagation(); // Предотвращаем открытие календаря
      dateInput.value = '';
      dateInput.style.color = 'var(--black)';
      clearButton.style.display = 'none';
      // Сбрасываем выбранную дату в календаре
      selectedDate = null;
      renderCalendar();
      dateInput.focus();
    });
  }

  // Инициализация календаря
  function initDatepicker() {
    createNavigation();
    renderCalendar();
    
    // Обработчики событий
    datepickerClose.addEventListener('click', closeDatepicker);
    
    // Закрытие по клику на overlay
    datepickerOverlay.addEventListener('click', function(e) {
      if (e.target === datepickerOverlay) {
        closeDatepicker();
      }
    });
  }

  // Создание навигации с загрузкой стрелок из файлов
  function createNavigation() {
    // Удаляем старые элементы управления
    const oldControls = document.querySelector('.datepicker-controls');
    if (oldControls) {
      oldControls.remove();
    }
    
    // Создаем новый контейнер для навигации
    const navigationContainer = document.createElement('div');
    navigationContainer.className = 'datepicker-navigation';
    
    const prevButton = document.createElement('button');
    prevButton.className = 'datepicker-nav-button prev';
    const prevIcon = document.createElement('img');
    // Используем функцию для установки правильного изображения
    prevIcon.src = document.body.classList.contains('dark-theme') ? 'img/right_black.svg' : 'img/right.svg';
    prevIcon.alt = '<';
    prevIcon.style.transform = 'rotate(180deg)';
    prevIcon.style.transition = 'all 0.3s ease';
    prevButton.appendChild(prevIcon);
    
    // Обработчики для одиночного клика и зажатия
    setupScrollHandlers(prevButton, -1);
    
    // Создаем элемент для отображения месяца и года
    const monthYearDisplay = document.createElement('div');
    monthYearDisplay.className = 'datepicker-month-year';
    
    const nextButton = document.createElement('button');
    nextButton.className = 'datepicker-nav-button next';
    const nextIcon = document.createElement('img');
    // Используем функцию для установки правильного изображения
    nextIcon.src = document.body.classList.contains('dark-theme') ? 'img/right_black.svg' : 'img/right.svg';
    nextIcon.alt = '>';
    nextIcon.style.transition = 'all 0.3s ease';
    nextButton.appendChild(nextIcon);
    
    // Обработчики для одиночного клика и зажатия
    setupScrollHandlers(nextButton, 1);
    
    // Добавляем элементы в контейнер
    navigationContainer.appendChild(monthYearDisplay);
    navigationContainer.appendChild(prevButton);
    navigationContainer.appendChild(nextButton);
    
    // Вставляем навигацию перед календарем
    datepickerBody.insertBefore(navigationContainer, datepickerBody.querySelector('.datepicker-calendar'));
  }

  // Настройка обработчиков для одиночного клика и быстрой прокрутки
  function setupScrollHandlers(button, direction) {
    let isPressed = false;
    
    // Одиночный клик
    button.addEventListener('click', function(e) {
      if (!isScrolling) {
        changeMonth(direction);
      }
    });
    
    // Начало зажатия
    button.addEventListener('mousedown', function() {
      isPressed = true;
      currentDirection = direction; // Сохраняем направление
      // Запускаем непрерывную прокрутку после небольшой задержки
      scrollTimeout = setTimeout(() => {
        if (isPressed) {
          isScrolling = true;
          startContinuousScroll(direction);
        }
      }, 200); // Задержка перед началом непрерывной прокрутки
    });
    
    button.addEventListener('touchstart', function(e) {
      e.preventDefault();
      isPressed = true;
      currentDirection = direction; // Сохраняем направление
      scrollTimeout = setTimeout(() => {
        if (isPressed) {
          isScrolling = true;
          startContinuousScroll(direction);
        }
      }, 200);
    });
    
    // Конец зажатия
    const stopScroll = function() {
      isPressed = false;
      isScrolling = false;
      currentDirection = 0; // Сбрасываем направление
      stopContinuousScroll();
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
      }
    };
    
    button.addEventListener('mouseup', stopScroll);
    button.addEventListener('mouseleave', stopScroll);
    button.addEventListener('touchend', stopScroll);
    button.addEventListener('touchcancel', stopScroll);
    
    // Останавливаем прокрутку при потере фокуса
    button.addEventListener('blur', stopScroll);
  }
  
  // Начать непрерывную прокрутку
  function startContinuousScroll(direction) {
    // Сначала меняем месяц один раз
    changeMonth(direction);
    
    // Устанавливаем интервал с начальной скоростью
    scrollInterval = setInterval(() => {
      changeMonth(direction);
    }, scrollSpeed);
    
    // Ускоряем прокрутку со временем
    accelerateScroll(direction);
  }
  
  // Ускорить прокрутку
  function accelerateScroll(direction) {
    if (scrollInterval && isScrolling) {
      // Увеличиваем скорость (уменьшаем интервал)
      scrollSpeed = Math.max(minScrollSpeed, scrollSpeed * scrollAcceleration);
      
      // Перезапускаем интервал с новой скоростью
      clearInterval(scrollInterval);
      scrollInterval = setInterval(() => {
        changeMonth(direction); // Используем переданное направление
      }, scrollSpeed);
      
      // Продолжаем ускорение, если кнопка все еще зажата
      if (scrollSpeed > minScrollSpeed) {
        setTimeout(() => accelerateScroll(direction), 200);
      }
    }
  }
  
  // Остановить непрерывную прокрутку
  function stopContinuousScroll() {
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
    // Сбрасываем скорость до начальной
    scrollSpeed = 300;
    isScrolling = false;
  }
  
  // Изменить месяц
  function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
  }

  // Отрисовка календаря
  function renderCalendar() {
    // Обновляем отображение месяца и года
    updateMonthYearDisplay();
    
    // Очищаем контейнер дней
    daysContainer.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const startDay = firstDay.getDay();
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
    
    // Дни предыдущего месяца
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    for (let i = adjustedStartDay - 1; i >= 0; i--) {
      const day = document.createElement('button');
      day.className = 'datepicker-day other-month';
      day.textContent = prevMonthLastDay - i;
      day.disabled = true;
      daysContainer.appendChild(day);
    }
    
    // Дни текущего месяца
    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('button');
      dayElement.className = 'datepicker-day';
      dayElement.textContent = day;
      
      const currentDay = new Date(year, month, day);
      
      // Проверка на сегодня
      if (currentDay.toDateString() === today.toDateString()) {
        dayElement.classList.add('today');
      }
      
      // Проверка на выбранную дату
      if (selectedDate && currentDay.toDateString() === selectedDate.toDateString()) {
        dayElement.classList.add('selected');
      }
      
      // Проверка на будущие даты (нельзя выбрать дату в будущем)
      if (currentDay > today) {
        dayElement.classList.add('disabled');
        dayElement.disabled = true;
      }
      
      dayElement.addEventListener('click', function() {
        if (!dayElement.disabled) {
          selectDate(new Date(year, month, day));
        }
      });
      
      daysContainer.appendChild(dayElement);
    }
    
    // Дни следующего месяца
    const totalCells = 42; // 6 недель
    const remainingCells = totalCells - (adjustedStartDay + daysInMonth);
    
    for (let day = 1; day <= remainingCells; day++) {
      const dayElement = document.createElement('button');
      dayElement.className = 'datepicker-day other-month';
      dayElement.textContent = day;
      dayElement.disabled = true;
      daysContainer.appendChild(dayElement);
    }
  }

  // Обновление отображения месяца и года
  function updateMonthYearDisplay() {
    const monthYearDisplay = document.querySelector('.datepicker-month-year');
    if (monthYearDisplay) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      monthYearDisplay.textContent = `${months[month]} ${year}`;
    }
  }

  // Выбор даты
  function selectDate(date) {
    selectedDate = date;
    const formattedDate = formatDate(date);
    dateInput.value = formattedDate;
    dateInput.style.color = 'var(--violet)';
    
    // Показываем крестик при выборе даты
    const clearButton = dateInput.parentElement.querySelector('.clear-button');
    if (clearButton) {
      clearButton.style.display = 'flex';
    }
    
    closeDatepicker();
    renderCalendar();
  }

  // Форматирование даты в DD.MM.YYYY
  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  // Открытие календаря
  function openDatepicker() {
    if (selectedDate) {
      currentDate = new Date(selectedDate);
    } else {
      currentDate = new Date();
    }
    renderCalendar();
    datepickerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
  }

  // Закрытие календаря
  function closeDatepicker() {
    datepickerOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Разблокируем прокрутку страницы
  }

  // Обработчик клика на поле ввода даты
  dateInput.addEventListener('click', openDatepicker);
  dateInput.addEventListener('focus', openDatepicker);

  // Инициализация состояния крестика при загрузке
  setTimeout(() => {
    if (dateInput.value) {
      dateInput.style.color = 'var(--violet)';
      const clearButton = dateInput.parentElement.querySelector('.clear-button');
      if (clearButton) {
        clearButton.style.display = 'flex';
      }
    }
  }, 100);

  // Инициализация календаря
  initDatepicker();

  // Добавляем обработчик для обновления стрелок при изменении темы
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'class') {
        updateCalendarArrows();
      }
    });
  });
  
  observer.observe(document.body, {
    attributes: true
  });
});