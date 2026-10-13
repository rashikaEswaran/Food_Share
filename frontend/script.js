// Campus Surplus Food Donation System - Plain JavaScript Client
// Base URL for Spring Boot REST API
const API_BASE_URL = "http://localhost:8080";

// Helper function to display temporary alerts
function showAlert(message, isError = false) {
    const alertBox = document.getElementById("alertBox");
    if (!alertBox) return;

    alertBox.textContent = message;
    alertBox.className = isError ? "alert alert-error" : "alert alert-success";
    alertBox.style.display = "block";

    setTimeout(() => {
        alertBox.style.display = "none";
    }, 4500);
}

// -------------------------------------------------------------
// DONOR FUNCTIONS (CRUD)
// -------------------------------------------------------------

let editingDonorId = null;

// Load donors into dropdown and table in donor.html
function loadDonors() {
    fetch(`${API_BASE_URL}/api/donors`)
        .then(response => response.json())
        .then(donors => {
            // 1. Populate dropdown in foodForm
            const select = document.getElementById("foodDonorSelect");
            if (select) {
                const currentVal = select.value;
                select.innerHTML = '<option value="">-- Choose Donor --</option>';
                donors.forEach(donor => {
                    const opt = document.createElement("option");
                    opt.value = donor.id;
                    opt.textContent = `${donor.name} (${donor.organizationName})`;
                    select.appendChild(opt);
                });
                if (currentVal) select.value = currentVal;
            }

            // 2. Populate Registered Donors table
            const tableBody = document.getElementById("donorsTableBody");
            if (tableBody) {
                if (!donors || donors.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No donors registered yet.</td></tr>';
                    return;
                }

                tableBody.innerHTML = "";
                donors.forEach(donor => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${donor.id}</td>
                        <td><strong>${escapeHtml(donor.name)}</strong></td>
                        <td>${escapeHtml(donor.email)}</td>
                        <td>${escapeHtml(donor.phone)}</td>
                        <td>${escapeHtml(donor.organizationName)}</td>
                        <td>
                            <button class="btn btn-edit" onclick="editDonor(${donor.id})">Edit</button>
                            <button class="btn btn-delete" onclick="deleteDonor(${donor.id})">Delete</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        })
        .catch(err => {
            console.error("Error loading donors:", err);
            const tableBody = document.getElementById("donorsTableBody");
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load donors.</td></tr>';
            }
        });
}

// Populate Donor form for editing
function editDonor(id) {
    fetch(`${API_BASE_URL}/api/donors/${id}`)
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch donor details");
            }
            return data;
        })
        .then(donor => {
            document.getElementById("donorName").value = donor.name || "";
            document.getElementById("donorEmail").value = donor.email || "";
            document.getElementById("donorPhone").value = donor.phone || "";
            document.getElementById("organizationName").value = donor.organizationName || "";

            editingDonorId = donor.id;
            const submitBtn = document.getElementById("donorSubmitBtn");
            if (submitBtn) submitBtn.textContent = "Update Donor";
            const cancelBtn = document.getElementById("donorCancelBtn");
            if (cancelBtn) cancelBtn.style.display = "inline-block";

            document.getElementById("donorForm").scrollIntoView({ behavior: "smooth" });
        })
        .catch(err => {
            showAlert(err.message, true);
        });
}

// Cancel Donor Edit
function cancelDonorEdit() {
    editingDonorId = null;
    const form = document.getElementById("donorForm");
    if (form) form.reset();
    const submitBtn = document.getElementById("donorSubmitBtn");
    if (submitBtn) submitBtn.textContent = "Add Donor";
    const cancelBtn = document.getElementById("donorCancelBtn");
    if (cancelBtn) cancelBtn.style.display = "none";
}

// Add or Update Donor
function addDonor(event) {
    event.preventDefault();

    const donorData = {
        name: document.getElementById("donorName").value.trim(),
        email: document.getElementById("donorEmail").value.trim(),
        phone: document.getElementById("donorPhone").value.trim(),
        organizationName: document.getElementById("organizationName").value.trim()
    };

    const isUpdating = editingDonorId !== null;
    const url = isUpdating ? `${API_BASE_URL}/api/donors/${editingDonorId}` : `${API_BASE_URL}/api/donors`;
    const method = isUpdating ? "PUT" : "POST";

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donorData)
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || (isUpdating ? "Failed to update donor" : "Failed to add donor"));
        }
        return data;
    })
    .then(() => {
        showAlert(isUpdating ? "Donor updated successfully!" : "Donor added successfully!");
        cancelDonorEdit();
        loadDonors();
    })
    .catch(err => {
        showAlert(err.message, true);
    });
}

// Delete Donor
function deleteDonor(id) {
    if (!confirm("Are you sure you want to delete this donor?")) {
        return;
    }

    fetch(`${API_BASE_URL}/api/donors/${id}`, {
        method: "DELETE"
    })
    .then(async response => {
        if (!response.ok) {
            let msg = "Failed to delete donor";
            try {
                const data = await response.json();
                msg = data.message || msg;
            } catch (_) {}
            throw new Error(msg);
        }
    })
    .then(() => {
        showAlert("Donor deleted successfully!");
        if (editingDonorId === id) {
            cancelDonorEdit();
        }
        loadDonors();
    })
    .catch(err => {
        showAlert(err.message, true);
    });
}

// -------------------------------------------------------------
// FOOD LISTING FUNCTIONS (CRUD)
// -------------------------------------------------------------

let editingFoodListingId = null;

// Populate Food Listing form for editing
function editFoodListing(id) {
    fetch(`${API_BASE_URL}/api/food-listings/${id}`)
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch food listing details");
            }
            return data;
        })
        .then(listing => {
            if (listing.donor && listing.donor.id) {
                const select = document.getElementById("foodDonorSelect");
                if (select) select.value = listing.donor.id;
            }
            document.getElementById("foodName").value = listing.foodName || "";
            document.getElementById("foodDescription").value = listing.description || "";
            document.getElementById("foodQuantity").value = listing.quantity || "";
            document.getElementById("foodUnit").value = listing.unit || "";
            if (listing.expiryTime) {
                // Slice to YYYY-MM-DDTHH:mm for datetime-local input
                document.getElementById("expiryTime").value = listing.expiryTime.slice(0, 16);
            }
            document.getElementById("pickupLocation").value = listing.pickupLocation || "";

            editingFoodListingId = listing.id;
            const submitBtn = document.getElementById("foodSubmitBtn");
            if (submitBtn) submitBtn.textContent = "Update Food Listing";
            const cancelBtn = document.getElementById("foodCancelBtn");
            if (cancelBtn) cancelBtn.style.display = "inline-block";

            document.getElementById("foodForm").scrollIntoView({ behavior: "smooth" });
        })
        .catch(err => {
            showAlert(err.message, true);
        });
}

// Cancel Food Listing Edit
function cancelFoodListingEdit() {
    editingFoodListingId = null;
    const form = document.getElementById("foodForm");
    if (form) form.reset();
    const submitBtn = document.getElementById("foodSubmitBtn");
    if (submitBtn) submitBtn.textContent = "Add Food Listing";
    const cancelBtn = document.getElementById("foodCancelBtn");
    if (cancelBtn) cancelBtn.style.display = "none";
}

// Create or Update Food Listing
function addFoodListing(event) {
    event.preventDefault();

    const donorId = document.getElementById("foodDonorSelect").value;
    if (!donorId) {
        showAlert("Please select a donor", true);
        return;
    }

    const foodData = {
        foodName: document.getElementById("foodName").value.trim(),
        description: document.getElementById("foodDescription").value.trim(),
        quantity: parseInt(document.getElementById("foodQuantity").value, 10),
        unit: document.getElementById("foodUnit").value.trim(),
        expiryTime: document.getElementById("expiryTime").value,
        pickupLocation: document.getElementById("pickupLocation").value.trim(),
        donor: { id: parseInt(donorId, 10) }
    };

    const isUpdating = editingFoodListingId !== null;
    const url = isUpdating ? `${API_BASE_URL}/api/food-listings/${editingFoodListingId}` : `${API_BASE_URL}/api/food-listings`;
    const method = isUpdating ? "PUT" : "POST";

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(foodData)
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || (isUpdating ? "Failed to update food listing" : "Failed to add food listing"));
        }
        return data;
    })
    .then(() => {
        showAlert(isUpdating ? "Food listing updated successfully!" : "Food listing created successfully!");
        cancelFoodListingEdit();
        loadFoodListings();
    })
    .catch(err => {
        showAlert(err.message, true);
    });
}

// Delete Food Listing
function deleteFoodListing(id) {
    if (!confirm("Are you sure you want to delete this food listing?")) {
        return;
    }

    fetch(`${API_BASE_URL}/api/food-listings/${id}`, {
        method: "DELETE"
    })
    .then(async response => {
        if (!response.ok) {
            let msg = "Failed to delete food listing";
            try {
                const data = await response.json();
                msg = data.message || msg;
            } catch (_) {}
            throw new Error(msg);
        }
    })
    .then(() => {
        showAlert("Food listing deleted successfully!");
        if (editingFoodListingId === id) {
            cancelFoodListingEdit();
        }
        loadFoodListings();
    })
    .catch(err => {
        showAlert(err.message, true);
    });
}

// Load all food listings in donor.html
function loadFoodListings() {
    const tableBody = document.getElementById("foodListingsTableBody");
    if (!tableBody) return;

    fetch(`${API_BASE_URL}/api/food-listings`)
        .then(response => response.json())
        .then(listings => {
            if (!listings || listings.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No food listings yet.</td></tr>';
                return;
            }

            tableBody.innerHTML = "";
            listings.forEach(item => {
                const donorOrg = item.donor ? item.donor.organizationName : "N/A";
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${item.id}</td>
                    <td><strong>${escapeHtml(item.foodName)}</strong></td>
                    <td>${escapeHtml(donorOrg)}</td>
                    <td>${item.quantity} ${escapeHtml(item.unit)}</td>
                    <td>${formatDate(item.expiryTime)}</td>
                    <td>${escapeHtml(item.pickupLocation)}</td>
                    <td><span class="status-badge status-${item.status}">${item.status}</span></td>
                    <td>
                        <button class="btn btn-edit" onclick="editFoodListing(${item.id})">Edit</button>
                        <button class="btn btn-delete" onclick="deleteFoodListing(${item.id})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Error loading food listings:", err);
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Failed to load listings.</td></tr>';
        });
}

// -------------------------------------------------------------
// NGO & CLAIM FUNCTIONS (CRUD)
// -------------------------------------------------------------

let editingNgoId = null;

// Load NGOs into selection dropdown and table in ngo.html
function loadClaimingNGOs() {
    fetch(`${API_BASE_URL}/api/ngos`)
        .then(response => response.json())
        .then(ngos => {
            // 1. Populate dropdown in active claiming NGO section
            const select = document.getElementById("claimingNgoSelect");
            if (select) {
                const currentVal = select.value;
                select.innerHTML = '<option value="">-- Select Registered NGO --</option>';
                ngos.forEach(ngo => {
                    const opt = document.createElement("option");
                    opt.value = ngo.id;
                    opt.textContent = `${ngo.name} (${ngo.address})`;
                    select.appendChild(opt);
                });
                if (currentVal) select.value = currentVal;
            }

            // 2. Populate All NGOs table
            const tableBody = document.getElementById("ngosTableBody");
            if (tableBody) {
                if (!ngos || ngos.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No NGOs registered yet.</td></tr>';
                    return;
                }

                tableBody.innerHTML = "";
                ngos.forEach(ngo => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${ngo.id}</td>
                        <td><strong>${escapeHtml(ngo.name)}</strong></td>
                        <td>${escapeHtml(ngo.email)}</td>
                        <td>${escapeHtml(ngo.phone)}</td>
                        <td>${escapeHtml(ngo.address)}</td>
                        <td>
                            <button class="btn btn-edit" onclick="editNGO(${ngo.id})">Edit</button>
                            <button class="btn btn-delete" onclick="deleteNGO(${ngo.id})">Delete</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        })
        .catch(err => {
            console.error("Error loading NGOs:", err);
            const tableBody = document.getElementById("ngosTableBody");
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load NGOs.</td></tr>';
            }
        });
}

// Populate NGO form for editing
function editNGO(id) {
    fetch(`${API_BASE_URL}/api/ngos/${id}`)
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch NGO details");
            }
            return data;
        })
        .then(ngo => {
            document.getElementById("ngoName").value = ngo.name || "";
            document.getElementById("ngoEmail").value = ngo.email || "";
            document.getElementById("ngoPhone").value = ngo.phone || "";
            document.getElementById("ngoAddress").value = ngo.address || "";

            editingNgoId = ngo.id;
            const submitBtn = document.getElementById("ngoSubmitBtn");
            if (submitBtn) submitBtn.textContent = "Update NGO";
            const cancelBtn = document.getElementById("ngoCancelBtn");
            if (cancelBtn) cancelBtn.style.display = "inline-block";

            document.getElementById("ngoForm").scrollIntoView({ behavior: "smooth" });
        })
        .catch(err => {
            showAlert(err.message, true);
        });
}

// Cancel NGO Edit
function cancelNGOEdit() {
    editingNgoId = null;
    const form = document.getElementById("ngoForm");
    if (form) form.reset();
    const submitBtn = document.getElementById("ngoSubmitBtn");
    if (submitBtn) submitBtn.textContent = "Add NGO";
    const cancelBtn = document.getElementById("ngoCancelBtn");
    if (cancelBtn) cancelBtn.style.display = "none";
}

// Add or Update NGO
function addNGO(event) {
    event.preventDefault();

    const ngoData = {
        name: document.getElementById("ngoName").value.trim(),
        email: document.getElementById("ngoEmail").value.trim(),
        phone: document.getElementById("ngoPhone").value.trim(),
        address: document.getElementById("ngoAddress").value.trim()
    };

    const isUpdating = editingNgoId !== null;
    const url = isUpdating ? `${API_BASE_URL}/api/ngos/${editingNgoId}` : `${API_BASE_URL}/api/ngos`;
    const method = isUpdating ? "PUT" : "POST";

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ngoData)
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || (isUpdating ? "Failed to update NGO" : "Failed to add NGO"));
        }
        return data;
    })
    .then(() => {
        showAlert(isUpdating ? "NGO updated successfully!" : "NGO registered successfully!");
        cancelNGOEdit();
        loadClaimingNGOs();
    })
    .catch(err => {
        showAlert(err.message, true);
    });
}

// Delete NGO
function deleteNGO(id) {
    if (!confirm("Are you sure you want to delete this NGO?")) {
        return;
    }

    fetch(`${API_BASE_URL}/api/ngos/${id}`, {
        method: "DELETE"
    })
    .then(async response => {
        if (!response.ok) {
            let msg = "Failed to delete NGO";
            try {
                const data = await response.json();
                msg = data.message || msg;
            } catch (_) {}
            throw new Error(msg);
        }
    })
    .then(() => {
        showAlert("NGO deleted successfully!");
        if (editingNgoId === id) {
            cancelNGOEdit();
        }
        loadClaimingNGOs();
    })
    .catch(err => {
        showAlert(err.message, true);
    });
}

// Load available food in ngo.html
function loadAvailableFood() {
    const tableBody = document.getElementById("availableFoodTableBody");
    if (!tableBody) return;

    fetch(`${API_BASE_URL}/api/food-listings/available`)
        .then(response => response.json())
        .then(listings => {
            if (!listings || listings.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No surplus food available for claim right now.</td></tr>';
                return;
            }

            tableBody.innerHTML = "";
            listings.forEach(item => {
                const donorOrg = item.donor ? item.donor.organizationName : "Campus Canteen";
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><strong>${escapeHtml(item.foodName)}</strong></td>
                    <td>${escapeHtml(donorOrg)}</td>
                    <td>${item.quantity} ${escapeHtml(item.unit)}</td>
                    <td>${formatDate(item.expiryTime)}</td>
                    <td>${escapeHtml(item.pickupLocation)}</td>
                    <td>
                        <button class="btn btn-claim" onclick="claimFood(${item.id})">Claim Food</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Error loading available food:", err);
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load available food.</td></tr>';
        });
}

// Claim a Food Listing
function claimFood(foodListingId) {
    const ngoSelect = document.getElementById("claimingNgoSelect");
    const ngoId = ngoSelect ? ngoSelect.value : null;

    if (!ngoId) {
        showAlert("Please select an NGO from the dropdown above before claiming.", true);
        return;
    }

    const payload = {
        foodListingId: parseInt(foodListingId, 10),
        ngoId: parseInt(ngoId, 10)
    };

    fetch(`${API_BASE_URL}/api/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to claim food");
        }
        return data;
    })
    .then(() => {
        showAlert("Food successfully claimed!");
        loadAvailableFood();
        loadClaims();
    })
    .catch(err => {
        showAlert(err.message, true);
    });
}

// Load Claims in ngo.html
function loadClaims() {
    const tableBody = document.getElementById("claimsTableBody");
    if (!tableBody) return;

    fetch(`${API_BASE_URL}/api/claims`)
        .then(response => response.json())
        .then(claims => {
            if (!claims || claims.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No claims recorded yet.</td></tr>';
                return;
            }

            tableBody.innerHTML = "";
            claims.forEach(claim => {
                const foodName = claim.foodListing ? claim.foodListing.foodName : "N/A";
                const ngoName = claim.ngo ? claim.ngo.name : "N/A";
                const actionButton = claim.status === "CLAIMED"
                    ? `<button class="btn btn-collect" onclick="collectFood(${claim.id})">Mark Collected</button>`
                    : '<span style="color: #666; font-size: 12px;">Collected</span>';

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>#${claim.id}</td>
                    <td><strong>${escapeHtml(foodName)}</strong></td>
                    <td>${escapeHtml(ngoName)}</td>
                    <td>${formatDate(claim.claimedAt)}</td>
                    <td><span class="status-badge status-${claim.status}">${claim.status}</span></td>
                    <td>${actionButton}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Error loading claims:", err);
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load claims.</td></tr>';
        });
}

// Collect Food
function collectFood(claimId) {
    fetch(`${API_BASE_URL}/api/claims/${claimId}/collect`, {
        method: "PUT"
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to mark as collected");
        }
        return data;
    })
    .then(() => {
        showAlert("Food marked as collected!");
        loadClaims();
        loadAvailableFood();
    })
    .catch(err => {
        showAlert(err.message, true);
    });
}

// -------------------------------------------------------------
// UTILITIES
// -------------------------------------------------------------

function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleString();
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
