const cpuProgramsList = document.getElementById('cpuProgramsList'); // Reference to the list element where data will be displayed

// Function to update the most CPU-intensive programs list
function updateCpuProgramsList() {
    fetch('/api/cpu-usage') // Send a GET request to the server endpoint to retrieve CPU usage data
        .then(response => response.json()) // Parse the response as JSON data
        .then(data => {
            // Update the list by mapping over the fetched data
            cpuProgramsList.innerHTML = data
                .map(program => 
                    `<li>${program.ProcessName} - ${program.CPUUsage}% CPU</li>` // Format each program's data into an HTML list item
                )
                .join(''); // Combine all list items into a single string for rendering
        })
        .catch(() => {
            // Handle errors if the fetch request fails
            cpuProgramsList.innerHTML = '<li>Error fetching CPU programs data.</li>'; // Display an error message in the list
        });
}

// Periodically update the list of CPU-intensive programs
updateCpuProgramsList(); // Call the function to fetch and display the list on initial page load
setInterval(updateCpuProgramsList, 5000); // Refresh the list every 5 seconds to keep it up-to-date
