import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [mentor, setMentor] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [progress, setProgress] = useState(
    JSON.parse(localStorage.getItem("progress")) || {},
  );
  const [newCourse, setNewCourse] = useState("");

  // ✅ LESSONS
  const getLessons = (courseId) =>
    Array.from({ length: 5 }, (_, i) => ({
      id: `${courseId}-${i}`,
      name: `Lesson ${i + 1}`,
    }));

  // ✅ MARK COMPLETE
  const markComplete = (lessonId) => {
    const updated = { ...progress, [lessonId]: !progress[lessonId] };
    setProgress(updated);
    localStorage.setItem("progress", JSON.stringify(updated));
  };

  const getPercent = (courseId) => {
    const lessons = getLessons(courseId);
    const done = lessons.filter((l) => progress[l.id]).length;
    return Math.round((done / lessons.length) * 100);
  };

  const color = (p) => (p < 40 ? "red" : p < 70 ? "orange" : "green");

  // ✅ STUDENT LOGIN
  const loginStudent = (name, password) => {
    fetch("http://127.0.0.1:5000/api/login/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        fetch(`http://127.0.0.1:5000/api/student/${data.id}/courses`)
          .then((res) => res.json())
          .then(setCourses);
        fetch(`http://127.0.0.1:5000/api/student/${data.id}`)
          .then((res) => res.json())
          .then((d) => setMentor(d.mentor_name));
      });
  };

  // ✅ MENTOR LOGIN
  const loginMentor = (name) => {
    let id =
      name === "mentor1"
        ? 1
        : name === "mentor2"
          ? 2
          : name === "mentor3"
            ? 3
            : null;

    if (!id) {
      alert("Invalid mentor");
      return;
    }

    setUser({ id, name });

    fetch(`http://127.0.0.1:5000/api/mentor/${id}/students`)
      .then((res) => res.json())
      .then(setStudents);
  };

  // ✅ ADMIN LOGIN
  const loginAdmin = (name) => {
    if (name !== "admin") {
      alert("Invalid admin");
      return;
    }

    setUser({ name });

    fetch("http://127.0.0.1:5000/api/admin/students")
      .then((res) => res.json())
      .then(setStudents);
  };

  // ✅ DASHBOARD UI
  const Dashboard = (list) => (
    <>
      {selectedCourse ? (
        <div className="card">
          <h3>{selectedCourse.name}</h3>

          {getLessons(selectedCourse.id).map((l) => (
            <div className="lesson" key={l.id}>
              {l.name}
              <button onClick={() => markComplete(l.id)}>
                {progress[l.id] ? "✅" : "Mark"}
              </button>
            </div>
          ))}

          <button onClick={() => setSelectedCourse(null)}>⬅ Back</button>
        </div>
      ) : (
        <div className="grid">
          {list.map((c) => {
            if (!c.active && role !== "admin") return null;

            const p = getPercent(c.id);

            return (
              <div
                className="course"
                key={c.id}
                onClick={() => setSelectedCourse(c)}
              >
                <h4>{c.name}</h4>
                <div
                  className="circle"
                  style={{
                    background: `conic-gradient(${color(p)} ${p}%, #ddd 0)`,
                  }}
                />
                {p}%
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  // ✅ HOME PAGE
  if (!role) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="title">Capgemini Learning Portal</h1>

          <button className="role-btn" onClick={() => setRole("student")}>
            🎓 Student
          </button>

          <button className="role-btn" onClick={() => setRole("mentor")}>
            👨‍🏫 Mentor
          </button>

          <button className="role-btn" onClick={() => setRole("admin")}>
            ⚙️ Admin
          </button>
        </div>
      </div>
    );
  }

  // ✅ STUDENT LOGIN
  if (role === "student" && !user) {
    let n, p;

    return (
      <div className="container">
        <div className="card">
          <h3>Student Login</h3>

          <input placeholder="Name" ref={(e) => (n = e)} />
          <input type="password" placeholder="Password" ref={(e) => (p = e)} />

          <button onClick={() => loginStudent(n.value, p.value)}>Login</button>

          <button onClick={() => setRole(null)}>⬅ Back</button>
        </div>
      </div>
    );
  }

  // ✅ STUDENT DASHBOARD
  if (role === "student") {
    return (
      <div className="container">
        <div className="card">
          <h3>{user.name}</h3>
          <h4>Mentor: {mentor}</h4>

          {Dashboard(courses)}

          <button onClick={() => setUser(null)}>⬅ Logout</button>
        </div>
      </div>
    );
  }

  // ✅ MENTOR LOGIN
  if (role === "mentor" && !user) {
    let n;

    return (
      <div className="container">
        <div className="card">
          <h3>Mentor Login</h3>

          <input placeholder="Mentor Name" ref={(e) => (n = e)} />

          <button onClick={() => loginMentor(n.value)}>Login</button>
          <button onClick={() => setRole(null)}>⬅ Back</button>
        </div>
      </div>
    );
  }

  // ✅ MENTOR DASHBOARD
  if (role === "mentor") {
    return (
      <div className="container">
        <div className="card">
          {!selectedStudent ? (
            students.map((s) => (
              <div
                className="list-item"
                key={s.id}
                onClick={() => {
                  setSelectedStudent(s);
                  fetch(`http://127.0.0.1:5000/api/student/${s.id}/courses`)
                    .then((res) => res.json())
                    .then(setCourses);
                }}
              >
                {s.name}
              </div>
            ))
          ) : (
            <div>
              <h3>{selectedStudent.name}</h3>

              <input
                placeholder="Course name"
                onChange={(e) => setNewCourse(e.target.value)}
              />

              <button
                onClick={() => {
                  fetch("http://127.0.0.1:5000/api/course", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: newCourse,
                      student_id: selectedStudent.id,
                    }),
                  });
                }}
              >
                Add Course
              </button>

              {Dashboard(courses)}

              <button onClick={() => setSelectedStudent(null)}>⬅ Back</button>
            </div>
          )}

          <button onClick={() => setUser(null)}>⬅ Logout</button>
        </div>
      </div>
    );
  }

  // ✅ ADMIN LOGIN
  if (role === "admin" && !user) {
    let n;

    return (
      <div className="container">
        <div className="card">
          <h3>Admin Login</h3>

          <input ref={(e) => (n = e)} placeholder="Admin Name" />

          <button onClick={() => loginAdmin(n.value)}>Login</button>
          <button onClick={() => setRole(null)}>⬅ Back</button>
        </div>
      </div>
    );
  }

  // ✅ ADMIN DASHBOARD
  if (role === "admin") {
    const grouped = students.reduce((acc, s) => {
      acc[s.mentor_id] = acc[s.mentor_id] || [];
      acc[s.mentor_id].push(s);
      return acc;
    }, {});

    return (
      <div className="container">
        <div className="card">
          <h3>Admin Panel</h3>

          {!selectedStudent ? (
            Object.keys(grouped).map((m) => (
              <div key={m}>
                <h4>Mentor {m}</h4>

                {grouped[m].map((s) => (
                  <div className="list-item" key={s.id}>
                    {s.name}

                    <button
                      onClick={() => {
                        setSelectedStudent(s);
                        fetch(
                          `http://127.0.0.1:5000/api/student/${s.id}/courses`,
                        )
                          .then((res) => res.json())
                          .then(setCourses);
                      }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div>
              <h3>{selectedStudent.name}</h3>
              {Dashboard(courses)}

              <button onClick={() => setSelectedStudent(null)}>⬅ Back</button>
            </div>
          )}

          <button onClick={() => setUser(null)}>⬅ Logout</button>
        </div>
      </div>
    );
  }

  return null;
}
