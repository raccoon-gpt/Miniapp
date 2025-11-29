document.addEventListener('DOMContentLoaded', () => {
    const BASE_TEXT =
        'Create now an 3:4 image with a raccoon with a tail, integrated into the far midground environment of the background, strictly by the following description in this whole text. Also, the raccoon must cover 25% - 35% of the image area. Do not place the raccoon in the close foreground; keep it visually distant within the scene.';

    // Элементы интерфейса
    const outputEl = document.getElementById('outputText');
    const selectedImagesContainer = document.getElementById('selectedImages');
    
    const copyBtn = document.getElementById('copyBtn');

    const resetBtn = document.getElementById('resetBtn');
    const copyNotice = document.getElementById('copyNotice');

    // Спаны с подписями категорий
    const categoryLabelEls = {};
    document.querySelectorAll('.category-label').forEach((span) => {
        const cat = span.dataset.category;
        if (cat) {
            categoryLabelEls[cat] = span;
        }
    });

    // Тексты для подписей категорий (можешь править как хочешь)
    const LABEL_TEXTS = {
        style: {
            '001': 'Реалистичный',
            '002': 'Контрастный арт',
            '003': 'Неон / синтвейв',
            '004': 'Акварель',
            '005': 'Масляная живопись'
        },
        mood: {
            '001': 'Игривое',
            '002': 'Спокойное',
            '003': 'Дикое'
        },
        head: {
            '001': 'Прямой взгляд',
            '002': 'Три четверти',
            '003': 'Профиль'
        },
        eyes: {
            '001': 'Спокойные',
            '002': 'Эмоциональные',
            '003': 'Сумасшедшие'
        },
        torso: {
            '001': 'Фронтально',
            '002': 'Чуть в сторону',
            '003': 'Сильный разворот'
        },
        tail: {
            '001': 'Ровный',
            '002': 'Изогнутый',
            '003': 'Динамичный'
        },
        camera: {
            '001': 'Прямой ракурс',
            '002': 'Слегка сверху',
            '003': 'Снизу вверх'
        },
        background: {
            '001': 'Утренний лес',
            '002': 'Лунный лес',
            '003': 'Абстрактный фон'
        }
    };

    // Выбранные варианты по категориям
    // { style: { key, text, src }, mood: {...}, ... }
    const selectedByCategory = {};

    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

    function setOutputText(text) {
        if (!outputEl) return;

        if (outputEl.tagName === 'TEXTAREA' || outputEl.tagName === 'INPUT') {
            outputEl.value = text;
        } else {
            outputEl.textContent = text;
        }
    }

    function getOutputText() {
        if (!outputEl) return '';

        if (outputEl.tagName === 'TEXTAREA' || outputEl.tagName === 'INPUT') {
            return outputEl.value;
        } else {
            return outputEl.textContent || '';
        }
    }

    function rebuildText() {
        const paragraphs = [];

        // Базовый текст всегда первым
        paragraphs.push(BASE_TEXT);

        // Остальные абзацы идут по категориям
        Object.keys(selectedByCategory).forEach((category) => {
            const item = selectedByCategory[category];
            if (item && item.text) {
                paragraphs.push(item.text);
            }
        });

        // Пустая строка между абзацами
        const fullText = paragraphs.join('\n\n');
        setOutputText(fullText);
    }

    function rebuildSelectedImages() {
        if (!selectedImagesContainer) return;

        selectedImagesContainer.innerHTML = '';

        Object.keys(selectedByCategory).forEach((category) => {
            const item = selectedByCategory[category];
            if (!item) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'selected-thumb';

            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.key || category;

            wrapper.appendChild(img);
            selectedImagesContainer.appendChild(wrapper);
        });
    }

    function updateCategoryLabel(category, keyOrNull) {
        const labelEl = categoryLabelEls[category];
        if (!labelEl) return;

        if (!keyOrNull) {
            // Сброс
            labelEl.textContent = '';
            labelEl.classList.remove('active');
            return;
        }

        const key = keyOrNull;
        const catMap = LABEL_TEXTS[category] || {};
        const labelText = catMap[key] || '';

        labelEl.textContent = labelText;
        if (labelText) {
            labelEl.classList.add('active');
        } else {
            labelEl.classList.remove('active');
        }
    }

    function clearSelections() {
        // Снять активный класс
        document.querySelectorAll('.option-image.active').forEach((img) => {
            img.classList.remove('active');
        });

        // Очистить состояние
        Object.keys(selectedByCategory).forEach((key) => {
            delete selectedByCategory[key];
        });

        // Сбросить подписи категорий
        Object.keys(categoryLabelEls).forEach((cat) => {
            updateCategoryLabel(cat, null);
        });

        // Обновить текст и превью
        rebuildText();
        rebuildSelectedImages();
    }

    // --- ИНИЦИАЛИЗАЦИЯ ---

    // Базовый текст при загрузке
    setOutputText(BASE_TEXT);

    // Вешаем обработчик на все картинки-опции
    document.querySelectorAll('.option-image').forEach((img) => {
        img.addEventListener('click', () => {
            const category = img.dataset.category;
            const key = img.dataset.key;
            const text =
                img.dataset.text ||
                `${category || 'category'} ${key || ''}`.trim();

            if (!category) return;

            const current = selectedByCategory[category];

            // Если нажали на уже выбранную картинку — снимаем выбор
            if (current && current.key === key) {
                delete selectedByCategory[category];
                img.classList.remove('active');
                updateCategoryLabel(category, null);
            } else {
                // Снять active со старой в этой категории
                document
                    .querySelectorAll(
                        `.option-image[data-category="${category}"].active`
                    )
                    .forEach((el) => el.classList.remove('active'));

                // Отметить новую
                img.classList.add('active');

                // Сохранить выбор
                selectedByCategory[category] = {
                    key,
                    text,
                    src: img.src
                };

                // Обновить подпись категории
                updateCategoryLabel(category, key);
            }

            rebuildText();
            rebuildSelectedImages();
        });
    });

    // --- КНОПКА КОПИРОВАНИЯ с зеленым текстом---

    
/*   if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const text = getOutputText();

            try {
                await navigator.clipboard.writeText(text);

                if (copyNotice) {
                    copyNotice.textContent = 'Скопировано в буфер \nТеперь открывай свой GPT и отправляй в чат';
                    copyNotice.classList.add('visible');

                    setTimeout(() => {
                        copyNotice.classList.remove('visible');
                    }, 15000); // держим 15 секунд
                }
            } catch (e) {
                console.error('Clipboard error:', e);
            }
        });
    } 
*/

// --- КНОПКА КОПИРОВАНИЯ С ПОПАПОМ---

if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
        const text = getOutputText();

        // 1) копируем текст в буфер
        try {
            await navigator.clipboard.writeText(text);
        } catch (e) {
            console.error('Clipboard error:', e);
        }

        // 2) открываем сам попап
        openPopup();
    });
}

    // --- КНОПКА СБРОСА ---

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            clearSelections();
        });
    }
});


// =============== POPUP SCRIPT ===============

    const overlay = document.getElementById('downloadOverlay');
    const downloadBtn = document.getElementById('downloadBtn');
    const popupImage = document.getElementById('popupImage');

    /* 
      Список картинок для рандома.
      Папка "imagespopup" лежит рядом с этим HTML.
      Сюда просто добавляешь свои файлы.
    */
    const IMAGES = [
      "../assets/imagespopup/raccoon_1.png",
      "../assets/imagespopup/raccoon_2.png",
      "../assets/imagespopup/raccoon_3.png",
      "../assets/imagespopup/raccoon_4.png",
      "../assets/imagespopup/raccoon_5.png",
      "../assets/imagespopup/raccoon_6.png",
      "../assets/imagespopup/raccoon_7.png",
      "../assets/imagespopup/raccoon_8.png",
      "../assets/imagespopup/raccoon_9.png",
      "../assets/imagespopup/raccoon_10.png",
      "../assets/imagespopup/raccoon_11.png",
      "../assets/imagespopup/raccoon_12.png",
      "../assets/imagespopup/raccoon_13.png",
      "../assets/imagespopup/raccoon_14.png",
      "../assets/imagespopup/raccoon_15.png",
/*    "../assets/imagespopup/raccoon_3.png"
*/
      
      // добавляй дальше свои файлы
      
    ];

    /* если хочешь — отдельный список для скачивания
       (может отличаться от превью). Пока использую тот же. */
    const DOWNLOAD_IMAGES = IMAGES;

    function getRandomFrom(arr) {
      if (!arr || arr.length === 0) return null;
      const idx = Math.floor(Math.random() * arr.length);
      return arr[idx];
    }

    function openPopup() {
      // выбираем случайную картинку
      const randomSrc = getRandomFrom(IMAGES);
      if (randomSrc) {
        popupImage.src = randomSrc;
      }

        overlay.classList.add("visible", "loading");

  setTimeout(() => {
    overlay.classList.remove("loading");
  }, 2000);
    }

    function closePopup() {
      overlay.classList.remove("visible", "loading");
    }

    downloadBtn.addEventListener("click", () => {
      // Берём тот же рандомный файл для скачивания
      const currentSrc = popupImage.src;
      // если хочешь строго из списка DOWNLOAD_IMAGES — можно тоже рандомно брать оттуда

      const link = document.createElement("a");
      link.href = currentSrc;
      // можно вырезать имя файла из пути:
      const fileName = currentSrc.split("/").pop() || "image.png";
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

    });

    // Дополнительно: по клику по затемнению закрывать попап
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closePopup();
      }
    });




