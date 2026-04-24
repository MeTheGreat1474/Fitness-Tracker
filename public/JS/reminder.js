const reminderForm = document.getElementById("reminderForm");
const reminderTitle = document.getElementById("reminderTitle");
const reminderDate = document.getElementById("reminderDate");
const reminderTime = document.getElementById("reminderTime");
const reminderNote = document.getElementById("reminderNote");

const reminderList = document.getElementById("reminderList");
const notificationBox = document.getElementById("notificationBox");

const notificationBtn = document.getElementById("notificationBtn");
const notificationDot = document.getElementById("notificationDot");
const notificationPanel = document.getElementById("notificationPanel");
const notificationPopupList = document.getElementById("notificationPopupList");

let reminders = [];

const mockNotifications = [
    "Today you walked 5,432 steps.",
    "You consumed 1,850 kcal today.",
    "You completed 32 minutes of exercise.",
    "Keep going! You are close to your daily goal."
];

reminderForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = reminderTitle.value.trim();
    const date = reminderDate.value;
    const time = reminderTime.value;
    const note = reminderNote.value.trim();

    if (title === "" || date === "" || time === "") {
        alert("Please fill in the title, date, and time.");
        return;
    }

    const reminder = {
        title: title,
        date: date,
        time: time,
        note: note,
        triggered: false
    };

    reminders.push(reminder);

    renderReminders();
    addNotification("Reminder created: " + title, "success");
    clearForm();
});

function renderReminders() {
    reminderList.innerHTML = "";

    if (reminders.length === 0) {
        reminderList.innerHTML = `<div class="text-on-surface-variant">No reminders added yet.</div>`;
        return;
    }

    reminders.forEach(function (item) {
        const reminderCard = document.createElement("div");
        reminderCard.className =
            "hover-bg-high bg-surface-container p-4 rounded-4 d-flex align-items-start justify-content-between gap-3";

        reminderCard.innerHTML = `
            <div class="d-flex align-items-start gap-3">
                <div class="bg-surface-variant d-flex align-items-center justify-content-center rounded-circle" style="width:48px;height:48px;">
                    <span class="material-symbols-outlined text-primary-container">alarm</span>
                </div>
                <div>
                    <h4 class="font-bold h6 mb-1">${item.title}</h4>
                    <p class="small text-on-surface-variant mb-1">${item.date} • ${item.time}</p>
                    <p class="small text-on-surface-variant mb-0">${item.note || "No extra note"}</p>
                </div>
            </div>
            <span class="badge ${item.triggered ? "bg-success" : "bg-warning text-dark"}">
                ${item.triggered ? "Done" : "Pending"}
            </span>
        `;

        reminderList.appendChild(reminderCard);
    });
}

function addNotification(message, type) {
    clearDefaultText(notificationBox);
    clearDefaultText(notificationPopupList);

    const borderClass = getBorderClass(type);
    const timeText = new Date().toLocaleString();

    const pageNotification = document.createElement("div");
    pageNotification.className = `bg-surface-container p-3 rounded-4 border-start ${borderClass}`;
    pageNotification.innerHTML = `
        <div class="d-flex align-items-start gap-2">
            <span class="material-symbols-outlined text-primary-container">notifications</span>
            <div>
                <p class="mb-1 fw-bold">${message}</p>
                <small class="text-on-surface-variant">${timeText}</small>
            </div>
        </div>
    `;

    const popupNotification = document.createElement("div");
    popupNotification.className = `bg-surface-container p-2 rounded-3 border-start ${borderClass} mb-2`;
    popupNotification.innerHTML = `
        <p class="mb-1 fw-bold small">${message}</p>
        <small class="text-on-surface-variant">${timeText}</small>
    `;

    notificationBox.prepend(pageNotification);
    notificationPopupList.prepend(popupNotification);
    notificationDot.style.display = "block";
}

function clearDefaultText(container) {
    if (container.innerHTML.includes("No notifications yet.")) {
        container.innerHTML = "";
    }
}

function getBorderClass(type) {
    if (type === "success") {
        return "border-success";
    }

    if (type === "alert") {
        return "border-warning";
    }

    if (type === "mock") {
        return "border-info";
    }

    return "border-primary";
}

function clearForm() {
    reminderTitle.value = "";
    reminderDate.value = "";
    reminderTime.value = "";
    reminderNote.value = "";
}

function loadMockNotifications() {
    mockNotifications.forEach(function (message) {
        addNotification(message, "mock");
    });
}

notificationBtn.addEventListener("click", function (event) {
    event.stopPropagation();

    if (notificationPanel.style.display === "block") {
        notificationPanel.style.display = "none";
    } else {
        notificationPanel.style.display = "block";
        notificationDot.style.display = "none";
    }
});

document.addEventListener("click", function (event) {
    if (
        !notificationPanel.contains(event.target) &&
        !notificationBtn.contains(event.target)
    ) {
        notificationPanel.style.display = "none";
    }
});

function checkReminderTime() {
    const now = new Date();

    reminders.forEach(function (item) {
        if (item.triggered) {
            return;
        }

        const reminderDateTime = new Date(item.date + "T" + item.time);

        if (now >= reminderDateTime) {
            item.triggered = true;
            addNotification("Reminder alert: " + item.title, "alert");
            alert("Reminder: " + item.title);
            renderReminders();
        }
    });
}

setInterval(checkReminderTime, 5000);

renderReminders();
loadMockNotifications();