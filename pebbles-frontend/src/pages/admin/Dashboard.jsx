import React, { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import ADMIN from "../../api/adminEndpoints";
import "./adminDashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await api.get(ADMIN.STATS);
      setStats(res.data);
    })();
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="admin-title">Dashboard Overview</h1>

      <div className="stats-grid">
        <StatBox title="Users" value={stats.users} />
        <StatBox title="Listings" value={stats.listings} />
        <StatBox title="Active Listings" value={stats.activeListings} />
        <StatBox title="Pending Reports" value={stats.reportsPending} />
      </div>
    </div>
  );
}

function StatBox({ title, value }) {
  return (
    <div className="stat-box">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}
