// Select canvas elements for the charts
const batteryCtx = document.getElementById("batteryChart").getContext("2d");
const diskSpaceCtx = document.getElementById("diskSpaceChart").getContext("2d");

// Select list elements for displaying the top 5 items
const largestAppsList = document.getElementById("largestAppsList");
const largestDownloadsList = document.getElementById("largestDownloadsList");
const largestDocumentsList = document.getElementById("largestDocumentsList");

// Modal elements for displaying detailed information
const infoModal = document.getElementById("infoModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");

// Helper function to format bytes into human-readable sizes (e.g., KB, MB, GB)
function formatBytes(bytes) {
    if (bytes === 0) return "0 bytes"; // Handle case where size is 0
    const sizes = ["bytes", "KB", "MB", "GB", "TB"]; // Units for file size
    const i = Math.floor(Math.log(bytes) / Math.log(1024)); // Determine the size unit
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i]; // Format output
}

// Create a pie chart for Battery Wear
const batteryChart = new Chart(batteryCtx, {
    type: "pie", // Chart type
    data: {
        labels: ["Wear Percent", "Remaining"], // Labels for chart segments
        datasets: [{
            data: [0, 100], // Initial placeholder data
            backgroundColor: ["rgba(255, 99, 132, 0.8)", "rgba(75, 192, 192, 0.8)"], // Segment colors
        }]
    }
});

// Create a pie chart for Disk Space Usage
const diskSpaceChart = new Chart(diskSpaceCtx, {
    type: "pie", // Chart type
    data: {
        labels: ["Used", "Available"], // Labels for chart segments
        datasets: [{
            data: [0, 100], // Initial placeholder data
            backgroundColor: ["rgba(255, 99, 132, 0.8)", "rgba(54, 162, 235, 0.8)"], // Segment colors
        }]
    }
});

// Fetch and update the charts and lists with real-time data
function updateDashboard() {
    // Fetch and update the Battery Wear chart
    fetch("/api/battery")
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            const wearPercent = data.data?.Wear_Percent || 0; // Extract wear percentage or default to 0
            batteryChart.data.datasets[0].data = [wearPercent, 100 - wearPercent]; // Update chart data
            batteryChart.update(); // Refresh the chart
        });

    // Fetch and update the Disk Space chart
    fetch("/api/disk-percentage")
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            const usedPercentage = data.percentage || 0; // Extract used percentage or default to 0
            diskSpaceChart.data.datasets[0].data = [usedPercentage, 100 - usedPercentage]; // Update chart data
            diskSpaceChart.update(); // Refresh the chart
        });

    // Helper function to fetch and update lists
    function updateList(apiEndpoint, elementId) {
        fetch(apiEndpoint)
            .then(response => response.json()) // Parse the response as JSON
            .then(data => {
                const list = document.getElementById(elementId); // Get the list element
                list.innerHTML = data.data // Populate the list dynamically
                    .map(item => `<li>${item.Name} - ${formatBytes(item["Size (bytes)"])}</li>`)
                    .join(''); // Convert array of list items to a single HTML string
            })
            .catch(() => {
                const list = document.getElementById(elementId); // Get the list element
                list.innerHTML = '<li>Error loading data</li>'; // Display error message
            });
    }

    // Update the lists for top 5 largest apps, downloads, and documents
    updateList("/api/largest-apps", "largestAppsList");
    updateList("/api/largest-downloads", "largestDownloadsList");
    updateList("/api/largest-documents", "largestDocumentsList");
}

// Function to display a modal with detailed information
function showModal(type) {
    // Set modal content based on the type
    if (type === "battery") {
        modalTitle.textContent = "Battery Wear"; // Set modal title
        modalContent.textContent = "This chart shows the battery wear percentage. A lower wear percentage indicates a healthier battery. Typical values range from 0% (new battery) to 100% (end-of-life).";
    } else if (type === "diskSpace") {
        modalTitle.textContent = "Disk Space Usage"; // Set modal title
        modalContent.textContent = "This chart shows the used and available disk space. A value below 80% used is considered optimal for performance.";
    }
    infoModal.style.display = "block"; // Show the modal
}

// Function to close the modal
function closeModal() {
    infoModal.style.display = "none"; // Hide the modal
}

// Initialize the dashboard by fetching data
updateDashboard();

// Refresh the dashboard data every 10 seconds
setInterval(updateDashboard, 10000);
