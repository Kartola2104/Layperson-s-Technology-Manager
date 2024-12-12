import os
import pandas as pd
import shutil


#The main loops for extracting largest files were adapted from python's documentation on the os library
class LargestFilesLists():
    
    #Drive Space Info
    def get_driveSpacePerc(self):
        Local_Drive = shutil.disk_usage("C:")
        print(Local_Drive, "\n")

        driveSpace = float(Local_Drive.used/Local_Drive.total) * 100
        
        print(f"You have used: {(driveSpace):.2f}% of your total drive space.")

    #Note: The line of code "os.path.expanduser('~')" is used to get the user's current username so that the right file paths can be loaded.
        #It was found from the following geeksforgeeks article: https://www.geeksforgeeks.org/how-to-get-the-current-username-in-python/ 

        Documents_Drive = float( (os.stat(os.path.expanduser('~') + '/Documents').st_size/Local_Drive.used) * 100)
        print(f"{Documents_Drive:.2f} of your total drive space is used by your documents.\n\n")

        Downloads_Drive = float( (os.stat(os.path.expanduser('~') + '/Downloads').st_size/Local_Drive.used) * 100)
        print(f"{Downloads_Drive:.2f} of your total drive space is used by your downloads.\n\n")

        Apps_Drive = float( (os.stat("C:/Program Files").st_size/Local_Drive.used) * 100)
        print(f"{Apps_Drive:.2f} of your total drive space is used by your apps.\n\n")

        NamesList = ["Local_Drive", "Documents", "Downloads", "Apps"]
        
        PercList = [float(format(driveSpace, '.2f')), float(format(Documents_Drive, '.2f')), float(format(Downloads_Drive, '.2f')), float(format(Apps_Drive, '.2f'))]
        print(PercList)

        return{"Area": NamesList, "Perc": PercList}


    def get_dir_largest_files(self, path='.', isApp=False):    
        file_name = []
        file_size = []
        largest_file = 0
        largest_name = ""
        second_largest = 0
        second_name = ""
        third_largest = 0
        third_name = ""
        fourth_largest = 0
        fourth_name = ""
        fifth_largest = 0
        fifth_name = ""

        with os.scandir(path) as local_drive:
            for entry in local_drive: #entry is a file or app in the given local_drive
                    #If files-list, use is_file. If apps-list, use if_dir.
                    if (entry.is_file(follow_symlinks=False) and not isApp):
                        if (entry.stat().st_size > largest_file):
                            largest_file = entry.stat().st_size
                            largest_name = entry.name

                        elif(entry.stat().st_size > second_largest):
                            second_largest = entry.stat().st_size
                            second_name = entry.name

                        elif(entry.stat().st_size > third_largest):
                            third_largest = entry.stat().st_size
                            third_name = entry.name

                        elif(entry.stat().st_size > fourth_largest):
                            fourth_largest = entry.stat().st_size
                            fourth_name = entry.name

                        elif(entry.stat().st_size > fifth_largest):
                            fifth_largest = entry.stat().st_size
                            fifth_name = entry.name

                    # The "directory size code" aspect was written with the help of other sources I found this "directory size code", 
                    # including Google's AI Gemini and also this stach overflow: 
                    # https://stackoverflow.com/questions/1392413/calculating-a-directorys-size-using-python

                    # Gets (mostly) all the applications on the device. 
                    # Directory names with the name "Windows" are not included becasue it's assumed to be an app that comes with the Windows device.
                    
                    elif(entry.is_dir() and "Windows" not in entry.name and isApp): 
                        total_size = 0
                        for dirpath, dirnames, filenames in os.walk(entry.path):
                            for f in filenames:
                                fp = os.path.join(dirpath, f)
                                # skip if it is symbolic link
                                if not os.path.islink(fp):
                                    total_size += os.path.getsize(fp)
                        if (total_size > largest_file):
                            largest_file = total_size
                            largest_name = entry.name

                        elif(total_size > second_largest):
                            second_largest = total_size
                            second_name = entry.name

                        elif(total_size  > third_largest):
                            third_largest = total_size
                            third_name = entry.name

                        elif(total_size > fourth_largest):
                            fourth_largest = total_size
                            fourth_name = entry.name

                        elif(total_size > fifth_largest):
                            fifth_largest = total_size
                            fifth_name = entry.name
                        

        file_name.append(largest_name)
        file_name.append(second_name)
        file_name.append(third_name)
        file_name.append(fourth_name)
        file_name.append(fifth_name)

        file_size.append(largest_file)
        file_size.append(second_largest)
        file_size.append(third_largest)
        file_size.append(fourth_largest)
        file_size.append(fifth_largest)

        #The list of file names and the list of file sizes is used by pandas DF() below
        return {"Name": file_name, "Size (bytes)": file_size}


    #To update and delete from the database as shown below, you must have a connection string (conn) 
    #and a cursor built off of that connection string (conn) to execute database commands (curr)

    def updateDocFilesListInDatabase(self, conn):
        docs_list_data = pd.DataFrame(self.get_dir_largest_files(os.path.expanduser('~') + '/Documents'))
        print(docs_list_data)
        docs_list_data.to_sql(name='Largest_Documents', con=conn)

    def deleteDocFilesListInDatabase(self, conn, cur):
        cur.execute("DROP TABLE Largest_Documents")
        conn.commit()
    

    def updateDownloadFilesListInDatabase(self, conn):
        downloads_list_data = pd.DataFrame(self.get_dir_largest_files(os.path.expanduser('~') + '/Downloads'))
        print(downloads_list_data)
        downloads_list_data.to_sql(name='Largest_Downloads', con=conn)
    
    def deleteDownloadFilesListInDatabase(self, conn, cur):
        cur.execute("DROP TABLE Largest_Downloads")
        conn.commit()


    def updateAppsListInDatabase(self, conn):
        apps_list_data = pd.DataFrame(self.get_dir_largest_files('C:/Program Files', True))
        print(apps_list_data)

        apps_list_data.to_sql(name='Largest_Apps', con=conn)
    
    def deleteAppsListInDatabase(self, conn, cur):
        cur.execute("DROP TABLE Largest_Apps")
        conn.commit()


    def updateDiskPercInDatabase(self, conn):
        disk_perc = pd.DataFrame(self.get_driveSpacePerc())
        print(disk_perc)

        disk_perc.to_sql(name='Space_Used_By_Perc', con=conn)
    
    def deleteDiskPercInDatabase(self, conn, cur):
        cur.execute("DROP TABLE Space_Used_By_Perc")
        conn.commit() 