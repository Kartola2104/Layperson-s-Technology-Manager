// Retrieve the contexts for the canvas elements to draw charts
const batteryCtx = document.getElementById('batteryChart').getContext('2d');
const diskSpaceCtx = document.getElementById('diskSpaceChart').getContext('2d');
const cpuCtx = document.getElementById('cpuChart').getContext('2d');
const ramCtx = document.getElementById('ramChart').getContext('2d');

// Get references to list containers for displaying largest files
const largestAppsList = document.getElementById('largestAppsList');
const largestDownloadsList = document.getElementById('largestDownloadsList');
const largestDocumentsList = document.getElementById('largestDocumentsList');

// Modal elements for displaying additional information
const infoModal = document.getElementById('infoModal');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');

// Helper function to convert bytes into a human-readable format (e.g., KB, MB, GB)
function formatBytes(bytes) {
    if (bytes === 0) return "0 bytes";
    const sizes = ["bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024)); // Calculate size index
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i]; // Format output
}

// Function to initialize a pie chart with a given context and labels
function createPieChart(ctx, labels) {
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: [0, 100], // Initial dummy data (e.g., 0% used, 100% free)
                backgroundColor: ['#61dafb', '#2d3f57'], // Colors for segments
                borderWidth: 1, // Segment border width
            }]
        },
        options: {
            plugins: {
                legend: { display: true }, // Enable legend
            },
        }
    });
}

// Create initial instances of pie charts for the dashboard
const batteryChart = createPieChart(batteryCtx, ['Wear Percent', 'Remaining']);
const diskSpaceChart = createPieChart(diskSpaceCtx, ['Used', 'Free']);
const cpuChart = createPieChart(cpuCtx, ['Used', 'Free']);
const ramChart = createPieChart(ramCtx, ['Used', 'Free']);

// Function to update the lists for largest apps, downloads, and documents
function updateLists() {
    // Fetch and update the list of top 5 largest apps
    fetch('/api/largest-apps')
        .then(response => response.json())
        .then(data => {
            largestAppsList.innerHTML = data.data
                .map(item => `<li>${item.Name} - ${formatBytes(item['Size (bytes)'])}</li>`)
                .join(''); // Create list items dynamically
        })
        .catch(() => {
            largestAppsList.innerHTML = '<li>Error loading apps data</li>'; // Fallback on error
        });

    // Fetch and update the list of top 5 largest downloads
    fetch('/api/largest-downloads')
        .then(response => response.json())
        .then(data => {
            largestDownloadsList.innerHTML = data.data
                .map(item => `<li>${item.Name} - ${formatBytes(item['Size (bytes)'])}</li>`)
                .join('');
        })
        .catch(() => {
            largestDownloadsList.innerHTML = '<li>Error loading downloads data</li>';
        });

    // Fetch and update the list of top 5 largest documents
    fetch('/api/largest-documents')
        .then(response => response.json())
        .then(data => {
            largestDocumentsList.innerHTML = data.data
                .map(item => `<li>${item.Name} - ${formatBytes(item['Size (bytes)'])}</li>`)
                .join('');
        })
        .catch(() => {
            largestDocumentsList.innerHTML = '<li>Error loading documents data</li>';
        });
}

// Function to fetch and update data for the dashboard charts and lists
function updateDashboard() {
    // Update battery chart with wear percentage
    fetch('/api/battery')
        .then(response => response.json())
        .then(data => {
            const wearPercent = data.data?.Wear_Percent || 0; // Extract wear percent or default to 0
            batteryChart.data.datasets[0].data = [wearPercent, 100 - wearPercent]; // Update chart data
            batteryChart.update();
        })
        .catch(() => {
            batteryChart.data.datasets[0].data = [30, 70]; // Fallback data
            batteryChart.update();
        });

    // Update disk space chart with used percentage
    fetch('/api/disk-percentage')
        .then(response => response.json())
        .then(data => {
            const usedPercentage = data.percentage || 0;
            diskSpaceChart.data.datasets[0].data = [usedPercentage, 100 - usedPercentage];
            diskSpaceChart.update();
        })
        .catch(() => {
            diskSpaceChart.data.datasets[0].data = [50, 50]; // Fallback data
            diskSpaceChart.update();
        });

    // Update CPU usage chart
    fetch('/api/cpu-percentage')
        .then(response => response.json())
        .then(data => {
            const cpuUsage = data.percentage || 0;
            cpuChart.data.datasets[0].data = [cpuUsage, 100 - cpuUsage];
            cpuChart.update();
        })
        .catch(() => {
            cpuChart.data.datasets[0].data = [50, 50]; // Fallback data
            cpuChart.update();
        });

    // Update RAM usage chart
    fetch('/api/ram-percentage')
        .then(response => response.json())
        .then(data => {
            const ramUsage = data.percentage || 0;
            ramChart.data.datasets[0].data = [ramUsage, 100 - ramUsage];
            ramChart.update();
        })
        .catch(() => {
            ramChart.data.datasets[0].data = [50, 50]; // Fallback data
            ramChart.update();
        });

    // Update lists for largest files
    updateLists();
}

// Modal-related functions
function showModal(type) {
    // Display modal content based on the chart type
    if (type === "battery") {
        modalTitle.textContent = "Battery Wear";
        modalContent.textContent = "This chart shows the battery wear percentage. A lower wear percentage indicates a healthier battery.";
    } else if (type === "diskSpace") {
        modalTitle.textContent = "Disk Space Usage";
        modalContent.textContent = "This chart shows the used and free disk space. Keeping used space below 80% is recommended.";
    } else if (type === "cpu") {
        modalTitle.textContent = "CPU Usage";
        modalContent.textContent = "This chart shows the percentage of CPU being used. A value below 80% is generally optimal.";
    } else if (type === "ram") {
        modalTitle.textContent = "RAM Usage";
        modalContent.textContent = "This chart shows the percentage of RAM being used. High usage may slow down your system.";
    }
    infoModal.style.display = "block"; // Show modal
}

function closeModal() {
    infoModal.style.display = "none"; // Hide modal
}

// Initialize the dashboard and refresh every 5 seconds
updateDashboard(); // Initial load
setInterval(updateDashboard, 5000); // Regular refresh every 5 seconds
