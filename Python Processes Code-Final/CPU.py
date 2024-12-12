import psutil
import pandas as pd

# The basic structure for the Top CPU % and RAM % per application functions was adapted from the following stack overflow conversation:
# https://stackoverflow.com/questions/23039466/accessing-cpu-ram-usage-like-with-task-manager-but-via-api 


class CPU():
    def display_system_info(self):
        print("System Information:")
        print("="*30)
    
        # CPU information
        print(f"CPU Usage: {psutil.cpu_percent(interval=1)}%")
        print(f"CPU Cores (Logical): {psutil.cpu_count(logical=True)}")
        print(f"CPU Cores (Physical): {psutil.cpu_count(logical=False)}")
    
        # Memory information
        memory = psutil.virtual_memory()
        print(f"Total Memory: {memory.total / (1024 ** 3):.2f} GB")
        print(f"Available Memory: {memory.available / (1024 ** 3):.2f} GB")
        print(f"Memory Usage: {memory.percent}%")
    
        # Disk usage
        disk = psutil.disk_usage('/')
        print(f"Total Disk Space: {disk.total / (1024 ** 3):.2f} GB")
        print(f"Used Disk Space: {disk.used / (1024 ** 3):.2f} GB")
        print(f"Free Disk Space: {disk.free / (1024 ** 3):.2f} GB")
        print(f"Disk Usage: {disk.percent}%")
    
        # Network information
        net_io = psutil.net_io_counters()
        print(f"Total Bytes Sent: {net_io.bytes_sent / (1024 ** 2):.2f} MB")
        print(f"Total Bytes Received: {net_io.bytes_recv / (1024 ** 2):.2f} MB")
    
        # Top 5 CPU-intensive processes
        print("\nTop 5 CPU-Intensive Processes:")
        processes = []
        for process in psutil.process_iter(['pid', 'name', 'cpu_percent']):
            if('System' not in process.info['name']):
                try:
                    # Call cpu_percent twice to get a recent reading
                    process.cpu_percent(interval=0.1)  # First call to "prime" the data
                    cpu_percent = process.cpu_percent(interval=0.5)  # Second call for actual value

                    if cpu_percent is not None and cpu_percent > 0.0:  # Filter out idle processes
                        processes.append((process.info['pid'], process.info['name'], cpu_percent))
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue  # Skip if process info can't be retrieved

        # Sort and display top 5 CPU-consuming processes
        return sorted(processes, key=lambda x: x[2], reverse=True)[:5]
    
    #To update and delete from the database as shown below, you must have a connection string (conn) 
    #and a cursor built off of that connection string (conn) to execute database commands (curr)

    def updateCPUInBatabase(self, conn):
        cpu_data = pd.DataFrame(self.display_system_info())
        print (cpu_data)
        cpu_data.to_sql(index=False, name='CPU', con=conn)

    def deleteCPUInDatabase(self, conn, cur):
        cur.execute("DROP TABLE CPU")
        conn.commit()

    

if __name__ == "__main__":
    CPU_info = CPU()
    CPU_info.display_system_info()

