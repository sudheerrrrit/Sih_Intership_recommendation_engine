console.log("📂 form.js loaded");

let options = {};

// JSON fetch
fetch("/data/options.json")
    .then(res => res.json())
    .then(data => {
        options = data;
        console.log("✅ JSON Loaded:", data);

        // Populate language dropdown
        let langSel = document.getElementById("language");
        data.languages.forEach(l => langSel.add(new Option(l, l)));

        // Populate education category dropdown
        let eduCat = document.getElementById("educationCategory");
        Object.keys(data.education).forEach(cat => eduCat.add(new Option(cat, cat)));

        // Populate sectors
        let sectorSel = document.getElementById("sectors");
        data.sectors.forEach(sec => sectorSel.add(new Option(sec, sec)));

        // Populate states
        let stateSel = document.getElementById("state");
        Object.keys(data.locations).forEach(state => stateSel.add(new Option(state, state)));

        // Populate interests
        let interestSel = document.getElementById("interests");
        data.interests.forEach(i => interestSel.add(new Option(i, i)));
        interestSel.add(new Option("Other (Add manually)", "custom"));
    })
    .catch(err => console.error("❌ Error loading JSON:", err));

// Dynamic dropdown handling for courses, skills, districts, and custom interest input...
// (बचे हुए logic वही रहेगा जैसा पहले था)

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

    let newSkill = document.getElementById("newSkill")?.value;
    if (newSkill) payload.skills.push(newSkill);

    let newInterest = document.getElementById("newInterest")?.value;
    if (newInterest) payload.interests.push(newInterest);

    console.log("📤 Sending payload:", payload);

    // ** Backend call with the correct Render URL **
    fetch("https://sih-intership-recommendation-engine-2.onrender.com/api/recommend", {
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
