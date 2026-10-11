from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# ✅ DATABASE CONNECTION
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="JJhh13;;",
        database="elms"
    )

# ✅ HOME
@app.route('/')
def home():
    return "Backend Running ✅"


# ✅ STUDENT LOGIN
@app.route('/api/login/student', methods=['POST'])
def student_login():
    data = request.get_json(force=True)

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM students WHERE name=%s", (data['name'],))
    student = cursor.fetchone()

    db.close()

    if not student:
        return {"message": "Invalid user"}, 401

    return student


# ✅ STUDENT + MENTOR
@app.route('/api/student/<int:id>')
def student_info(id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT s.id, s.name, m.name AS mentor_name
        FROM students s
        JOIN mentors m ON s.mentor_id = m.id
        WHERE s.id=%s
    """, (id,))

    result = cursor.fetchone()
    db.close()
    return jsonify(result)


# ✅ STUDENT COURSES
@app.route('/api/student/<int:id>/courses')
def student_courses(id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT c.id, c.name, c.lessons, c.active
        FROM courses c
        JOIN student_courses sc ON c.id = sc.course_id
        WHERE sc.student_id = %s AND c.active=1
    """, (id,))

    result = cursor.fetchall()
    db.close()
    return jsonify(result)


# ✅ MENTOR STUDENTS
@app.route('/api/mentor/<int:id>/students')
def mentor_students(id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM students WHERE mentor_id=%s", (id,))
    result = cursor.fetchall()

    db.close()
    return jsonify(result)


# ✅ CREATE COURSE + ASSIGN
@app.route('/api/course', methods=['POST'])
def create_course():
    data = request.get_json(force=True)

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "INSERT INTO courses (name, lessons, active) VALUES (%s,%s,1)",
        (data['name'], data['lessons'])
    )

    course_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO student_courses (student_id, course_id) VALUES (%s,%s)",
        (data['student_id'], course_id)
    )

    db.commit()
    db.close()

    return {"message": "Course Created ✅"}


# ✅ DELETE COURSE
@app.route('/api/course/<int:id>', methods=['DELETE'])
def delete_course(id):
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("DELETE FROM student_courses WHERE course_id=%s", (id,))
    cursor.execute("DELETE FROM courses WHERE id=%s", (id,))

    db.commit()
    db.close()

    return {"message": "Deleted ✅"}


# ✅ ✅ ✅ ✅ ADMIN FEATURES

# ✅ GET ALL STUDENTS WITH MENTORS
@app.route('/api/admin/students')
def admin_students():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT s.id, s.name, s.mentor_id, m.name AS mentor_name
        FROM students s
        LEFT JOIN mentors m ON s.mentor_id = m.id
    """)

    data = cursor.fetchall()
    db.close()

    return jsonify(data)


# ✅ DELETE STUDENT
@app.route('/api/student/<int:id>', methods=['DELETE'])
def delete_student(id):
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("DELETE FROM student_courses WHERE student_id=%s", (id,))
    cursor.execute("DELETE FROM students WHERE id=%s", (id,))

    db.commit()
    db.close()

    return {"message": "Student Deleted ✅"}


# ✅ DELETE MENTOR
@app.route('/api/mentor/<int:id>', methods=['DELETE'])
def delete_mentor(id):
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("UPDATE students SET mentor_id=NULL WHERE mentor_id=%s", (id,))
    cursor.execute("DELETE FROM mentors WHERE id=%s", (id,))

    db.commit()
    db.close()

    return {"message": "Mentor Deleted ✅"}


# ✅ REASSIGN STUDENT
@app.route('/api/reassign', methods=['POST'])
def reassign():
    data = request.get_json()

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "UPDATE students SET mentor_id=%s WHERE id=%s",
        (data['mentor_id'], data['student_id'])
    )

    db.commit()
    db.close()

    return {"message": "Reassigned ✅"}


# ✅ ACTIVATE / DEACTIVATE COURSE
@app.route('/api/course/toggle/<int:id>', methods=['POST'])
def toggle_course(id):
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "UPDATE courses SET active = NOT active WHERE id=%s",
        (id,)
    )

    db.commit()
    db.close()

    return {"message": "Course Status Updated ✅"}


# ✅ START
if __name__ == "__main__":
    app.run(debug=True)