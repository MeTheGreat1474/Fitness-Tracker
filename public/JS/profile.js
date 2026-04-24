const profileForm = document.getElementById("profileForm");

const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const ageInput = document.getElementById("ageInput");
const weightInput = document.getElementById("weightInput");
const heightInput = document.getElementById("heightInput");

const displayName = document.getElementById("displayName");
const displayEmail = document.getElementById("displayEmail");
const displayAge = document.getElementById("displayAge");
const displayWeight = document.getElementById("displayWeight");
const displayHeight = document.getElementById("displayHeight");
const profileAvatar = document.getElementById("profileAvatar");

const saveMessage = document.getElementById("saveMessage");
const resetBtn = document.getElementById("resetBtn");

let profile = {
    name: "John Doe",
    email: "john@email.com",
    age: 19,
    weight: 70,
    height: 175
};

function loadProfile() {
    displayName.innerText = profile.name;
    displayEmail.innerText = profile.email;
    displayAge.innerText = profile.age;
    displayWeight.innerText = profile.weight + " kg";
    displayHeight.innerText = profile.height + " cm";

    profileAvatar.innerText = profile.name.charAt(0).toUpperCase();

    nameInput.value = profile.name;
    emailInput.value = profile.email;
    ageInput.value = profile.age;
    weightInput.value = profile.weight;
    heightInput.value = profile.height;
}

function isFormEmpty() {
    if (
        nameInput.value.trim() === "" ||
        emailInput.value.trim() === "" ||
        ageInput.value.trim() === "" ||
        weightInput.value.trim() === "" ||
        heightInput.value.trim() === ""
    ) {
        return true;
    }

    return false;
}

function isEmailValid() {
    if (!emailInput.value.includes("@")) {
        return false;
    }

    return true;
}

function isNumberValid() {
    if (
        Number(ageInput.value) <= 0 ||
        Number(weightInput.value) <= 0 ||
        Number(heightInput.value) <= 0
    ) {
        return false;
    }

    return true;
}

function validateProfile() {
    if (isFormEmpty()) {
        alert("Please fill in all profile fields.");
        return false;
    }

    if (!isEmailValid()) {
        alert("Please enter a valid email address.");
        return false;
    }

    if (!isNumberValid()) {
        alert("Age, weight, and height must be greater than 0.");
        return false;
    }

    return true;
}

function saveProfile(event) {
    event.preventDefault();

    if (!validateProfile()) {
        return;
    }

    profile.name = nameInput.value.trim();
    profile.email = emailInput.value.trim();
    profile.age = ageInput.value.trim();
    profile.weight = weightInput.value.trim();
    profile.height = heightInput.value.trim();

    loadProfile();
    showSaveMessage();
}

function showSaveMessage() {
    saveMessage.classList.remove("d-none");

    setTimeout(function () {
        saveMessage.classList.add("d-none");
    }, 2000);
}

function resetForm() {
    loadProfile();
    saveMessage.classList.add("d-none");
}

profileForm.addEventListener("submit", saveProfile);
resetBtn.addEventListener("click", resetForm);

loadProfile();