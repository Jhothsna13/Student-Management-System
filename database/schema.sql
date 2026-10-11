CREATE DATABASE elms;
USE elms;

-- USERS TABLE
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    password VARCHAR(50),
    role VARCHAR(20)
);

-- MENTORS
CREATE TABLE mentors (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

-- STUDENTS
CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    mentor_id INT,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id)
);

-- COURSES
CREATE TABLE courses (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    lessons INT,
    active BOOLEAN DEFAULT TRUE
);

-- STUDENT-COURSE MAPPING
CREATE TABLE student_courses (
    student_id INT,
    course_id INT,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
