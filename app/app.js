const BASE_PROMPT =
    "Create now a high quality horizontal image strictly by the following description:";

const CATEGORY_ORDER = [
    "style",
    "mood",
    "head",
    "eyes",
    "torso",
    "tail",
    "camera",
    "background",
];

const outputText = document.getElementById("outputText");
const selectedImagesContainer = document.getElementById("selectedImages");
const images = document.querySelectorAll(".option-image");
const copyBtn = document.getElementById("copyBtn");
const resetBtn = document.getElementById("resetBtn");
const copyNotice = document.getElementById("copyNotice");

const selected = {};

// начальное значение текста
outputText.value = BASE_PROMPT;

// обновление текста промпта (без подписей)
function updatePrompt() {
    const parts = [];

    CATEGORY_ORDER.forEach((cat) => {
        if (selected[cat]?.text) {
            parts.push(selected[cat].text);
        }
    });

    if (parts.length) {
        outputText.value = BASE_PROMPT + " " + parts.join(" ");
    } else {
        outputText.value = BASE_PROMPT;
    }
}

// превью выбранных картинок
function updateSelectedImages() {
    selectedImagesContainer.innerHTML = "";

    CATEGORY_ORDER.forEach((cat) => {
        const entry = selected[cat];
        if (!entry || !entry.src) return;

        const wrapper = document.createElement("div");
        wrapper.className = "selected-thumb";

        const img = document.createElement("img");
        img.src = entry.src;
        img.alt = cat;

        wrapper.appendChild(img);
        selectedImagesContainer.appendChild(wrapper);
    });
}

// подпись у заголовка категории
function updateCategoryLabel(imgEl, label) {
    const categoryEl = imgEl.closest(".category");
    if (!categoryEl) return;

    const titleEl = categoryEl.querySelector(".category-title");
    if (!titleEl) return;

    let span = titleEl.querySelector(".category-label");
    if (!span) {
        span = document.createElement("span");
        span.className = "category-label";
        titleEl.appendChild(span);
    }

    span.textContent = label ? `· ${label}` : "";
}

// обработчики кликов по картинкам
images.forEach((img) => {
    img.addEventListener("click", () => {
        const category = img.dataset.category;
        const text = img.dataset.text || "";
        const label = img.dataset.label || "";
        const src = img.getAttribute("src");

        // сохраняем выбранное
        selected[category] = { text, label, src };

        // подсветка только у выбранной в категории
        images.forEach((other) => {
            if (other.dataset.category === category) {
                other.classList.toggle("active", other === img);
            }
        });

        updatePrompt();
        updateSelectedImages();
        updateCategoryLabel(img, label);
    });
});

// копирование текста
let copyTimeoutId = null;

function showCopyNotice(message) {
    copyNotice.textContent = message;
    copyNotice.classList.add("visible");

    if (copyTimeoutId) {
        clearTimeout(copyTimeoutId);
    }

    copyTimeoutId = setTimeout(() => {
        copyNotice.classList.remove("visible");
    }, 15000); // 15 секунд
}

copyBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(outputText.value);
        showCopyNotice("Текст скопирован. Можно вставлять в модель.");
    } catch (err) {
        showCopyNotice("Не удалось скопировать. Скопируй текст вручную.");
    }
});

// сброс всего
resetBtn.addEventListener("click", () => {
    // очищаем состояние
    Object.keys(selected).forEach((key) => delete selected[key]);

    // убираем подсветку
    images.forEach((img) => img.classList.remove("active"));

    // сбрасываем текст
    outputText.value = BASE_PROMPT;

    // чистим превью
    selectedImagesContainer.innerHTML = "";

    // убираем подписи у заголовков
    document
        .querySelectorAll(".category-label")
        .forEach((el) => el.remove());

    // уведомление тоже убираем
    copyNotice.classList.remove("visible");
});
