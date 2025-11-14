(() => {
    // === Utilities ===

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const safeGet = (id) => document.getElementById(id) || null;

    const ifExists = (el, fn) => { if (el) fn(el); };

    // === LOAD DOTS ICON ===
    let dotsSVG = null;
    async function getDotsSVG() {
        if (!dotsSVG) {
            try {
                const res = await fetch("assets/images/dots.svg");
                dotsSVG = await res.text();
            } catch (e) {
                dotsSVG = "⋯";
            }
        }
        return dotsSVG;
    }

    async function createDotsButton() {
        const btn = document.createElement("button");
        btn.className = "goal-options-btn";
        btn.title = "Options";
        btn.innerHTML = await getDotsSVG();
        return btn;
    }
    // === GOOGLE SEARCH ==========
    const googleSearchInput = $(".google-search input");
    ifExists(googleSearchInput, (input) => {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const q = input.value.trim();
                if (!q) return;
                window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
                input.value = "";
            }
        });
    });

    // === MONTHLY GOALS =======
    const goalsList = safeGet("goals-list");
    const goalInput = safeGet("goal-input");
    const addGoalBtn = safeGet("addGoalBtn");

    function createGoalElement(textValue) {
        const item = document.createElement("div");
        item.className = "goal-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        const text = document.createElement("span");
        text.textContent = textValue;

        const optionsMenu = document.createElement("div");
        optionsMenu.className = "goal-options-menu";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => editGoal(item, text));

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", () => item.remove());

        optionsMenu.append(editBtn, removeBtn);

        const attachOptionsBtn = async () => {
            const optionsBtn = await createDotsButton();
            optionsBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                $$(".goal-options-menu").forEach(m => { if (m !== optionsMenu) m.classList.remove("active"); });
                optionsMenu.classList.toggle("active");
            });
            item.append(optionsBtn);
        };

        checkbox.addEventListener("change", () => item.classList.toggle("completed"));
        item.append(checkbox, text, optionsMenu);
        attachOptionsBtn();
        return item;
    }

    function addGoal() {
        if (!goalInput || !goalsList) return;
        const v = goalInput.value.trim();
        if (!v) return;
        goalsList.appendChild(createGoalElement(v));
        goalInput.value = "";
    }

    function editGoal(item, textSpan) {
        const menu = item.querySelector('.goal-options-menu');
        if (menu) menu.classList.remove('active');

        const currentText = textSpan.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-goal-input';
        item.replaceChild(input, textSpan);
        input.focus();

        const save = () => {
            const val = input.value.trim();
            if (val) textSpan.textContent = val;
            item.replaceChild(textSpan, input);
            input.removeEventListener('keypress', onEnter);
            input.removeEventListener('blur', save);
        };
        const onEnter = (e) => { if (e.key === 'Enter') save(); };
        input.addEventListener('keypress', onEnter);
        input.addEventListener('blur', save);
    }

    if (addGoalBtn) addGoalBtn.addEventListener("click", addGoal);
    if (goalInput) goalInput.addEventListener("keypress", (e) => { if (e.key === "Enter") addGoal(); });

    document.addEventListener('click', (e) => {
        $$(".goal-options-menu").forEach(menu => {
            if (!menu.contains(e.target) && !e.target.closest('.goal-options-btn')) menu.classList.remove('active');
        });
    });

    // === NOTES ===============
    const noteArea = safeGet("note-area");
    if (noteArea) {
        noteArea.value = localStorage.getItem("userNote") || "";
        noteArea.addEventListener("input", () => localStorage.setItem("userNote", noteArea.value));
    }
    // === BOOKMARKS ==========
    const bookmarksContainer = safeGet("bookmarks");
    const bookmarkInput = safeGet("bookmark-input");
    const addBookmarkBtn = safeGet("addBookmarkBtn");

    function makeBookmarkElement(url, label) {
        const item = document.createElement("div");
        item.className = "bookmark-item";

        const content = document.createElement("a");
        content.className = "bookmark-content";
        content.href = url;
        content.target = "_blank";

        const icon = document.createElement("img");
        icon.className = "bookmark-icon";
        icon.alt = "icon";
        try {
            const domain = new URL(url).hostname;
            icon.src = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        } catch {
            icon.src = "";
        }

        const labelSpan = document.createElement("span");
        labelSpan.className = "bookmark-label";
        labelSpan.textContent = label;

        content.append(icon, labelSpan);

        const optionsMenu = document.createElement("div");
        optionsMenu.className = "goal-options-menu";
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit Label";
        editBtn.addEventListener("click", (e) => { e.stopPropagation(); editBookmark(item, labelSpan); });
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", () => item.remove());
        optionsMenu.append(editBtn, removeBtn);

        const attachOptionsBtn = async () => {
            const optionsBtn = await createDotsButton();
            optionsBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                $$(".goal-options-menu").forEach(m => { if (m !== optionsMenu) m.classList.remove("active"); });
                optionsMenu.classList.toggle("active");
            });
            item.append(optionsBtn);
        };

        item.append(optionsMenu, content);
        attachOptionsBtn();
        return item;
    }

    function addBookmark() {
        if (!bookmarkInput || !bookmarksContainer) return;
        const value = bookmarkInput.value.trim();
        if (!value) return;

        let url = value;
        if (/^[\w.-]+\.[a-z]{2,}$/i.test(value) && !/^https?:\/\//i.test(value)) {
            url = "https://" + value;
        } else if (!/^https?:\/\//i.test(value)) {
            url = "https://www.google.com/search?q=" + encodeURIComponent(value);
        }

        let label = value;
        try {
            label = new URL(url).hostname.replace(/^www\./, '');
        } catch { }

        bookmarksContainer.appendChild(makeBookmarkElement(url, label));
        bookmarkInput.value = "";
    }

    function editBookmark(item, labelSpan) {
        const link = item.querySelector('.bookmark-content');
        const menu = item.querySelector('.goal-options-menu');
        if (menu) menu.classList.remove('active');

        const current = labelSpan.textContent;
        const input = document.createElement('input');
        input.type = "text";
        input.value = current;
        input.className = "edit-bookmark-input";
        labelSpan.replaceWith(input);
        input.focus();

        const save = () => {
            const newLabel = input.value.trim();
            if (!newLabel) return;
            labelSpan.textContent = newLabel;

            let newUrl = newLabel;
            if (/^[\w.-]+\.[a-z]{2,}$/i.test(newLabel) && !/^https?:\/\//i.test(newLabel)) {
                newUrl = "https://" + newLabel;
            } else if (!/^https?:\/\//i.test(newLabel)) {
                newUrl = "https://www.google.com/search?q=" + encodeURIComponent(newLabel);
            }

            link.href = newUrl;
            try {
                const domain = new URL(newUrl).hostname;
                const icon = link.querySelector('img');
                if (icon) icon.src = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
            } catch { }

            input.replaceWith(labelSpan);
        };

        const onEnter = (e) => { if (e.key === "Enter") save(); };
        input.addEventListener('keypress', onEnter);
        input.addEventListener('blur', save);
    }

    if (addBookmarkBtn) addBookmarkBtn.addEventListener("click", addBookmark);
    if (bookmarkInput) bookmarkInput.addEventListener("keypress", (e) => { if (e.key === "Enter") addBookmark(); });

    // === VISION BOARD ========
    const visionModal = safeGet("visionModal");
    const addBtnVision = safeGet("addVisionBtn");
    const closeBtn = safeGet("closeVisionBtn");
    const saveBtn = safeGet("saveVisionBtn");
    const visionGrid = safeGet("visionGrid");
    const visionUrl = safeGet("visionUrl");
    const visionUpload = safeGet("visionUpload");

    if (addBtnVision && visionModal) addBtnVision.addEventListener("click", () => visionModal.classList.add("active"));
    if (closeBtn && visionModal) closeBtn.addEventListener("click", () => visionModal.classList.remove("active"));

    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            if (!visionGrid) return;
            let src = "";
            if (visionUrl && visionUrl.value.trim()) src = visionUrl.value.trim();
            else if (visionUpload && visionUpload.files[0]) src = URL.createObjectURL(visionUpload.files[0]);

            if (!src) { visionModal.classList.remove("active"); return; }

            const tile = document.createElement("div");
            tile.className = "vision-tile";
            const img = document.createElement("img");
            img.src = src;
            const del = document.createElement("button");
            del.className = "vision-delete-btn";
            del.innerHTML = `<img src="assets/images/remove.svg" alt="Delete" />`;
            del.addEventListener("click", (e) => { e.stopPropagation(); tile.remove(); });

            tile.append(img, del);
            visionGrid.insertBefore(tile, addBtnVision.nextSibling);

            if (visionUrl) visionUrl.value = "";
            if (visionUpload) visionUpload.value = "";
            if (visionModal) visionModal.classList.remove("active");
        });
    }

    // === CLOCK ==============
    function updateClock() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");
        ifExists(safeGet("hours"), el => el.textContent = hh);
        ifExists(safeGet("minutes"), el => el.textContent = mm);
        ifExists(safeGet("seconds"), el => el.textContent = ss);
    }
    updateClock();
    setInterval(updateClock, 1000);
    // === HABIT TRACKER =======
    const addHabitBtn = safeGet("addHabitBtn");
    const habitInput = safeGet("habit-input");
    const habitsList = safeGet("habits-list");
    let habits = JSON.parse(localStorage.getItem("habits") || "[]");

    function saveHabits() { localStorage.setItem("habits", JSON.stringify(habits)); }

    function renderHabit(habit) {
        if (!habitsList) return;
        const item = document.createElement("div");
        item.className = "habit-item";
        const text = document.createElement("span");
        text.textContent = habit.name;
        item.append(text);

        const progress = document.createElement("div");
        progress.className = "habit-progress";
        item.append(progress);

        const days = Array.from({ length: 21 }, () => {
            const d = document.createElement("div");
            d.className = "day";
            progress.append(d);
            return d;
        });

        for (let i = 0; i < (habit.streak || 0); i++) days[i].classList.add("completed");

        item.addEventListener("click", () => {
            const today = new Date().toISOString().split("T")[0];
            if (habit.lastClick === today) return;
            if (habit.lastClick) {
                const last = new Date(habit.lastClick);
                const diff = (new Date(today) - last) / (1000 * 60 * 60 * 24);
                if (diff > 1) {
                    habit.streak = 0;
                    days.forEach(d => d.classList.remove("completed"));
                }
            }
            if (habit.streak < 21) {
                days[habit.streak].classList.add("completed");
                habit.streak = (habit.streak || 0) + 1;
            }
            habit.lastClick = today;
            saveHabits();
        });

        habitsList.appendChild(item);
    }

    function addHabit() {
        if (!habitInput) return;
        const v = habitInput.value.trim();
        if (!v) return;
        const h = { name: v, streak: 0, lastClick: null };
        habits.push(h);
        saveHabits();
        renderHabit(h);
        habitInput.value = "";
    }

    if (addHabitBtn) addHabitBtn.addEventListener("click", addHabit);
    if (habitInput) habitInput.addEventListener("keypress", (e) => { if (e.key === "Enter") addHabit(); });

    habits.forEach(h => renderHabit(h));

    // === GOOGLE CALENDAR AUTH & EVENTS =======
    const loginBtn = safeGet("loginBtn");
    const eventsRoot = safeGet("events") || safeGet("calendar-events");
    const TOKEN_KEY = "googleToken";

    const publicCalendar = safeGet("publicCalendar");
    const userCalendar = safeGet("userCalendar");

    function showLoggedOutUI() {
        if (loginBtn) loginBtn.style.display = "inline-block";

        if (publicCalendar) publicCalendar.style.display = "block";
        if (userCalendar) userCalendar.style.display = "none";

        if (eventsRoot) eventsRoot.innerHTML = "<p>Please login to see your upcoming events.</p>";
    }
    async function showLoggedInUI(token) {
        if (loginBtn) loginBtn.style.display = "none";

        if (publicCalendar) publicCalendar.style.display = "none";
        if (userCalendar) userCalendar.style.display = "block";

        await loadUserEvents(token);
    }

    async function requestLogin() {
        try {
            const token = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ action: "LOGIN_GOOGLE" }, (response) => {
                    resolve(response);
                });
            });
            return token;
        } catch (err) {
            console.error("requestLogin error", err);
            return null;
        }
    }

    async function loadUserEvents(token) {
        if (!token) {
            if (eventsRoot) eventsRoot.innerHTML = "<p>Authentication required.</p>";
            return;
        }

        try {
            const calendarListRes = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!calendarListRes.ok) throw new Error("Failed to load calendar list.");

            const calendarListData = await calendarListRes.json();

            const primaryCalendar = calendarListData.items.find(item => item.primary);
            const calendarId = primaryCalendar.id;

            if (calendarId) {
                const embedUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=${Intl.DateTimeFormat().resolvedOptions().timeZone}&mode=MONTH`;

                displayCalendarIframe(embedUrl);
            } else {
                if (userCalendar) userCalendar.innerHTML = "<p>Could not find primary calendar.</p>";
            }

        } catch (err) {
            console.error("loadUserEvents error", err);
            if (userCalendar) userCalendar.innerHTML = "<p>Error loading calendar: check console for details.</p>";
        }
    }

    function displayCalendarIframe(embedUrl) {
        if (!userCalendar) return;

        userCalendar.innerHTML = '';

        const iframe = document.createElement("iframe");
        iframe.src = embedUrl;
        iframe.style.border = '0';
        iframe.style.width = '100%';
        iframe.style.height = '350px';
        iframe.scrolling = 'no';

        userCalendar.appendChild(iframe);
    }


    function escapeHtml(str = "") {
        return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const token = await requestLogin();
            if (!token) {
                alert("Login failed or was cancelled.");
                return;
            }
            localStorage.setItem(TOKEN_KEY, token);
            await showLoggedInUI(token);
        });
    }

    document.addEventListener("DOMContentLoaded", async () => {
        const saved = localStorage.getItem(TOKEN_KEY);
        if (saved) {
            await showLoggedInUI(saved);
        } else {
            showLoggedOutUI();
        }
    });

    window.__tabio = {
        clearGoogleToken() { localStorage.removeItem(TOKEN_KEY); showLoggedOutUI(); },
    };
})();