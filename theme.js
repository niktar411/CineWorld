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

// Функция для переключения темы
function toggleTheme() {
  // Добавляем анимацию переключения
  document.body.style.transition = 'all 0.3s ease';
  document.body.classList.toggle('dark-theme');
  
  // Меняем значок лого в зависимости от темы
  const logoIcon = document.querySelector('.icon');
  if (document.body.classList.contains('dark-theme')) {
    localStorage.setItem('theme', 'dark');
    logoIcon.src = 'img/icon_black.svg'; // Темная версия лого
  } else {
    localStorage.setItem('theme', 'light');
    logoIcon.src = 'img/icon.svg'; // Светлая версия лого
  }
  
  // Обновляем стрелочки в календаре
  updateCalendarArrows();
}

// При загрузке страницы проверяем сохраненную тему
window.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme');
  const logoIcon = document.querySelector('.icon');
  
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    logoIcon.src = 'img/icon_black.svg';
  } else {
    logoIcon.src = 'img/icon.svg';
  }
  
  // Обновляем стрелочки в календаре после загрузки
  setTimeout(updateCalendarArrows, 100);
  
  // Добавляем обработчик для переключения темы
  const themeSwitch = document.getElementById('theme-switch');
  if (themeSwitch) {
    themeSwitch.addEventListener('click', toggleTheme);
  }
  
  // Добавляем обработчики для всех инпутов с анимацией
  const inputs = document.querySelectorAll('.input-field');
  inputs.forEach(input => {
    // Создаем крестик для очистки
    const clearButton = document.createElement('div');
    clearButton.className = 'clear-button';
    clearButton.innerHTML = '×';
    clearButton.style.display = 'none';
    
    // Добавляем крестик в контейнер инпута
    input.parentElement.appendChild(clearButton);
    
    // Находим красный кружок для этого поля
    const redCircle = input.parentElement.querySelector('.ellipse-2');
    
    // Обработчик для показа/скрытия крестика
    input.addEventListener('input', function() {
      if (this.value.length > 0) {
        this.style.color = 'var(--violet)';
        clearButton.style.display = 'flex';
        // Скрываем красный кружок при наличии текста
        if (redCircle) {
          redCircle.style.display = 'none';
        }
      } else {
        this.style.color = 'var(--black)';
        clearButton.style.display = 'none';
        // Показываем красный кружок при пустом поле
        if (redCircle) {
          redCircle.style.display = 'block';
        }
      }
    });
    
    // Очистка поля при клике на крестик
    clearButton.addEventListener('click', function() {
      input.value = '';
      input.style.color = 'var(--black)';
      clearButton.style.display = 'none';
      // Показываем красный кружок после очистки
      if (redCircle) {
        redCircle.style.display = 'block';
      }
      input.focus();
    });
    
    // Анимация при фокусе
    input.addEventListener('focus', function() {
      this.parentElement.style.transform = 'translateY(-2px)';
      this.parentElement.style.borderColor = 'var(--violet)';
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.style.transform = 'translateY(0)';
      this.parentElement.style.borderColor = 'var(--violet-light)';
    });
  });
  
  // Добавляем анимацию для селекта
  const select = document.querySelector('select');
  if (select) {
    select.addEventListener('change', function() {
      if (this.value) {
        this.style.color = 'var(--violet)';
      }
    });
  }
  
  // Обработчики для чекбоксов
  const checkboxes = document.querySelectorAll('.checkbox-input');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
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
});