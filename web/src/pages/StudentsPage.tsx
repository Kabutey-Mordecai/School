import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../store/auth";

type Student = {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
};

export function StudentsPage() {
  const tokens = useAuthStore((s) => s.tokens);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    if (!tokens) return;

    setLoading(true);
    try {
      const response = await axios.get("/api/v1/students", {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });
      setStudents(response.data.items);
    } catch (error) {
      console.error("Failed to load students", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Students</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "#f8f9fa",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              <th style={{ padding: "10px", textAlign: "left" }}>Code</th>
              <th style={{ padding: "10px", textAlign: "left" }}>First Name</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Last Name</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                style={{ borderBottom: "1px solid #dee2e6" }}
              >
                <td style={{ padding: "10px" }}>{student.studentCode}</td>
                <td style={{ padding: "10px" }}>{student.firstName}</td>
                <td style={{ padding: "10px" }}>{student.lastName}</td>
                <td style={{ padding: "10px" }}>
                  {student.isActive ? "Active" : "Inactive"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
