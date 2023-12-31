# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
import base64
import configparser
import os

app = Flask(__name__)

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
app.config['SQLALCHEMY_DATABASE_URI'] = f'mssql+pyodbc://{username}:{password}@{server}/{database}?driver={driver}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # 不追蹤對象的修改

db = SQLAlchemy(app)

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))  # 對應資料庫中的 Name 欄位
    image = db.Column(db.LargeBinary)  # 對應資料庫中的 Image 欄位
    description = db.Column(db.Text)  # 對應資料庫中的 Description 欄位

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/photos')
def get_photos():
    photos = Photo.query.all()
    photos_list = [{'ID': photo.id, 'name': photo.name, 'image': get_base64_image(photo.image)} for photo in photos]
    return jsonify(photos_list)

def get_base64_image(image_data):
    return base64.b64encode(image_data).decode('utf-8') if image_data else None

@app.route('/api/delete_photo', methods=['DELETE'])
def delete_photo():
    try:
        photo_id = request.form.get('photo_id')
        photo = Photo.query.get(photo_id)

        if photo:
            db.session.delete(photo)
            db.session.commit()

            # 返回成功的 JSON 響應
            return jsonify({'success': True, 'message': '圖片刪除成功'})
        else:
            return jsonify({'success': False, 'message': '找不到該圖片'})
    except Exception as e:
        # 返回錯誤的 JSON 響應
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/upload_photo', methods=['POST'])
def upload_photo():
    file = request.files['file']
    name = request.form['name']
    description = request.form['description']

    if file:
        # 讀取檔案內容
        file_content = file.read()

        # 將檔案資訊存入資料庫
        new_photo = Photo(name=name, description=description, image=file_content)
        db.session.add(new_photo)
        db.session.commit()

        return jsonify({'success': True, 'message': '上傳成功'})
    else:
        return jsonify({'success': False, 'message': '請選擇檔案'})

if __name__ == '__main__':
    app.run(debug=True)
