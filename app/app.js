document.addEventListener('DOMContentLoaded', () => {
    const BASE_TEXT =
        'Create now a high quality horizontal image strictly by the following description:';

    // Элементы интерфейса
    const outputEl = document.getElementById('outputText');
    const selectedImagesContainer = document.getElementById('selectedImages');
    const copyBtn = document.getElementById('copyBtn');
    const resetBtn = document.getElementById('resetBtn');
    const copyNotice = document.getElementById('copyNotice');

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

    function clearSelections() {
        // Снять активный класс
        document.querySelectorAll('.option-image.active').forEach((img) => {
            img.classList.remove('active');
        });

        // Очистить состояние
        Object.keys(selectedByCategory).forEach((key) => {
            delete selectedByCategory[key];
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
            }

            rebuildText();
            rebuildSelectedImages();
        });
    });

    // --- КНОПКА КОПИРОВАНИЯ ---

    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const text = getOutputText();

            try {
                await navigator.clipboard.writeText(text);

                if (copyNotice) {
                    copyNotice.textContent = 'Скопировано в буфер';
                    copyNotice.classList.add('visible');

                    setTimeout(() => {
                        copyNotice.classList.remove('visible');
                    }, 1500);
                }
            } catch (e) {
                console.error('Clipboard error:', e);
            }
        });
    }

    // --- КНОПКА СБРОСА ---

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            clearSelections();
        });
    }
});
