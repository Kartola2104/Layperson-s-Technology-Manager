#The battery information code is largely based on the account name MikeHunter in this stack overflow conversation
#https://stackoverflow.com/questions/16380394/getting-battery-capacity-in-windows-with-python

import wmi
import pandas as pd

c = wmi.WMI()
t = wmi.WMI(moniker = "//./root/wmi")

class Battery():
    status = "" # Is the battery in a dangerous/critical state?
    Design_Capacity = 0 # How much mWh of power was the battery designed to have at full charge
    Current_Cappacity = 0 # How much mWh does the battery have now when it is fully charged?

    batt_general = c.CIM_Battery(Caption = 'Portable Battery')
    battery_count = 0 #If for some odd reason there is more than 1 battery in the computer, only give info. for the 1st one
    for i, b in enumerate(batt_general):
        Design_Capacity = b.DesignCapacity
        print('Battery %d Design Capacity: %d mWh' % (i, b.DesignCapacity or 0))
        if(battery_count > 1):
            break

    batt_current = t.ExecQuery('Select * from BatteryFullChargedCapacity')
    for i, b in enumerate(batt_current):
        Current_Capacity = b.FullChargedCapacity
        print ('Battery %d Fully Charged Capacity: %d mWh' % 
            (i, b.FullChargedCapacity))
        if(battery_count > 1):
            break

    batt_stats = t.ExecQuery('Select * from BatteryStatus where Voltage > 0')
    for i, b in enumerate(batt_stats):
        status = b.Critical
        print('\nBattery %d ***************' % i )
        print('Critical:          ' + str(b.Critical) )
        if(battery_count > 1):
            break

    def getBatteryInfo(self):
        batt_wear_perc = float(self.Current_Capacity / self.Design_Capacity)
        if(batt_wear_perc >= 0.0): # If a new computer has a charge capacity that of which is >= the specified design, we say it is 0.
                                   # typically, a battery will wear overtime as you continue to charge it and the charge capacity
                                   # will eventually not be to the original battery's design.
            batt_wear_perc = 0.0
        return (batt_wear_perc, self.status)
    
    #To update and delete from the database as shown below, you must have a connection string (conn) 
    #and a cursor built off of that connection string (conn) to execute database commands (curr)

    def updateBatteryInDatabase(self, conn): #Creates a pandas DataFrame, and pushes it into the database as a table.
        User_batt = self.getBatteryInfo()
        battery_dict = {'Wear_Percent': User_batt[0], 'Critical_Status': str(User_batt[1])}

        battery_table_data= pd.DataFrame(battery_dict, index=[0])
        battery_table_data.to_sql(index=False, name='Battery', con=conn, dtype={'Wear_Percent': 'FLOAT', 'Critical_Status': 'TEXT'})

        print ("Dataframe:\n", battery_table_data)

    def deleteBatteryDataInDatabase(self, conn, cur): # Deletes the table to recieve fresh database data.
        cur.execute("DROP TABLE Battery")
        conn.commit()

    
batteryData = Battery()
print(batteryData.getBatteryInfo())