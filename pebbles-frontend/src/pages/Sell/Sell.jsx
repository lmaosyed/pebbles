// src/pages/Sell/Sell.jsx
import React, { useEffect, useRef, useState } from "react";
import api from "../../utils/axiosInstance";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Sell.css";

export default function Sell() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit");

  // FORM STATES
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [desc, setDesc] = useState("");

  // IMAGES
  const [existingImages, setExistingImages] = useState([]); // urls from backend
  const [newImages, setNewImages] = useState([]); // File objects to upload
  const [previews, setPreviews] = useState([null, null, null]); // preview urls for 3 slots

  // TOAST
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState("success");

  const inputRefs = useRef([null, null, null]);

  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const CATEGORY_OPTIONS = [
    "Electronics",
    "Furniture",
    "Books",
    "Clothes",
    "Kitchen",
    "Sports",
    "Tickets",
  ];
  const CONDITION_OPTIONS = ["New", "Like New", "Used", "Fair"];

  // LOAD FOR EDIT
  useEffect(() => {
    if (editId) loadListing();
  }, [editId]);

  const loadListing = async () => {
    try {
      const res = await api.get(`/api/listings/${editId}`);
      const l = res.data;

      setTitle(l.title || "");
      setPrice(l.price || "");
      setCategory(l.category || "");
      setCondition(l.condition || "");
      setDesc(l.description || "");

      // existing images as urls
      const imgs = l.images || [];
      setExistingImages(imgs);

      // map first three into previews
      const p = [null, null, null];
      for (let i = 0; i < Math.min(3, imgs.length); i++) p[i] = imgs[i];
      setPreviews(p);
    } catch (err) {
      console.error("Load listing error:", err);
      showToast("Failed to load listing", "error");
    }
  };

  // handle selecting a file for a particular slot index (0..2)
  const handleFileChange = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // store new file in newImages array at index
    const newFiles = [...newImages];
    newFiles[index] = file;
    setNewImages(newFiles);

    // create preview url
    const url = URL.createObjectURL(file);
    const p = [...previews];
    p[index] = url;
    setPreviews(p);

    // if there was an existing image in same slot, remove it from existingImages mapping
    const ex = [...existingImages];
    if (ex[index]) ex[index] = null;
    setExistingImages(ex);
  };

  // remove image from a slot entirely (both existing or new)
  const removeImage = (index) => {
    const ex = [...existingImages];
    const newF = [...newImages];
    const p = [...previews];

    if (newF[index]) newF[index] = undefined;
    if (ex[index]) ex[index] = null;
    p[index] = null;

    setExistingImages(ex);
    setNewImages(newF);
    setPreviews(p);
    // also clear file input value if present
    if (inputRefs.current[index]) inputRefs.current[index].value = "";
  };

  // SUBMIT
 const handleSubmit = async (force = false) => {
  // If user hasn’t acknowledged warning, show popup
  if (!force) {
    setShowWarning(true);
    return;
  }


    // basic validation
    if (!title.trim()) return showToast("Please enter a title", "error");
    if (!price) return showToast("Please enter a price", "error");
    if (!category) return showToast("Please choose a category", "error");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("condition", condition);
    formData.append("description", desc);

    // Append existingImages (only non-null entries)
    existingImages.forEach((url) => {
      if (url) formData.append("existingImages", url);
    });

    // Append new images (file objects)
    newImages.forEach((file) => {
      if (file) formData.append("images", file);
    });

    try {
      let response;
      if (editId) {
        response = await api.patch(`/api/listings/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Saved successfully!", "success");
      } else {
        response = await api.post("/api/listings", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Posted successfully!", "success");
      }

      setTimeout(() => {
        navigate(`/listing/${response.data._id}`);
      }, 1400);
    } catch (err) {
      console.error("Save failed:", err.response || err);
      showToast("Save failed!", "error");
    }
  };
const [showWarning, setShowWarning] = useState(false);
const WarningPopup = () => (
  <div className="warn-overlay">
    <div className="warn-box">

      <div className="warn-title">
        ⚠️ Posting Reminder!
      </div>

      <p className="warn-text">
        Please do not list illegal, restricted, or prohibited items.
      </p>

      <p className="warn-subtext">
        This includes counterfeit goods, controlled substances, stolen property,
        or anything that violates UK law or university policies.
      </p>

      <p className="warn-subtext">
        Inappropriate listings may be removed and could lead to account
        suspension or further action.
      </p>

      <p className="warn-subtext">
        Make sure your listing follows the rules before posting.
      </p>

      <button
        className="warn-btn"
        onClick={() => {
          setShowWarning(false);
          handleSubmit(true); // allow posting
        }}
      >
        I Acknowledge this message
      </button>
    </div>
  </div>
);

  return (
    <div className="sell-page-fluid">
      {toastMsg && (
        <div className={`toast-popup ${toastType}`}>{toastMsg}</div>
      )}
      {showWarning && <WarningPopup />}

      <div className="post-card">
        <div className="post-card-header">
          <h3>Post your Ad.</h3>
        </div>

        <div className="post-grid">
          {/* LEFT: upload area + description */}
          <div className="left-panel">
        
         <div className="upload-row">

  {previews.slice(0, 3).map((img, i) => (
    <div className="upload-slot" key={i}>

      {img ? (
        <>
          <div className="slot-preview">
            <img src={img} alt="" />
          </div>

          <button
            className="slot-remove"
            onClick={() => removeImage(i)}
          >
            ×
          </button>
        </>
      ) : (
        <label
          className="slot-empty"
          onClick={() => inputRefs.current[i].click()}
        >
          <div className="upload-icon">⬆</div>
          <span className="slot-text">Product Image #{i + 1}</span>

          <input
            type="file"
            accept="image/*"
            hidden
            ref={(el) => (inputRefs.current[i] = el)}
            onChange={(e) => handleFileChange(i, e)}
          />
        </label>
      )}
    </div>
  ))}

</div>


            {/* EXTRA IMAGES BELOW THE 3 MAIN SLOTS */}
<div className="extra-images-wrap">

  <label className="extra-upload-btn">
    + Add More Images
    <input
      type="file"
      accept="image/*"
      multiple
      hidden
      onChange={(e) => {
        const files = Array.from(e.target.files);
        const urls = files.map((f) => URL.createObjectURL(f));

        setNewImages([...newImages, ...files]);
        setPreviews([...previews, ...urls]);
      }}
    />
  </label>

  <div className="extra-preview-grid">
    {previews.slice(3).map((img, index) => (
      <div key={index} className="extra-thumb">
        <img src={img} alt="extra" />

        <button
          className="extra-remove"
          onClick={() => {
            let updated = [...previews];
            updated.splice(index + 3, 1);
            setPreviews(updated);
          }}
        >
          ×
        </button>
      </div>
    ))}
  </div>

</div>



            <div className="title-price-row">
              <div className="field">
                <label className="form-label">Title</label>
<input className="sell-input" value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. iPhone 11 - 64GB"
                />
              </div>

              <div className="field">
                <label>Price (£)</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="desc-area">
              <label className="form-label">Description</label>
<textarea className="sell-textarea" value={desc} 
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe your item — e.g., condition, size, brand, and why you're selling."
              />
            </div>
          </div>

          {/* RIGHT: meta fields + actions */}
          <div className="right-panel">
            <div className="meta-row">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="meta-row">
              <label>Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="">Select</option>
                {CONDITION_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: "auto" }} className="action-block">
<button className="post-btn" onClick={() => handleSubmit(false)}>
                {editId ? "Save Changes" : "Post It!"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
