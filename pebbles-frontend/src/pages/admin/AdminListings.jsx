import React, { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import ADMIN from "../../api/adminEndpoints";
import "./adminListings.css";

export default function AdminListings() {
  const [listings, setListings] = useState([]);

  const loadListings = async () => {
    const res = await api.get(ADMIN.LISTINGS);
    setListings(res.data);
  };

  const deleteListing = async (id) => {
    await api.delete(ADMIN.DELETE_LISTING(id));
    loadListings();
  };

  const softDelete = async (id) => {
    await api.put(ADMIN.SOFT_DELETE_LISTING(id));
    loadListings();
  };

  const restore = async (id) => {
    await api.put(ADMIN.RESTORE_LISTING(id));
    loadListings();
  };

  useEffect(() => {
    loadListings();
  }, []);

  return (
    <div>
      <h1 className="admin-title">Listings</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Seller</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {listings.map((l) => (
            <tr key={l._id}>
              <td>{l.title}</td>
              <td>{l.seller?.fullName}</td>
              <td>{l.status || "active"}</td>
              <td className="actions">
                <button className="btn-red" onClick={() => softDelete(l._id)}>Soft Delete</button>
                <button className="btn-green" onClick={() => restore(l._id)}>Restore</button>
                <button className="btn-red" onClick={() => deleteListing(l._id)}>Hard Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
