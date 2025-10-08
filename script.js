// === MONTHLY GOALS =======
const addGoalBtn = document.getElementById("addGoalBtn")
const goalInput = document.getElementById("goal-input")
const goalsList = document.getElementById("goals-list")

addGoalBtn.addEventListener("click", addGoal)
goalInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addGoal()
})

function addGoal() {
    const value = goalInput.value.trim()
    if (!value) return

    const item = document.createElement("div")
    item.classList.add("goal-item")

    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"

    const text = document.createElement("span")
    text.textContent = value

    checkbox.addEventListener("change", () => {
        item.classList.toggle("completed")
    })

    item.addEventListener("dblclick", () => item.remove())

    item.append(checkbox, text)
    goalsList.appendChild(item)

    goalInput.value = ""
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

function addBookmark() {
    const value = bookmarkInput.value.trim();
    if (!value) return;

    let url = value;

    if (/^[\w.-]+\.[a-z]{2,}$/i.test(value) && !/^https?:\/\//i.test(value)) {
        url = "https://" + value;
    } else if (!/^https?:\/\//i.test(value)) {
        url = "https://www.google.com/search?q=" + encodeURIComponent(value);
    }

    const domain = new URL(url).hostname;
    const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

    const item = document.createElement("a");
    item.classList.add("bookmark-item");
    item.href = url;
    item.target = "_blank";
    item.innerHTML = `<img src="${favicon}" alt="icon" class="bookmark-icon">`;

    bookmarksContainer.appendChild(item);
    bookmarkInput.value = "";
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

