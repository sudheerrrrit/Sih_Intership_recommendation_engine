console.log("📂 form.js loaded");

let options = {};

// JSON fetch
fetch("/data/options.json")
    .then(res => res.json())
    .then(data => {
        options = data;
        console.log("✅ JSON Loaded:", data);

        // Language
        let langSel = document.getElementById("language");
        data.languages.forEach(l => langSel.add(new Option(l, l)));

        // Education Category
        let eduCat = document.getElementById("educationCategory");
        Object.keys(data.education).forEach(cat => {
            eduCat.add(new Option(cat, cat));
        });

        // Sector
        let sectorSel = document.getElementById("sectors");
        data.sectors.forEach(sec => sectorSel.add(new Option(sec, sec)));

        // States
        let stateSel = document.getElementById("state");
        Object.keys(data.locations).forEach(state => {
            stateSel.add(new Option(state, state));
        });

        // Interests
        let interestSel = document.getElementById("interests");
        data.interests.forEach(i => interestSel.add(new Option(i, i)));
        interestSel.add(new Option("Other (Add manually)", "custom"));
    })
    .catch(err => console.error("❌ Error loading JSON:", err));


// ---------- Dependent Dropdowns ----------

// Education Category → Courses
document.getElementById("educationCategory").addEventListener("change", function () {
    let courseSel = document.getElementById("educationCourse");
    courseSel.innerHTML = "";
    options.education[this.value].forEach(c => {
        courseSel.add(new Option(c, c));
    });
});

// Course → Skills (Checkboxes)
document.getElementById("educationCourse").addEventListener("change", function () {
    let skillsDiv = document.getElementById("skills");
    skillsDiv.innerHTML = ""; // साफ करो

    let skillList = options.skills[this.value] || options.skills["Default"];
    console.log("✅ Skills for", this.value, ":", skillList);

    skillList.forEach(s => {
        let wrapper = document.createElement("div");
        wrapper.className = "form-check";
        wrapper.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${s}" id="skill-${s}">
            <label class="form-check-label" for="skill-${s}">${s}</label>
        `;
        skillsDiv.appendChild(wrapper);
    });

    // Manual input for new skill
    let manual = document.createElement("input");
    manual.type = "text";
    manual.className = "form-control mt-2";
    manual.id = "newSkill";
    manual.placeholder = "Enter new skill (optional)";
    skillsDiv.appendChild(manual);
});

// State → Districts
document.getElementById("state").addEventListener("change", function () {
    let distSel = document.getElementById("district");
    distSel.innerHTML = "";
    options.locations[this.value].forEach(d => {
        distSel.add(new Option(d, d));
    });
});

// Interests → Custom input
document.getElementById("interests").addEventListener("change", function () {
    if ([...this.selectedOptions].some(o => o.value === "custom")) {
        document.getElementById("newInterest").style.display = "block";
    } else {
        document.getElementById("newInterest").style.display = "none";
    }
});


// ---------- Submit Form ----------
document.querySelector("button").addEventListener("click", function () {
    let payload = {
        language: document.getElementById("language").value,
        education: document.getElementById("educationCourse").value,
        skills: [...document.querySelectorAll("#skills input[type=checkbox]:checked")].map(cb => cb.value),
        sectorInterest: document.getElementById("sectors").value,
        state: document.getElementById("state").value,
        location: document.getElementById("district").value,
        interests: [...document.getElementById("interests").selectedOptions].map(o => o.value).filter(i => i !== "custom")
    };

    // अगर user manual skill डाले तो उसे भी जोड़ो
    let newSkill = document.getElementById("newSkill")?.value;
    if (newSkill) payload.skills.push(newSkill);

    let newInterest = document.getElementById("newInterest")?.value;
    if (newInterest) payload.interests.push(newInterest);

    console.log("📤 Sending payload:", payload);

    // Backend API call
    fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            let resultsDiv = document.getElementById("results");
            resultsDiv.innerHTML = "";

            if (!data || data.length === 0) {
                resultsDiv.innerHTML = `<p class="text-danger">❌ No recommendations found</p>`;
                return;
            }

            data.forEach(item => {
                let card = `
          <div class="card mb-3 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
              <h6 class="card-subtitle mb-2 text-muted">${item.sector}</h6>
              <p class="card-text">
                <b>Location:</b> ${item.location} <br>
                <b>Duration:</b> ${item.duration} <br>
                <b>Match Score:</b> ${item.matchScore}%

              </p>
              <a href="#" class="btn btn-sm btn-primary">Apply Now</a>
            </div>
          </div>
        `;
                resultsDiv.innerHTML += card;
            });
        })
        .catch(err => console.error("❌ Error in API:", err));
});
