import React, { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import ADMIN from "../../api/adminEndpoints";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await api.get(ADMIN.LOGS);
      setLogs(res.data);
    })();
  }, []);

  return (
    <div>
      <h1 className="admin-title">Admin Logs</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Admin</th>
            <th>Action</th>
            <th>Details</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{log.admin?.email}</td>
              <td>{log.action}</td>
              <td>{log.details}</td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
