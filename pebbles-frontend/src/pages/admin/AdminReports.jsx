import React, { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import ADMIN from "../../api/adminEndpoints";

export default function AdminReports() {
  const [reports, setReports] = useState([]);

  const loadReports = async () => {
    const res = await api.get(ADMIN.REPORTS);
    setReports(res.data);
  };

  const resolve = async (id) => {
    await api.post(ADMIN.RESOLVE_REPORT(id));
    loadReports();
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div>
      <h1 className="admin-title">Reports</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Listing</th>
            <th>Reporter</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((r) => (
            <tr key={r._id}>
              <td>{r.listing?.title}</td>
              <td>{r.reporter?.email}</td>
              <td>{r.reason}</td>
              <td>{r.status}</td>
              <td>
                <button className="btn-green" onClick={() => resolve(r._id)}>
                  Resolve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
