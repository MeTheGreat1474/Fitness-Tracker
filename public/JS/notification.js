const notificationBtn = document.getElementById("notificationBtn");
const notificationDot = document.getElementById("notificationDot");
const notificationPanel = document.getElementById("notificationPanel");
const notificationPopupList = document.getElementById("notificationPopupList");

const sharedNotifications = [
    "Today you walked 5,432 steps.",
    "You consumed 1,850 kcal today.",
    "You completed 32 minutes of exercise.",
    "Keep going! You are close to your daily goal."
];

function addSharedNotification(message) {
    if (!notificationPopupList || !notificationDot) {
        return;
    }

    if (notificationPopupList.innerHTML.includes("No notifications yet.")) {
        notificationPopupList.innerHTML = "";
    }

    const item = document.createElement("div");
    item.className = "bg-surface-container p-2 rounded-3 border-start border-info mb-2";

    item.innerHTML = `
        <p class="mb-1 fw-bold small">${message}</p>
        <small class="text-on-surface-variant">${new Date().toLocaleString()}</small>
    `;

    notificationPopupList.prepend(item);
    notificationDot.style.display = "block";
}

function loadSharedNotifications() {
    for (let i = 0; i < sharedNotifications.length; i++) {
        addSharedNotification(sharedNotifications[i]);
    }
}

if (notificationBtn) {
    notificationBtn.addEventListener("click", function (event) {
        event.stopPropagation();

        if (notificationPanel.style.display === "block") {
            notificationPanel.style.display = "none";
        } else {
            notificationPanel.style.display = "block";
            notificationDot.style.display = "none";
        }
    });
}

document.addEventListener("click", function (event) {
    if (
        notificationPanel &&
        notificationBtn &&
        !notificationPanel.contains(event.target) &&
        !notificationBtn.contains(event.target)
    ) {
        notificationPanel.style.display = "none";
    }
});

loadSharedNotifications();