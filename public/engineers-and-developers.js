// Modal functionality
const modal = document.createElement('div'); // Create a new modal element
modal.className = 'modal'; // Assign a class for styling
modal.style.display = 'none'; // Initially hide the modal
modal.innerHTML = `
    <h3 id="modalTitle"></h3> <!-- Placeholder for modal title -->
    <p id="modalContent"></p> <!-- Placeholder for modal content -->
    <button class="close-button" onclick="closeModal()">Close</button> <!-- Close button -->
`;
document.body.appendChild(modal); // Append the modal to the document body

// Get references to modal content elements
const modalTitle = modal.querySelector('#modalTitle');
const modalContent = modal.querySelector('#modalContent');

// Function to show modal with specific content based on the type
function showModal(type) {
    let title = '';
    let content = '';

    // Determine modal content based on the type of metric
    switch (type) {
        case 'gpu':
            title = 'GPU Usage';
            content = 'This chart shows GPU memory usage. High usage is typical during graphic-intensive tasks. Keep an eye on available memory.';
            break;
        case 'cpu':
            title = 'CPU Usage';
            content = 'This chart shows CPU usage. A CPU consistently above 80% indicates a heavy workload and may slow your system.';
            break;
        case 'ram':
            title = 'RAM Usage';
            content = 'This chart shows RAM usage. Ideally, keep RAM usage below 90% to avoid system slowdowns.';
            break;
        case 'battery':
            title = 'Battery Wear';
            content = 'This chart shows battery wear. A lower percentage indicates better battery health. High wear can reduce battery performance.';
            break;
        case 'diskSpace':
            title = 'Disk Space Usage';
            content = 'This chart shows disk space usage. Keeping at least 20% of your disk space free ensures better performance.';
            break;
        default:
            title = 'Information';
            content = 'No additional information is available.';
            break;
    }

    // Set modal title and content, and display the modal
    modalTitle.textContent = title;
    modalContent.textContent = content;
    modal.style.display = 'block';
}

// Function to close modal
function closeModal() {
    modal.style.display = 'none'; // Hide the modal
}

// Fetch canvas contexts for charts
const gpuCtx = document.getElementById('gpuUsageChart').getContext('2d'); // GPU chart
const cpuCtx = document.getElementById('cpuUsageChart').getContext('2d'); // CPU chart
const ramCtx = document.getElementById('ramUsageChart').getContext('2d'); // RAM chart
const batteryCtx = document.getElementById('batteryChart').getContext('2d'); // Battery chart
const diskSpaceCtx = document.getElementById('diskSpaceChart').getContext('2d'); // Disk space chart

// Fetch list containers for displaying data
const largestAppsList = document.getElementById('largestAppsList');
const largestDocumentsList = document.getElementById('largestDocumentsList');
const largestDownloadsList = document.getElementById('largestDownloadsList');
const gpuErrorMessage = document.getElementById('gpuErrorMessage'); // GPU error message
const gpuNameElement = document.getElementById('gpuName'); // GPU name display

// Helper function to convert bytes into human-readable format
function formatBytes(bytes) {
    if (bytes === 0) return "0 bytes";
    const sizes = ["bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024)); // Determine unit
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i]; // Format output
}

// Function to create a doughnut chart
function createDoughnutChart(ctx, label) {
    return new Chart(ctx, {
        type: 'doughnut', // Doughnut chart type
        data: {
            labels: ['Used', 'Remaining'], // Labels for chart segments
            datasets: [{
                data: [0, 100], // Initial dummy data
                backgroundColor: ['#61dafb', '#2d3f57'], // Segment colors
                borderWidth: 0, // Remove border for cleaner look
            }]
        },
        options: {
            cutout: '70%', // Size of the inner cutout
            plugins: {
                legend: { display: false }, // Hide legend for simplicity
            },
        }
    });
}

// Create charts for each metric
const gpuChart = createDoughnutChart(gpuCtx, 'GPU Usage');
const cpuChart = createDoughnutChart(cpuCtx, 'CPU Usage');
const ramChart = createDoughnutChart(ramCtx, 'RAM Usage');
const batteryChart = createDoughnutChart(batteryCtx, 'Battery Wear');
const diskSpaceChart = createDoughnutChart(diskSpaceCtx, 'Disk Space Usage');

// Function to update the dashboard with dynamic data
function updateDashboard() {
    // GPU Usage
    fetch('/api/gpu-data')
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const gpu = data[0];
                const usedMemory = gpu.Memory_Used_MB || 0;
                const freeMemory = gpu.Memory_Free_MB || 0;
                const totalMemory = usedMemory + freeMemory;
                const usedPercentage = ((usedMemory / totalMemory) * 100).toFixed(2);
                const freePercentage = ((freeMemory / totalMemory) * 100).toFixed(2);
                gpuChart.data.datasets[0].data = [usedPercentage, freePercentage];
                gpuChart.update(); // Refresh GPU chart
                gpuNameElement.textContent = `GPU Name: ${gpu.Name}`; // Display GPU name
                gpuErrorMessage.textContent = ''; // Clear error message
            } else {
                gpuErrorMessage.textContent = 'No GPU data available.'; // Display error message
            }
        })
        .catch(() => {
            gpuErrorMessage.textContent = 'Error fetching GPU data.'; // Error fallback
        });

    // CPU Usage
    fetch('/api/cpu-percentage')
        .then(response => response.json())
        .then(data => {
            const cpuUsage = data.percentage || 0;
            cpuChart.data.datasets[0].data = [cpuUsage, 100 - cpuUsage];
            cpuChart.update(); // Refresh CPU chart
        });

    // RAM Usage
    fetch('/api/ram-percentage')
        .then(response => response.json())
        .then(data => {
            const ramUsage = data.percentage || 0;
            ramChart.data.datasets[0].data = [ramUsage, 100 - ramUsage];
            ramChart.update(); // Refresh RAM chart
        });

    // Battery Wear
    fetch('/api/battery')
        .then(response => response.json())
        .then(data => {
            const wearPercent = data.data?.Wear_Percent || 0;
            batteryChart.data.datasets[0].data = [wearPercent, 100 - wearPercent];
            batteryChart.update(); // Refresh Battery chart
        });

    // Disk Space Usage
    fetch('/api/disk-percentage')
        .then(response => response.json())
        .then(data => {
            const usedPercentage = data.percentage || 0;
            diskSpaceChart.data.datasets[0].data = [usedPercentage, 100 - usedPercentage];
            diskSpaceChart.update(); // Refresh Disk Space chart
        });

    // Update Top 5 Lists
    function updateList(apiEndpoint, elementId) {
        fetch(apiEndpoint)
            .then(response => response.json())
            .then(data => {
                const list = document.getElementById(elementId);
                list.innerHTML = data.data
                    .map(item => `<li>${item.Name} - ${formatBytes(item['Size (bytes)'])}</li>`)
                    .join(''); // Populate the list dynamically
            });
    }

    updateList('/api/largest-apps', 'largestAppsList'); // Update applications list
    updateList('/api/largest-documents', 'largestDocumentsList'); // Update documents list
    updateList('/api/largest-downloads', 'largestDownloadsList'); // Update downloads list
}

// Initialize the dashboard and refresh data every 5 seconds
updateDashboard(); // Initial dashboard update
setInterval(updateDashboard, 5000); // Regular updates every 5 seconds
