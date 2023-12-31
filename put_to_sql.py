import os
import pyodbc
import base64
import configparser

# 讀取配置檔
config = configparser.ConfigParser()
config.read('.gitignore/config.ini')

# 資料庫連線設定
server = config.get('Database', 'server')
database = config.get('Database', 'database')
username = config.get('Database', 'username')
password = config.get('Database', 'password')
driver = config.get('Database', 'driver')

# 連接到 SQL Server
connection_string = f'DRIVER={{{driver}}};SERVER={server};DATABASE={database};UID={username};PWD={password};'
cnxn = pyodbc.connect(connection_string)
cursor = cnxn.cursor()

# 資料夾路徑，這裡假設檔案都在腳本同一目錄下的 'images' 資料夾中
folder_path = os.path.join(os.getcwd(), 'images')
print(folder_path)


# 取得資料夾下的所有檔案
file_list = [f for f in os.listdir(folder_path) if f.endswith('.jpg')]

# 將每個檔案讀取並存入資料庫
for file_name in file_list:
    # 檢查是否已存在相同檔名的紀錄，若存在則略過
    cursor.execute("SELECT COUNT(*) FROM photo WHERE name = ?", file_name)
    if cursor.fetchone()[0] > 0:
        print(f"檔案 {file_name} 已存在，略過。")
        continue

    with open(os.path.join(folder_path, file_name), 'rb') as file:
        image_data = file.read()
        cursor.execute("INSERT INTO photo (name, image) VALUES (?, ?)", file_name, image_data)

# 提交變更並關閉連線
cnxn.commit()
cnxn.close()

print("檔案已成功存入 SQL Server 資料庫。")
