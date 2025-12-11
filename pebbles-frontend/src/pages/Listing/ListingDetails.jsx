// src/pages/Listing/ListingDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import ENDPOINTS from "../../api/endpoints";
import useListingStore from "../../store/listingStore";
import useUserStore from "../../store/userStore";
import "./ListingDetails.css";

const PLACEHOLDER = "/mnt/data/4538814d-7f60-4a40-8de5-0b775c5bdfc4.png";

function Toast({ message, type = "success" }) {
  return <div className={`toast-popup ${type}`}>{message}</div>;
}

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const listings = useListingStore((s) => s.listings);
  const fetchSearch = useListingStore((s) => s.fetchSearch);
const [fullscreenImg, setFullscreenImg] = useState(null);

  // ------------------ ALL HOOKS MUST BE AT TOP ------------------
  const [listing, setListing] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [thumbs, setThumbs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  // REPORT MODAL STATES (only once!)
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
// DELETE MODAL STATE
const [showDeleteModal, setShowDeleteModal] = useState(false);

  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 2000);
  };

  const isOwner = listing?.seller?._id === user?._id;

  // ------------------ LOAD LISTING ------------------
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(ENDPOINTS.LISTINGS.DETAIL(id));
        const data = res.data;

        setListing(data);
        const imgs = data.images?.length ? data.images : [PLACEHOLDER];
        setThumbs(imgs);
        setMainImage(imgs[0]);
      } catch (err) {
        showToast("Failed to load listing", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Load listings for similar
  useEffect(() => {
    if (!listings || listings.length === 0) fetchSearch("");
  }, [fetchSearch, listings]);

  if (loading) return <div className="listing-loading">Loading...</div>;
  if (!listing) return <div className="listing-empty">Listing not found.</div>;

  // ------------------ SIMILAR ------------------
  const similar = (listings || [])
    .filter(
      (l) =>
        l._id !== listing._id &&
        (l.category || "").toLowerCase() ===
          (listing.category || "").toLowerCase()
    )
    .slice(0, 12);

  // ------------------ CONTACT SELLER ------------------
  const contactSeller = async () => {
    try {
      const res = await api.post(ENDPOINTS.CHATS.CREATE, {
        otherUserId: listing.seller._id,
        listingId: listing._id,
      });

      const chatId =
        res.data._id || res.data.chatId || res.data.chat?._id;

      navigate(chatId ? `/chat/${chatId}` : "/chats");
    } catch (err) {
      showToast("Could not open chat", "error");
    }
  };
// Delete without browser confirm
const confirmDelete = async () => {
  try {
    await api.delete(ENDPOINTS.LISTINGS.DELETE(listing._id));

    showToast("Listing deleted", "success");
    setShowDeleteModal(false);

    setTimeout(() => {
      navigate("/profile");
    }, 700);
  } catch (err) {
    showToast("Failed to delete listing", "error");
  }
};


  // ------------------ REPORT SUBMIT ------------------
  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      showToast("Please enter a valid reason", "error");
      return;
    }

    try {
      await api.post("/api/reports", {
        listingId: listing._id,
        reason: reportReason,
      });

      setShowReportModal(false);
      setReportSuccess(true);
      setReportReason("");
    } catch (err) {
      showToast("Failed to submit report", "error");
    }
  };

  // ------------------ DATE FORMATTER ------------------
  const listedWhen = (iso) => {
    try {
      const then = new Date(iso);
      const diff = Date.now() - then.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch {
      return new Date(iso).toLocaleString();
    }
  };

  // ------------------ UI ------------------
  return (
    <div className="listing-page-fluid">

      {/* Toast */}
      {toastMsg && <Toast message={toastMsg} type={toastType} />}

      <div className="listing-top-row">

        {/* LEFT — IMAGES */}
        <div className="left-col">

          <div className="images-wrap">
            <div className="images-left">
              <div className="image-frame">
                <img src={mainImage} className="main-image" onClick={()=> setFullscreenImg(mainImage)}/>
              </div>
            </div>

            <div className="images-right">
              <div className="side-image">
                <img src={thumbs[1] || PLACEHOLDER} onClick={() => setFullscreenImg(thumbs[1] || PLACEHOLDER)}/>
              </div>
              <div className="side-image">
                <img src={thumbs[2] || PLACEHOLDER} onClick={() => setFullscreenImg(thumbs[2] || PLACEHOLDER)}/>
              </div>
            </div>
          </div>

          {/* extra images */}
          <div className="thumbs-row">
            {thumbs.slice(3).map((t, i) => (
              <button key={i} className="thumb-small" onClick={() => setMainImage(t)}>
                <img
  src={t}
/>

              </button>
            ))}
          </div>

          {/* TITLE / PRICE */}
          <div className="under-images">
            <h1 className="product-title">{listing.title}</h1>

            <div className="price-row">
              <div className="price">£{listing.price}</div>
              <div className="listed">Listed {listedWhen(listing.createdAt)}</div>
            </div>

            <div className="actions-row">
              <button
                className="btn-outline"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                Share
              </button>

              <button
                className="btn-report"
                onClick={() => setShowReportModal(true)}
              >
                Report
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — SELLER INFO */}
        <div className="right-col">
          <div className="info-card">

            <div className="seller-block-compact">
              <div className="seller-name-large">{listing.seller?.fullName}</div>
              <div className="seller-email-large">{listing.seller?.email}</div>

              {isOwner ? (
  <>
    <button
      className="contact-only"
      onClick={() => navigate(`/sell?edit=${listing._id}`)}
    >
      Edit Listing
    </button>

    <button
  className="delete-listing-btn"
  onClick={() => setShowDeleteModal(true)}
>
  Delete Listing
</button>

  </>
) : (
  <button className="contact-only" onClick={contactSeller}>
    Contact Seller
  </button>
)}

            </div>

            <div className="right-meta">
              <div className="meta-row">
                <strong>Category</strong>
                <div className="meta-val">{listing.category}</div>
              </div>

              <div className="meta-row">
                <strong>Condition</strong>
                <div className="meta-val">{listing.condition}</div>
              </div>

              <div className="meta-row">
                <strong>Description</strong>
                <div className="meta-val desc-val">{listing.description}</div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* SIMILAR LISTINGS */}
      <div className="similar-wrapper">
        <div className="similar-title">Similar listings</div>

        <div className="similar-grid">
          {similar.map((s) => (
            <div
              key={s._id}
              className="similar-item"
              onClick={() => navigate(`/listing/${s._id}`)}
            >
              <div className="sim-img">
                <img src={s.images?.[0] || PLACEHOLDER} />
              </div>
              <div className="sim-info">
                <div className="sim-title">{s.title}</div>
                <div className="sim-price">£{s.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------- REPORT MODAL ---------------------- */}
      {showReportModal && (
        <div className="report-overlay">
          <div className="report-modal">
            <h2 className="report-title">Report Listing</h2>

            <p className="report-subtext">
              Please let us know why you're reporting this listing.
            </p>

            <textarea
              className="report-textarea"
              placeholder="I'm reporting this listing because..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />

            <div className="report-actions">
              <button className="report-cancel" onClick={() => setShowReportModal(false)}>
                Cancel
              </button>

              <button className="report-submit" onClick={handleSubmitReport}>
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------- SUCCESS POPUP ---------------------- */}
      {reportSuccess && (
        <div className="report-overlay">
          <div className="report-success-box">
            <h2 className="success-title">Thank You!</h2>
            <p className="success-text">
              Your report has been submitted. We’ll review this listing shortly.
            </p>

            <button
              className="success-btn"
              onClick={() => {
                setReportSuccess(false);
                navigate("/search");
              }}
            >
              Go back to browsing
            </button>
          </div>
        </div>
      )}
    {fullscreenImg && (
  <div className="img-fullscreen-overlay" onClick={() => setFullscreenImg(null)}>
    <img
      src={fullscreenImg}
      className="img-fullscreen-content"
      onClick={(e) => e.stopPropagation()} 
    />

    <button
      className="img-fullscreen-close"
      onClick={() => setFullscreenImg(null)}
    >
      ×
    </button>
  </div>
)}
{showDeleteModal && (
  <div className="delete-overlay">
    <div className="delete-modal">
      <h2>Delete Listing?</h2>

      <p>This action cannot be undone. Are you sure?</p>

      <div className="delete-modal-actions">
        <button
          className="delete-cancel"
          onClick={() => setShowDeleteModal(false)}
        >
          Cancel
        </button>

        <button
          className="delete-confirm"
          onClick={confirmDelete}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
