/* в этот файл добавляет скрипты */

/* global ymaps */

const navMain = document.querySelector('.main-nav');
const navToggle = document.querySelector('.main-nav__toggle');

navMain.classList.remove('main-nav--nojs');

navToggle.addEventListener('click', () => {
  if (navMain.classList.contains('main-nav--closed')) {
    navMain.classList.remove('main-nav--closed');
    navMain.classList.add('main-nav--opened');
  } else {
    navMain.classList.add('main-nav--closed');
    navMain.classList.remove('main-nav--opened');
  }
});

/* тут карта */

ymaps.ready(() => {
  // Исходные координаты метки
  const baseCoords = [59.938631, 30.323037];

  // Функция для определения размера метки по ширине экрана
  function getIconOptions() {
    const width = window.innerWidth;

    if (width < 768) {
      return {
        iconImageSize: [57, 53],
        iconImageOffset: [-25, -45]
      };
    } else if (width < 1440) {
      return {
        iconImageSize: [113, 106],
        iconImageOffset: [-50, -55]
      };
    } else {
      return {
        iconImageSize: [113, 106],
        iconImageOffset: [-40, -100]
      };
    }
  }

  // Функция для получения центра карты с условным сдвигом
  function getMapCenter() {
    if (window.innerWidth >= 1440) {
      // На десктопе: сдвигаем центр карты
      return [baseCoords[0] + 0.001, baseCoords[1] - 0.007];
    } else {
      // На планшетах/мобилках: центр по метке
      return baseCoords;
    }
  }

  // Создаём карту
  const myMap = new ymaps.Map('map', {
    center: getMapCenter(),
    zoom: 15
  }, {
    searchControlProvider: 'yandex#search'
  });

  // Создаём метку (всегда на исходных координатах)
  const myPlacemark = new ymaps.Placemark(baseCoords, {
    hintContent: 'Cat Energy',
    balloonContent: 'ул. Большая Конюшенная, д. 19/8'
  }, {
    iconLayout: 'default#image',
    iconImageHref: '../images/map-pin.png',
    ...getIconOptions()
  });

  myMap.geoObjects.add(myPlacemark);

  // Наблюдатель за изменениями размера контейнера карты
  const mapContainer = document.getElementById('map');
  const resizeObserver = new ResizeObserver(() => {
    // 1. Обновляем размеры иконки
    const options = getIconOptions();
    myPlacemark.options.set({
      iconImageSize: options.iconImageSize,
      iconImageOffset: options.iconImageOffset
    });

    // 2. Пересчитываем центр карты
    const newCenter = getMapCenter();

    // Проверяем изменение центра (без ymaps.util.areEqualArrays)
    const currentCenter = myMap.getCenter();
    if (currentCenter[0] !== newCenter[0] || currentCenter[1] !== newCenter[1]) {
      myMap.setCenter(newCenter);
    }

    // 3. Принудительно обновляем размер карты
    if (myMap.container) {
      myMap.container.fitToViewport();
    }
  });

  // Начинаем наблюдение за контейнером
  resizeObserver.observe(mapContainer);

  // Дополнительно: обработчик глобального resize (подстраховка)
  window.addEventListener('resize', () => {
    resizeObserver.update(); // Запускаем проверку наблюдателя
  });
});
