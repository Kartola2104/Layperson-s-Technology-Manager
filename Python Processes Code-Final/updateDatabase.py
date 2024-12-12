import sqlite3
import pandas as pd
from GPU import GPU


conn = sqlite3.connect("Computer_Manager.db")
#Makes an In-House Database That Exists on Computer Disk in this Programming Folder                                      
cur = conn.cursor()


#All imported classes expect class instances to be made to use their functions 
# (so self is an argument in nearly every class function call used here)

#***Battery Data to Database***
import battery
def update_Battery():
    deviceBatt = battery.Battery()
    deviceBatt.updateBatteryInDatabase(conn)

def delete_Battery():
    deviceBatt = battery.Battery()
    deviceBatt.deleteBatteryDataInDatabase(conn, cur)


#***Largest Downloads/Docs Files List to Database***
import codeFiles

def update_FilesLists():
    deviceLargestFiles = codeFiles.LargestFilesLists()
    deviceLargestFiles.updateDocFilesListInDatabase(conn)
    deviceLargestFiles.updateDownloadFilesListInDatabase(conn)
    deviceLargestFiles.updateAppsListInDatabase(conn)
    deviceLargestFiles.updateDiskPercInDatabase(conn)

def delete_FilesLists():
    deviceLargestFiles = codeFiles.LargestFilesLists()
    deviceLargestFiles.deleteDocFilesListInDatabase(conn, cur)
    deviceLargestFiles.deleteDownloadFilesListInDatabase(conn, cur)
    deviceLargestFiles.deleteAppsListInDatabase(conn, cur)
    deviceLargestFiles.deleteDiskPercInDatabase(conn, cur)


#***CPU Data to Database***
import CPU

def update_CPU():
    deviceCPU = CPU.CPU()
    deviceCPU.updateCPUInBatabase(conn)

def delete_CPU():
    deviceCPU = CPU.CPU()
    deviceCPU.deleteCPUInDatabase(conn, cur)


#***GPU Data to Database***
import GPU

def update_GPU():
    deviceGPU = GPU.GPU()
    deviceGPU.updateGPUInBatabase(conn)

def delete_GPU():
    deviceGPU = GPU.GPU()
    deviceGPU.deleteGPUInDatabase(conn, cur)


#***RAM Data to Database***
import RAM
def update_RAM():
    deviceRAM = RAM.RAM()
    deviceRAM.updateRAMInBatabase(conn)

def delete_RAM():
    deviceCPU_GPU = RAM.RAM()
    deviceCPU_GPU.deleteRAMInDatabase(conn, cur)

#***Pushes Everything to the Database***
update_RAM()
update_Battery()
update_FilesLists()
update_CPU()
update_GPU()

#***Deletes Everything From the Database so That it Can Refresh***
#delete_RAM()
#delete_Battery()
#delete_FilesLists()
#delete_CPU()
#delete_GPU()

cur.close()
conn.close()



