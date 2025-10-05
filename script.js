// =========================
// === MONTHLY GOALS =======
// =========================
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