import React, { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import ADMIN from "../../api/adminEndpoints";
import "./adminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");

  const loadUsers = async () => {
    const res = await api.get(ADMIN.USERS);
    setUsers(res.data);
  };

  const banUser = async (id) => {
    await api.put(ADMIN.BAN_USER(id));
    loadUsers();
  };

  const unbanUser = async (id) => {
    await api.put(ADMIN.UNBAN_USER(id));
    loadUsers();
  };

  const deleteUser = async (id) => {
    await api.delete(ADMIN.DELETE_USER(id));
    loadUsers();
  };

  const filteredUsers = users.filter((u) => {
    if (filter === "admins") return u.role === "admin";
    if (filter === "banned") return u.isBanned;
    if (filter === "normal") return !u.isBanned && u.role !== "admin";
    return true;
  });

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <h1 className="admin-title">Users</h1>

      <div className="tabs">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("admins")}>Admins</button>
        <button onClick={() => setFilter("banned")}>Banned</button>
        <button onClick={() => setFilter("normal")}>Normal</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Banned</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u._id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isBanned ? "Yes" : "No"}</td>

              <td>
                {u.role === "admin" ? (
                  <span className="text-muted">Admin — No actions</span>
                ) : (
                  <>
                    {u.isBanned ? (
                      <button className="btn-green" onClick={() => unbanUser(u._id)}>
                        Unban
                      </button>
                    ) : (
                      <button className="btn-red" onClick={() => banUser(u._id)}>
                        Ban
                      </button>
                    )}

                    <button className="btn-red delete" onClick={() => deleteUser(u._id)}>
                      Delete
                    </button>
                  </>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
