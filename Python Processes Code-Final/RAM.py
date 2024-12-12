import psutil
import pandas as pd

# The basic structure for the Top CPU % and RAM % per application functions was adapted from the following stack overflow conversation:
# https://stackoverflow.com/questions/23039466/accessing-cpu-ram-usage-like-with-task-manager-but-via-api 
 
class RAM():
    def display_system_info(self):
        # Top 5 RAM-intensive processes

        print("\nTop 5 RAM-Intensive Processes:")

        processes = []

        for process in psutil.process_iter(['pid', 'name', 'memory_info']):

            try:

                # Get memory usage information

                memory_info = process.info['memory_info']

                if memory_info:

                    processes.append((process.info['pid'], process.info['name'], memory_info.rss / (1024 ** 2)))  # Convert bytes to MB

            except (psutil.NoSuchProcess, psutil.AccessDenied):

                continue  # Skip if process info can't be retrieved

        # Sort and display top 5 memory-consuming processes

        top_memory_processes = sorted(processes, key=lambda x: x[2], reverse=True)[:5]

        return (top_memory_processes) #headers=["PID", "Process", "RAM Usage (MB)"], tablefmt="pretty", floatfmt=".2f"))

    def updateRAMInBatabase(self, conn):
        cpu_data = pd.DataFrame(self.display_system_info())
        print (cpu_data)
        cpu_data.to_sql(index=False, name='RAM', con=conn)

    def deleteRAMInDatabase(self, conn, cur):
        cur.execute("DROP TABLE RAM")
        conn.commit()


if __name__ == "__main__":
    RAM_info = RAM()
    RAM_info.display_system_info()
