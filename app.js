const canvas = document.getElementById("signaturePad");
const ctx = canvas.getContext("2d");

let drawing = false;

// MOUSE EVENTS
canvas.addEventListener("mousedown", () => {
  drawing = true;
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx.beginPath();
});

canvas.addEventListener("mousemove", draw);

// TOUCH EVENTS
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  drawing = true;
});

canvas.addEventListener("touchend", () => {
  drawing = false;
  ctx.beginPath();
});

canvas.addEventListener("touchmove", drawTouch);

// DRAW WITH MOUSE
function draw(e) {
  if (!drawing) return;

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

// DRAW WITH TOUCH
function drawTouch(e) {
  if (!drawing) return;

  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

// CLEAR SIGNATURE
document.getElementById("clearSignature").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// SAVE FORM
document.getElementById("consentForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.querySelector('input[placeholder="Full Name"]').value;
  const phone = document.querySelector('input[placeholder="Phone Number"]').value;
  const email = document.querySelector('input[placeholder="Email Address"]').value;
  const dob = document.getElementById("dobField").value;
  const notes = document.querySelector("textarea").value;
  const marketingConsent = document.getElementById("marketingConsent").checked;

  const conditions = Array.from(
    document.querySelectorAll('input[name="conditions"]:checked')
  ).map((item) => item.value);

  const signature = canvas.toDataURL();

  const submission = {
    name,
    phone,
    email,
    dob,
    conditions,
    notes,
    marketingConsent,
    signature,
    date: new Date().toISOString()
  };

  let submissions = JSON.parse(localStorage.getItem("tattooForms")) || [];
  let contacts = JSON.parse(localStorage.getItem("clientContacts")) || [];

  submissions.push(submission);

  contacts.push({
    name,
    phone,
    email,
    marketingConsent,
    date: new Date().toISOString()
  });

  localStorage.setItem("tattooForms", JSON.stringify(submissions));
  localStorage.setItem("clientContacts", JSON.stringify(contacts));

  emailjs.send("service_4gmrjy5", "template_jfyze9l", {
    name: name,
    phone: phone,
    email: email,
    dob: dob,
    conditions: conditions.length ? conditions.join(", ") : "None selected",
    notes: notes || "None",
    marketingConsent: marketingConsent ? "Yes" : "No",
    date: new Date().toLocaleString()
  }).then(function () {
    alert("Form saved & sent to email!");
    document.getElementById("consentForm").reset();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }).catch(function (error) {
    alert("Form saved locally, but email failed.");
    console.log("EmailJS error:", error);
    document.getElementById("consentForm").reset();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
});

// VIEW SAVED FORMS
document.getElementById("viewForms").addEventListener("click", function () {
  const pin = prompt("Enter PIN to access saved forms:");

  if (pin !== "1983") {
    alert("Incorrect PIN");
    return;
  }

  const savedFormsDiv = document.getElementById("savedForms");
  const savedContactsDiv = document.getElementById("savedContacts");
  savedContactsDiv.innerHTML = "";

  let submissions = JSON.parse(localStorage.getItem("tattooForms")) || [];

  if (submissions.length === 0) {
    savedFormsDiv.innerHTML = "<p>No saved forms yet.</p>";
    return;
  }

  let html = "<h2>Saved Forms</h2>";

  submissions.forEach((form, index) => {
    html += `
      <div style="background:#222; padding:15px; margin-top:10px; border-radius:8px;">
        <p><strong>Name:</strong> ${form.name}</p>
        <p><strong>Phone:</strong> ${form.phone}</p>
        <p><strong>Email:</strong> ${form.email}</p>
        <p><strong>Date of Birth:</strong> ${form.dob}</p>
        <p><strong>Conditions:</strong> ${form.conditions ? form.conditions.join(", ") : "None selected"}</p>
        <p><strong>Notes:</strong> ${form.notes}</p>
        <p><strong>Marketing Consent:</strong> ${form.marketingConsent ? "Yes" : "No"}</p>
        <p><strong>Saved:</strong> ${form.date}</p>
        <button onclick="deleteForm(${index})">Delete Form</button>
        <img src="${form.signature}" style="width:100%; max-width:300px; background:white;">
      </div>
    `;
  });

  savedFormsDiv.innerHTML = html;
});

// VIEW CONTACTS
function showContacts() {
  const savedContactsDiv = document.getElementById("savedContacts");
  const savedFormsDiv = document.getElementById("savedForms");
  savedFormsDiv.innerHTML = "";

  let contacts = JSON.parse(localStorage.getItem("clientContacts")) || [];
  const searchInput = document.getElementById("contactSearch");
  const searchValue = searchInput.value.trim().toLowerCase();

  if (contacts.length === 0) {
    savedContactsDiv.innerHTML = "<p>No saved contacts yet.</p>";
    return;
  }

  const filteredContacts = contacts.filter((contact) =>
    (contact.name || "").toLowerCase().includes(searchValue)
  );

  let html = "<h2>Client Contacts</h2>";

  if (filteredContacts.length === 0) {
    html += "<p>No matching contacts found.</p>";
  } else {
    filteredContacts.forEach((contact) => {
      const originalIndex = contacts.indexOf(contact);

      html += `
        <div style="background:#222; padding:15px; margin-top:10px; border-radius:8px;">
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Phone:</strong> ${contact.phone}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Marketing Consent:</strong> ${contact.marketingConsent ? "Yes" : "No"}</p>
          <p><strong>Saved:</strong> ${contact.date}</p>
          <button onclick="deleteContact(${originalIndex})">Delete</button>
        </div>
      `;
    });
  }

  savedContactsDiv.innerHTML = html;
}

document.getElementById("viewContacts").addEventListener("click", function () {
  const pin = prompt("Enter PIN to access contacts:");

  if (pin !== "1983") {
    alert("Incorrect PIN");
    return;
  }

  showContacts();
});

// LIVE SEARCH
document.getElementById("contactSearch").addEventListener("input", function () {
  showContacts();
});

// DELETE CONTACT
function deleteContact(index) {
  if (!confirm("Are you sure you want to delete this contact?")) return;

  let contacts = JSON.parse(localStorage.getItem("clientContacts")) || [];
  contacts.splice(index, 1);
  localStorage.setItem("clientContacts", JSON.stringify(contacts));
  showContacts();
}

// DELETE FORM
function deleteForm(index) {
  if (!confirm("Are you sure you want to delete this form?")) return;

  let submissions = JSON.parse(localStorage.getItem("tattooForms")) || [];
  submissions.splice(index, 1);
  localStorage.setItem("tattooForms", JSON.stringify(submissions));
  document.getElementById("viewForms").click();
}

// REGISTER SERVICE WORKER
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => console.log("Service Worker registered"))
      .catch((error) => console.log("Service Worker registration failed:", error));
  });
}

// SCROLL EFFECT FOR BACKGROUND LOGO
window.addEventListener("scroll", () => {
  const bgLogo = document.querySelector(".bg-logo");
  if (!bgLogo) return;

  const scrollY = window.scrollY;
  const newOpacity = Math.max(0.05, 0.08 - scrollY / 16000);

  bgLogo.style.opacity = newOpacity;
});

// SMOOTH LOGO PARALLAX + FADE
window.addEventListener("scroll", () => {
  const bgLogo = document.querySelector(".bg-logo");
  if (!bgLogo) return;

  const scrollY = window.scrollY;

  bgLogo.style.transform = `translateX(-50%) translateY(${scrollY * 0.1}px)`;

  const opacity = Math.max(0.02, 0.05 - scrollY / 5000);
  bgLogo.style.opacity = opacity;
});

document.getElementById("hideRecords").addEventListener("click", function () {
  document.getElementById("savedForms").innerHTML = "";
  document.getElementById("savedContacts").innerHTML = "";
});

window.addEventListener("load", () => {
  const video = document.getElementById("introVideo");
  const intro = document.getElementById("introScreen");

  if (video && intro) {
    const removeIntro = () => {
      intro.style.transition = "opacity 0.8s ease";
      intro.style.opacity = "0";

      setTimeout(() => {
        if (intro.parentNode) {
          intro.remove();
        }
      }, 800);
    };

    video.onended = removeIntro;
    video.onerror = removeIntro;

    setTimeout(removeIntro, 9000);
  }
});
const dobField = document.getElementById("dobField");

if (dobField) {
  dobField.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "").slice(0, 8);

    if (value.length > 4) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4);
    } else if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }

    e.target.value = value;
  });
}
