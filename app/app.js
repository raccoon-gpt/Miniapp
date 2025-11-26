document.addEventListener("DOMContentLoaded", () => {
    const basePrompt =
        "Create now a high quality horizontal image strictly by the following description:";

    // Карточки подписями (потом можешь поменять текст на свои)
    const optionLabels = {
        style: {
            "001": "Картинка 001",
            "002": "Картинка 002",
            "003": "Картинка 003",
            "004": "Картинка 004",
            "005": "Картинка 005"
        },
        mood: {
            "001": "Картинка 001",
            "002": "Картинка 002",
            "003": "Картинка 003"
        },
        head: {
            "001": "Картинка 001",
            "002": "Картинка 002",
            "003": "Картинка 003"
        },
        eyes: {
            "001": "Картинка 001",
            "002": "Картинка 002",
            "003": "Картинка 003"
        },
        torso: {
            "001": "Картинка 001",
            "002": "Картинка 002",
            "003": "Картинка 003"
        },
        tail: {
            "001": "Картинка 001",
            "002": "Картинка 002",
            "003": "Картинка 003"
        },
        camera: {
            "001": "Картинка 001",
            "002": "Картинка 002",
            "003": "Картинка 003"
        },
        background: {
            "001": "Картинка 001",
            "002": "Картинка 002",
            "003": "Картинка 003"
        }
    };

    const outputText = document.getElementById("outputText");
    const copyBtn = document.getElementById("copyBtn");
    const resetBtn = document.getElementById("resetBtn");
    const copyNotice = document.getElementById("copyNotice");
    const selectedImages = document.getElementById("selectedImages");

    const optionImages = document.querySelectorAll(".option-image");
    const selected = {};

    // стартовый текст
    outputText.value = basePrompt + "\n";

    function assemblePrompt() {
        const pieces = Object.values(selected).map((item) => item.text);

        if (pieces.length === 0) {
            outputText.value = basePrompt + "\n";
            return;
        }

        // Базовый текст + пустая строка + каждый пункт с новой строки
        const lines = [
            basePrompt,
            "",
            ...pieces
        ];

        outputText.value = lines.join("\n");
    }

    function renderSelectedPreview() {
        selectedImages.innerHTML = "";

        Object.values(selected).forEach((item) => {
            const wrapper = document.createElement("div");
            wrapper.className = "selected-thumb";

            const img = document.createElement("img");
            img.src = item.src;
            img.alt = item.alt || "";

            wrapper.appendChild(img);
            selectedImages.appendChild(wrapper);
        });
    }

    optionImages.forEach((img) => {
        img.addEventListener("click", () => {
            const category = img.dataset.category;
            const key = img.dataset.key;

            // снимаем старый active в этой категории
            optionImages.forEach((other) => {
                if (other.dataset.category === category) {
                    other.classList.remove("active");
                }
            });

            // новый active
            img.classList.add("active");

            const label =
                (optionLabels[category] && optionLabels[category][key]) ||
                img.dataset.text ||
                "";

            selected[category] = {
                key,
                text: label,
                src: img.src,
                alt: img.alt
            };

            // подпись рядом с заголовком категории
            const categoryEl = img.closest(".category");
            const titleEl = categoryEl.querySelector(".category-title");

            let labelSpan = titleEl.querySelector(".category-label");
            if (!labelSpan) {
                labelSpan = document.createElement("span");
                labelSpan.className = "category-label";
                titleEl.appendChild(labelSpan);
            }
            labelSpan.textContent = label;

            assemblePrompt();
            renderSelectedPreview();
        });
    });

    copyBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(outputText.value);

            copyNotice.textContent =
                "Текст скопирован.\nТеперь можно вставлять его в промпт.";
            copyNotice.classList.add("visible");

            setTimeout(() => {
                copyNotice.classList.remove("visible");
            }, 5000); // держим уведомление 5 секунд
        } catch (err) {
            copyNotice.textContent = "Не удалось скопировать текст.";
            copyNotice.classList.add("visible");
            setTimeout(() => {
                copyNotice.classList.remove("visible");
            }, 5000);
        }
    });

    resetBtn.addEventListener("click", () => {
        // очищаем выбор
        for (const key in selected) {
            delete selected[key];
        }

        // убираем активы
        optionImages.forEach((img) => img.classList.remove("active"));

        // чистим подписи
        document
            .querySelectorAll(".category-label")
            .forEach((span) => span.remove());

        // чистим превью
        selectedImages.innerHTML = "";

        // возвращаем базовый текст
        outputText.value = basePrompt + "\n";
    });
});
