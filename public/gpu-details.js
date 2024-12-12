// Reference to the GPU programs list element in the DOM
const gpuProgramsList = document.getElementById('gpuProgramsList'); 

// Reference to the GPU error message element in the DOM
const gpuErrorMessage = document.getElementById('gpuErrorMessage'); 

// Function to fetch and display the top 5 GPU details
function updateGpuProgramsList() {
    // Fetch GPU data from the API endpoint
    fetch('/api/gpu-data')
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            // Check if data exists and contains entries
            if (data && data.length > 0) {
                // Populate the list with the top 5 GPU entries
                gpuProgramsList.innerHTML = data
                    .slice(0, 5) // Limit to the top 5 entries
                    .map(
                        gpu =>
                            `<li>GPU ID: ${gpu.GPU_ID}, Name: ${gpu.Name}, Load: ${gpu.Load_Percent}%, Memory Free: ${gpu.Memory_Free_MB} MB, Memory Used: ${gpu.Memory_Used_MB} MB, Temp: ${gpu.Temperature_C}°C</li>` // Format each entry as a list item
                    )
                    .join(''); // Combine the list items into a single string
                gpuErrorMessage.textContent = ''; // Clear any existing error message
            } else {
                // Display a message if no GPU data is available
                gpuProgramsList.innerHTML = '<li>No GPU data available.</li>';
            }
        })
        .catch(() => {
            // Handle errors during the fetch operation
            gpuProgramsList.innerHTML = '<li>Error fetching GPU data.</li>'; // Display an error message
        });
}

// Periodically update the GPU programs list
updateGpuProgramsList(); // Fetch and display data initially
setInterval(updateGpuProgramsList, 5000); // Refresh the list every 5 seconds
