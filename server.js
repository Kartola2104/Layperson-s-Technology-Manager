import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process'; // Used to execute external scripts

const app = express();
const PORT = 3000;

// Define __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Variables to store database results
let largestDownloads = [];
let largestApps = [];
let largestDocuments = [];
let batteryData = {};
let cpuData = [];
let ramData = [];
let gpuData = []; // Variable to store GPU data
let diskUsagePercentage = 0; // To store disk usage percentage for Local Drive

// Initialize SQLite database connection
const db = new sqlite3.Database("Computer_Manager.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error("Error connecting to SQLite database:", err.message);
    } else {
        console.log("Connected to SQLite database successfully");
        initializeData();
    }
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Fetch data from the database
function initializeData() {
    // Fetch Largest Downloads
    db.all(`SELECT Name, [Size (bytes)] FROM Largest_Downloads`, [], (err, rows) => {
        if (err) {
            console.error("Error fetching Largest Downloads:", err.message);
        } else {
            largestDownloads = rows;
            console.log("Largest Downloads Data:", largestDownloads); // Debugging
        }
    });

    // Fetch Largest Apps
    db.all(`SELECT Name, [Size (bytes)] FROM Largest_Apps`, [], (err, rows) => {
        if (err) {
            console.error("Error fetching Largest Apps:", err.message);
        } else {
            largestApps = rows;
            console.log("Largest Apps Data:", largestApps); // Debugging
        }
    });

    // Fetch CPU Data
    db.all(`SELECT [0] AS ProcessID, [1] AS ProcessName, [2] AS CPUUsage FROM CPU`, [], (err, rows) => {
        if (err) {
            console.error("Error fetching CPU data:", err.message);
        } else {
            cpuData = rows;
            console.log("CPU Data:", cpuData); // Debugging
        }
    });

    // Fetch RAM Data
    db.all(`SELECT [0] AS ProcessID, [1] AS ProcessName, [2] AS RAMUsage FROM RAM`, [], (err, rows) => {
        if (err) {
            console.error("Error fetching RAM data:", err.message);
        } else {
            ramData = rows;
            console.log("RAM Data:", ramData); // Debugging
        }
    });

    // Fetch GPU Data
    db.all(
        `SELECT GPU_ID, Name, Load_Percent, Memory_Free_MB, Memory_Used_MB, Temperature_C FROM GPU`,
        [],
        (err, rows) => {
            if (err) {
                console.error("Error fetching GPU data:", err.message);
            } else {
                gpuData = rows;
                console.log("GPU Data:", gpuData); // Debugging
            }
        }
    );

    // Fetch Disk Usage (Local Drive only)
    db.all(`SELECT Perc FROM Space_Used_By_Perc WHERE Area = 'Local_Drive'`, [], (err, rows) => {
        if (err) {
            console.error("Error fetching Disk Usage:", err.message);
        } else if (rows.length > 0) {
            diskUsagePercentage = rows[0].Perc || 0;
            console.log("Disk Usage Percentage (Local Drive):", diskUsagePercentage);
        }
    });

    // Fetch Largest Documents
    db.all(`SELECT Name, [Size (bytes)] FROM Largest_Documents`, [], (err, rows) => {
        if (err) {
            console.error("Error fetching Largest Documents:", err.message);
        } else {
            largestDocuments = rows;
            console.log("Largest Documents Data:", largestDocuments); // Debugging
        }
    });

    // Fetch Battery Data
    db.all(`SELECT Wear_Percent, Critical_Status FROM Battery`, [], (err, rows) => {
        if (err) {
            console.error("Error fetching Battery Data:", err.message);
        } else {
            batteryData = rows[0] || {};
            console.log("Battery Data:", batteryData); // Debugging
        }
    });
}

// API endpoints
app.get('/api/largest-downloads', (req, res) => {
    res.json({ data: largestDownloads });
});

app.get('/api/largest-apps', (req, res) => {
    res.json({ data: largestApps });
});

app.get('/api/largest-documents', (req, res) => {
    res.json({ data: largestDocuments });
});

app.get('/api/battery', (req, res) => {
    res.json({ data: batteryData });
});

app.get('/api/disk-percentage', (req, res) => {
    res.json({ percentage: diskUsagePercentage });
});

app.get('/api/cpu-percentage', (req, res) => {
    const totalCPUUsage = cpuData.reduce((sum, process) => sum + process.CPUUsage, 0);
    res.json({ percentage: totalCPUUsage });
});

app.get('/api/ram-percentage', (req, res) => {
    const totalRAMUsage = ramData.reduce((sum, process) => sum + process.RAMUsage, 0);
    const totalRAM = 32000; // Total RAM in MB (adjust based on your system)
    res.json({ percentage: (totalRAMUsage / totalRAM) * 100 });
});

// API for Top 5 CPU-Intensive Programs
app.get('/api/cpu-usage', (req, res) => {
    const topCpuPrograms = cpuData
        .sort((a, b) => b.CPUUsage - a.CPUUsage) // Sort by CPU usage descending
        .slice(0, 5); // Get the top 5 programs
    res.json(topCpuPrograms);
});

// API for Top 5 RAM-Intensive Programs
app.get('/api/ram-usage', (req, res) => {
    const topRamPrograms = ramData
        .sort((a, b) => b.RAMUsage - a.RAMUsage) // Sort by RAM usage descending
        .slice(0, 5); // Get the top 5 programs
    res.json(topRamPrograms);
});

// API for GPU Data
app.get('/api/gpu-data', (req, res) => {
    res.json(gpuData); // Send GPU data to the frontend
});

// API to trigger database update
app.post('/api/update-database', (req, res) => {
    exec('python3 "C:\\Users\\kevin\\Desktop\\computer_usage\\nodejs-sqlite\\Python Processes Code-Final\\updateDatabase.py"', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error updating database: ${error.message}`);
            res.status(500).json({ error: 'Failed to update database' });
            return;
        }
        if (stderr) {
            console.error(`Standard error: ${stderr}`);
            res.status(500).json({ error: stderr });
            return;
        }
        console.log(`Database updated: ${stdout}`);
        res.json({ message: 'Database updated successfully', output: stdout });
    });
});

// API to trigger database deletion and then update
app.post('/api/delete-and-update-database', (req, res) => {
    exec('python3 "C:\\Users\\kevin\\Desktop\\computer_usage\\nodejs-sqlite\\Python Processes Code-Final\\updateDatabase.py" delete', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error deleting and updating database: ${error.message}`);
            res.status(500).json({ error: 'Failed to delete and update database' });
            return;
        }
        if (stderr) {
            console.error(`Standard error: ${stderr}`);
            res.status(500).json({ error: stderr });
            return;
        }
        console.log(`Database deleted and updated: ${stdout}`);
        res.json({ message: 'Database deleted and updated successfully', output: stdout });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
