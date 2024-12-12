import psutil
import GPUtil
import pandas as pd
import sqlite3 

class GPU:
    def display_system_info(self):
        """
        Display system information, including network stats and GPU details.
        """
        print("System Information:")
        print("=" * 30)

        # Network information
        net_io = psutil.net_io_counters()
        print(f"Total Bytes Sent: {net_io.bytes_sent / (1024 ** 2):.2f} MB")
        print(f"Total Bytes Received: {net_io.bytes_recv / (1024 ** 2):.2f} MB")

        # GPU information (using GPUtil)
        print("\nGPU Information:")
        gpus = GPUtil.getGPUs()
        if gpus:
            for gpu in gpus:
                print(f"GPU ID: {gpu.id}")
                print(f"GPU Name: {gpu.name}")
                print(f"GPU Load: {gpu.load * 100:.2f}%")
                print(f"GPU Memory Free: {gpu.memoryFree}MB")
                print(f"GPU Memory Used: {gpu.memoryUsed}MB")
                print(f"GPU Temperature: {gpu.temperature}°C")
                print("=" * 30)
        else:
            print("No GPU found.")

    def updateGPUInBatabase(self, conn):
        """
        Update GPU information into the database.
        """
        gpus = GPUtil.getGPUs()
        gpu_info = []

        # Gather GPU information for all available GPUs
        if gpus:
            for gpu in gpus:
                gpu_info.append({
                    "GPU_ID": gpu.id,
                    "Name": gpu.name,
                    "Load_Percent": gpu.load * 100,
                    "Memory_Free_MB": gpu.memoryFree,
                    "Memory_Used_MB": gpu.memoryUsed,
                    "Temperature_C": gpu.temperature
                })

        # If GPU data is available, update it in the database
        if gpu_info:
            gpu_df = pd.DataFrame(gpu_info)
            gpu_df.to_sql("GPU", con=conn, if_exists="replace", index=False)
            print("GPU information updated in the database.")
        else:
            print("No GPU data available to update in the database.")

    def deleteGPUInDatabase(self, conn, cur):
        """
        Delete the GPU table from the database.
        """
        try:
            cur.execute("DROP TABLE IF EXISTS GPU")
            conn.commit()
            print("GPU table deleted from the database.")
        except Exception as e:
            print(f"Error deleting GPU table: {e}")


# Main block to test GPU functionality
if __name__ == "__main__":
    # Test GPU functionality
    GPU_Info = GPU()
    GPU_Info.display_system_info()

    # Test database functionality (requires a valid SQLite connection)
    try:
        conn = sqlite3.connect("Computer_Manager.db")
        cur = conn.cursor()
        GPU_Info.updateGPUInBatabase(conn)
        conn.close()
    except Exception as e:
        print(f"Error interacting with the database: {e}")
