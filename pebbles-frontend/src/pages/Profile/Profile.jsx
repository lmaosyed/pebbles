import React, { useEffect } from "react";
import useUserStore from "../../store/userStore";
import useListingStore from "../../store/listingStore";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import defaultPfp from "../../assets/defaultpfp.png";

export default function Profile() {
  const { user, loadUser, logout } = useUserStore();
  const { listings, fetchMyListings } = useListingStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    fetchMyListings();
  }, []);

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-page">

      {/* ----------- TOP HORIZONTAL SECTION ----------- */}
      <div className="profile-header-horizontal">

        {/* LEFT: Profile Picture */}
        <img src={defaultPfp} className="profile-avatar" />


        {/* RIGHT: User info */}
        <div className="profile-info-right">
          <h2>{user.fullName}</h2>
          <p className="profile-email">{user.email}</p>
          <p className="profile-phone">{user.phone || "No phone number added"}</p>

          <button className="logout-btn-large" onClick={logout}>
            Logout
          </button>
          <button
    className="edit-profile-btn"
    onClick={() => navigate("/settings")}
  >
    Edit
  </button>
        </div>
      </div>


      {/* ----------- LISTINGS SECTION ----------- */}
      <h3 className="section-title">My Listings</h3>

      <div className="listing-list">
        {listings.length === 0 && (
          <p className="empty">You haven't posted anything yet.</p>
        )}

        {listings.map((item) => (
          <div
            className="listing-card"
            key={item._id}
            onClick={() => navigate(`/listing/${item._id}`)}
          >
            <img src={item.images?.[0]} className="listing-img" />
            <div className="listing-details">
              <h4>{item.title}</h4>
              <p>£{item.price}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
