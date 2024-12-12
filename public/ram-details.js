// Reference to the RAM programs list element in the DOM
const ramProgramsList = document.getElementById('ramProgramsList'); 

// Function to update the most RAM-intensive programs list
function updateRamProgramsList() {
    // Fetch data from the RAM usage API endpoint
    fetch('/api/ram-usage')
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {
            // Populate the list element with the fetched data
            ramProgramsList.innerHTML = data
                .map(
                    program => 
                        `<li>${program.ProcessName} - ${program.RAMUsage.toFixed(2)} MB</li>` // Format each program's details
                )
                .join(''); // Combine all list items into a single HTML string
        })
        .catch(() => {
            // Handle errors during the fetch operation
            ramProgramsList.innerHTML = '<li>Error fetching RAM programs data.</li>'; // Display an error message
        });
}

// Initial fetch to populate the list
updateRamProgramsList(); 

// Set an interval to refresh the list every 5 seconds
setInterval(updateRamProgramsList, 5000); 
