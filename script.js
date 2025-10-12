// === LOAD DOTS ICON ===
let dotsSVG = null;

async function getDotsSVG() {
    if (!dotsSVG) {
        const res = await fetch("assets/images/dots.svg");
        dotsSVG = await res.text();
    }
    return dotsSVG;
}

async function createDotsButton() {
    const optionsBtn = document.createElement("button");
    optionsBtn.classList.add("goal-options-btn");
    optionsBtn.title = "Options";
    optionsBtn.innerHTML = await getDotsSVG();
    return optionsBtn;
}

// === GOOGLE SEARCH ==========
const googleSearchInput = document.querySelector(".google-search input");

function performGoogleSearch() {
    const query = googleSearchInput.value.trim();
    if (query) {
        const searchUrl = "https://www.google.com/search?q=" + encodeURIComponent(query);
        window.location.href = searchUrl; 
        googleSearchInput.value = "";
    }
}

googleSearchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        performGoogleSearch();
    }
});

// === MONTHLY GOALS =======
const addGoalBtn = document.getElementById("addGoalBtn")
const goalInput = document.getElementById("goal-input")
const goalsList = document.getElementById("goals-list")

addGoalBtn.addEventListener("click", addGoal)
goalInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addGoal()
})

document.addEventListener('click', (e) => {
    document.querySelectorAll('.goal-options-menu').forEach(menu => {
        if (!menu.contains(e.target) && !e.target.closest('.goal-options-btn')) {
            menu.classList.remove('active');
        }
    });
});

async function addGoal() {
    const value = goalInput.value.trim();
    if (!value) return;

    const item = document.createElement("div");
    item.classList.add("goal-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const text = document.createElement("span");
    text.textContent = value;

    const optionsBtn = await createDotsButton();

    const optionsMenu = document.createElement("div");
    optionsMenu.classList.add("goal-options-menu");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener('click', () => editGoal(item, text));
    
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener('click', () => item.remove());

    optionsMenu.append(editBtn, removeBtn);

    optionsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll('.goal-options-menu.active').forEach(menu => {
            if (menu !== optionsMenu) menu.classList.remove('active');
        });
        optionsMenu.classList.toggle('active');
    });

    checkbox.addEventListener("change", () => {
        item.classList.toggle("completed")
    });

    item.append(checkbox, text, optionsBtn, optionsMenu)
    goalsList.appendChild(item)

    goalInput.value = ""
}

function editGoal(item, textSpan) {
    const menu = item.querySelector('.goal-options-menu');
    menu.classList.remove('active');

    const currentText = textSpan.textContent;
    
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = currentText;
    editInput.classList.add('edit-goal-input');
    
    item.replaceChild(editInput, textSpan);
    editInput.focus();
    
    const saveEdit = () => {
        const newText = editInput.value.trim();
        if (newText) {
            textSpan.textContent = newText;
        }
        item.replaceChild(textSpan, editInput);
        editInput.removeEventListener('keypress', handleEnter);
        editInput.removeEventListener('blur', saveEdit);
    };

    const handleEnter = (e) => {
        if (e.key === "Enter") {
            saveEdit();
        }
    };

    editInput.addEventListener('keypress', handleEnter);
    editInput.addEventListener('blur', saveEdit); 
}

// === NOTES ===============
const noteArea = document.getElementById("note-area");

noteArea.value = localStorage.getItem("userNote") || "";

noteArea.addEventListener("input", () => {
    localStorage.setItem("userNote", noteArea.value);
});

// === BOOKMARKS ==========
const addBtn = document.getElementById("addBookmarkBtn");
const bookmarkInput = document.getElementById("bookmark-input");
const bookmarksContainer = document.getElementById("bookmarks");

addBtn.addEventListener("click", addBookmark);
bookmarkInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addBookmark();
});

async function addBookmark() {
    const value = bookmarkInput.value.trim();
    if (!value) return;

    let url = value;
    let label = value;

    if (/^[\w.-]+\.[a-z]{2,}$/i.test(value) && !/^https?:\/\//i.test(value)) {
        url = "https://" + value;
    } else if (!/^https?:\/\//i.test(value)) {
        url = "https://www.google.com/search?q=" + encodeURIComponent(value);
    }

    try {
        const urlObject = new URL(url);
        label = urlObject.hostname.replace(/^www\./, '');
    } catch (e) {}

    const domain = new URL(url).hostname;
    const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

    const item = document.createElement("div");
    item.classList.add("bookmark-item");

    const contentWrapper = document.createElement("a");
    contentWrapper.classList.add("bookmark-content");
    contentWrapper.href = url;
    contentWrapper.target = "_blank";

    const icon = document.createElement("img");
    icon.src = favicon;
    icon.alt = "icon";
    icon.classList.add("bookmark-icon");

    const labelSpan = document.createElement("span");
    labelSpan.textContent = label;
    labelSpan.classList.add("bookmark-label");

    const optionsBtn = await createDotsButton();

    const optionsMenu = document.createElement("div");
    optionsMenu.classList.add("goal-options-menu");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit Label";
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editBookmark(item, labelSpan);
    });
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener('click', () => item.remove());

    optionsMenu.append(editBtn, removeBtn);

    optionsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll('.goal-options-menu.active').forEach(menu => {
            if (menu !== optionsMenu) menu.classList.remove('active');
        });
        optionsMenu.classList.toggle('active');
    });

    contentWrapper.append(icon, labelSpan);
    item.append(optionsBtn, optionsMenu, contentWrapper);
    bookmarksContainer.appendChild(item);

    bookmarkInput.value = "";
}
function editBookmark(item, labelSpan) {
    const menu = item.querySelector('.goal-options-menu');
    if (menu) menu.classList.remove('active');

    const currentText = labelSpan.textContent;

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = currentText;
    editInput.classList.add('edit-bookmark-input');

    editInput.addEventListener('click', (e) => e.stopPropagation());

    labelSpan.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    const saveEdit = () => {
        const newText = editInput.value.trim();
        if (newText) {
            labelSpan.textContent = newText;
        } else {
            labelSpan.textContent = currentText;
        }
        editInput.replaceWith(labelSpan);
        editInput.removeEventListener('keydown', handleKey);
        editInput.removeEventListener('blur', onBlur);
    };

    const handleKey = (e) => {
        if (e.key === "Enter") {
            saveEdit();
        } else if (e.key === "Escape") {
            editInput.value = currentText;
            saveEdit();
        }
    };

    const onBlur = () => {
        setTimeout(saveEdit, 0);
    };

    editInput.addEventListener('keydown', handleKey);
    editInput.addEventListener('blur', onBlur);
}

// === VISION BOARD ========
const modal = document.getElementById("visionModal");
const addBtnVision = document.getElementById("addVisionBtn");
const closeBtn = document.getElementById("closeVisionBtn");
const saveBtn = document.getElementById("saveVisionBtn");
const visionGrid = document.getElementById("visionGrid");
const visionUrl = document.getElementById("visionUrl");
const visionUpload = document.getElementById("visionUpload");

addBtnVision.onclick = () => modal.classList.add("active");
closeBtn.onclick = () => modal.classList.remove("active");

saveBtn.onclick = () => {
    let imgSrc = "";

    if (visionUrl.value.trim()) {
        imgSrc = visionUrl.value.trim();
    } else if (visionUpload.files[0]) {
        imgSrc = URL.createObjectURL(visionUpload.files[0]);
    }

    if (imgSrc) {
        const img = document.createElement("img");
        img.src = imgSrc;
        visionGrid.insertBefore(img, addBtnVision.nextSibling);
    }

    visionUrl.value = "";
    visionUpload.value = "";
    modal.classList.remove("active");
};

// === CLOCK ==============
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}

updateClock();
setInterval(updateClock, 1000);


// === CALENDAR ===========
const calendarDays = document.getElementById("calendar-days");
const monthYear = document.getElementById("monthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

let currentDate = new Date();

function renderCalendar(date) {
    calendarDays.innerHTML = "";

    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    monthYear.textContent = `${months[month]} ${year}`;

    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement("div");
        calendarDays.appendChild(blank);
    }

    for (let day = 1; day <= lastDate; day++) {
        const dayDiv = document.createElement("div");
        dayDiv.textContent = day;

        const today = new Date();
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add("today");
        }

        calendarDays.appendChild(dayDiv);
    }
}

prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});
nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

renderCalendar(currentDate);

// === HABIT TRACKER =======
const addHabitBtn = document.getElementById("addHabitBtn");
const habitInput = document.getElementById("habit-input");
const habitsList = document.getElementById("habits-list");

addHabitBtn.addEventListener("click", addHabit);
habitInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addHabit();
});

function addHabit() {
    const value = habitInput.value.trim();
    if (!value) return;

    const item = document.createElement("div");
    item.classList.add("habit-item");

    const text = document.createElement("span");
    text.textContent = value;
    item.appendChild(text);

    const progress = document.createElement("div");
    progress.classList.add("habit-progress");
    item.appendChild(progress);

    // 21-day progress
    const days = Array.from({
        length: 21
    }, () => {
        const day = document.createElement("div");
        day.classList.add("day");
        progress.appendChild(day);
        return day;
    });

    let streak = 0;

    item.addEventListener("click", () => {
        const today = new Date().toDateString();
        const lastClick = item.dataset.lastClick;

        if (lastClick === today) return;

        if (lastClick) {
            const lastDate = new Date(lastClick);
            const diff = (new Date(today) - lastDate) / (1000 * 60 * 60 * 24);
            if (diff > 1) streak = 0;
        }

        item.dataset.lastClick = today;

        if (streak < 21) {
            days[streak].classList.add("completed");
            streak++;
        }
    });

    habitsList.appendChild(item);
    habitInput.value = "";
}