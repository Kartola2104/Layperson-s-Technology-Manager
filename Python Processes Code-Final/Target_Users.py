import pandas as pd
import sqlite3

def Target_User_Setter():
    conn = sqlite3.connect("User_Type.db")
    #Makes an In-House Database That Exists on Computer Disk in this Programming Folder                                      

    target_dict = {"Target": [0, 0]}

    isTargetSet = pd.DataFrame(target_dict)
    isTargetSet.to_sql(name="Target_User", con=conn)
    print(target_dict)

def check_Target():
    conn = sqlite3.connect("User_Type.db")
    #Makes an In-House Database That Exists on Computer Disk in this Programming Folder                                      
    cur = conn.cursor()
    x = cur.execute("SELECT * FROM Target_User").fetchone()[1]
    conn.commit()
    print("This is the value:", x)
    return x

def change_Target(x):
    conn = sqlite3.connect("User_Type.db")
    #Makes an In-House Database That Exists on Computer Disk in this Programming Folder                                      
    cur = conn.cursor()
    cur.execute(f"UPDATE Target_User SET Target={int(x)}")
    conn.commit()

#print(Target_User_Setter(), "\n") #Only create This Once
print(check_Target(), "\n")
print(change_Target(1)) #Change target value to UserType button 1, 2, or 3