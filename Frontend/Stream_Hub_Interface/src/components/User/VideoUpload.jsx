import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { videoAPI } from "../../utils/api";
import LiveStream from "./LiveStream";
import "./VideoUpload.css";

export default function VideoUpload() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "All",
    isPrivate: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const categories = [
    "All",
    "Music",
    "Gaming",
    "Movies",
    "Tech Reviews",
    "Cooking",
    "Travel",
    "Fitness",
    "Education",
    "Comedy",
    "News",
    "Sports",
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith("video/")) {
        alert("Please select a valid video file");
        return;
      }

      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert("File size must be less than 100MB");
        return;
      }

      setSelectedFile(file);
      setUploadStatus("File selected: " + file.name);
    }
  };

  const handleThumbnailSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file for thumbnail");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please select a video file");
      return;
    }

    if (!formData.title.trim()) {
      alert("Please enter a title for your video");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("Starting upload...");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("video", selectedFile);
      uploadFormData.append("title", formData.title);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("category", formData.category);
      uploadFormData.append("isPrivate", formData.isPrivate);
      uploadFormData.append("userId", user._id);

      // Add thumbnail if selected
      if (thumbnailInputRef.current?.files[0]) {
        uploadFormData.append("thumbnail", thumbnailInputRef.current.files[0]);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      // Use the appropriate endpoint based on whether thumbnail is provided
      const endpoint = thumbnailInputRef.current?.files[0]
        ? "/upload-with-thumbnail"
        : "/upload";
      const response = await videoAPI.uploadVideo(uploadFormData, endpoint);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus("Upload completed successfully!");

      console.log("Upload response:", response);

      // Reset form
      setTimeout(() => {
        setShowUploadForm(false);
        setFormData({
          title: "",
          description: "",
          category: "All",
          isPrivate: false,
        });
        setSelectedFile(null);
        setThumbnailPreview(null);
        setUploadProgress(0);
        setUploadStatus("");
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("Upload failed: " + (error.message || "Unknown error"));
      setIsUploading(false);
    }
  };

  const openUploadForm = () => {
    setShowUploadForm(true);
  };

  const closeUploadForm = () => {
    if (!isUploading) {
      setShowUploadForm(false);
      setFormData({
        title: "",
        description: "",
        category: "All",
        isPrivate: false,
      });
      setSelectedFile(null);
      setThumbnailPreview(null);
      setUploadProgress(0);
      setUploadStatus("");
    }
  };

  return (
    <div className="video-upload-container">
      <div className="upload-buttons">
        {/* Upload Button */}
        <button
          className="upload-btn"
          onClick={openUploadForm}
          disabled={isUploading}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Upload Video
        </button>

        {/* Start Streaming Button */}
        <button
          className="stream-btn"
          onClick={() => setShowLiveStream(true)}
          disabled={isUploading}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 5.14V19.14L19 12.14L8 5.14Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          Start Streaming
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadForm && (
        <div className="upload-modal-overlay" onClick={closeUploadForm}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-modal-header">
              <h2>Upload Video</h2>
              <button
                className="close-btn"
                onClick={closeUploadForm}
                disabled={isUploading}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpload} className="upload-form">
              {/* File Selection */}
              <div className="form-group">
                <label htmlFor="videoFile">Video File *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="videoFile"
                  accept="video/*"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  required
                />
                {selectedFile && (
                  <p className="file-info">
                    Selected: {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Thumbnail Selection */}
              <div className="form-group">
                <label htmlFor="thumbnailFile">Thumbnail (Optional)</label>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  id="thumbnailFile"
                  accept="image/*"
                  onChange={handleThumbnailSelect}
                  disabled={isUploading}
                />
                {thumbnailPreview && (
                  <div className="thumbnail-preview">
                    <img src={thumbnailPreview} alt="Thumbnail preview" />
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter video title"
                  disabled={isUploading}
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter video description"
                  disabled={isUploading}
                  rows="4"
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={isUploading}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Privacy */}
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleInputChange}
                    disabled={isUploading}
                  />
                  <span className="checkmark"></span>
                  Make this video private
                </label>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="progress-text">
                    {uploadProgress}% - {uploadStatus}
                  </p>
                </div>
              )}

              {/* Upload Status */}
              {uploadStatus && !isUploading && (
                <div
                  className={`upload-status ${
                    uploadStatus.includes("failed") ? "error" : "success"
                  }`}
                >
                  {uploadStatus}
                </div>
              )}

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeUploadForm}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={
                    isUploading || !selectedFile || !formData.title.trim()
                  }
                >
                  {isUploading ? "Uploading..." : "Upload Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Stream Modal */}
      {showLiveStream && (
        <div
          className="upload-modal-overlay"
          onClick={() => setShowLiveStream(false)}
        >
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-modal-header">
              <h2>Live Streaming</h2>
              <button
                className="close-btn"
                onClick={() => setShowLiveStream(false)}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <LiveStream />
          </div>
        </div>
      )}
    </div>
  );
}
