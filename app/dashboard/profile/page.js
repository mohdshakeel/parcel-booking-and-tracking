"use client";

import { useSession } from "next-auth/react";
import { useCallback, useRef, useState,useEffect } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../../components/utils/cropImage";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user || {};

  const router = useRouter();

  // Form state
 

const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const [address, setAddress] = useState("");
const [city, setCity] = useState("");
const [state_region, setStateRegion] = useState("");
const [zipCode, setZipCode] = useState("");
const [country, setCountry] = useState("");

// Sync with session once it loads
useEffect(() => {
  if (!session?.user) return;

  // Update state only if it's still empty
  setName((prev) => prev || session.user.name || "");
  setPhone((prev) => prev || session.user.phone || "");
  setAddress((prev) => prev || session.user.address || "");
  setCity((prev) => prev || session.user.city || "");
  setStateRegion((prev) => prev || session.user.state_region || "");
  setZipCode((prev) => prev || session.user.zipCode || "");
  setCountry((prev) => prev || session.user.country || "");

}, [session]);


console.log("ProfilePage session data:", user);
console.log("STATE VALUES:", { name, phone, address, city, state_region, zipCode, country });


  // Image states
  const [imageFile, setImageFile] = useState(null); // original File
  const [previewUrl, setPreviewUrl] = useState(user?.profileImage || "");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCrop, setShowCrop] = useState(false);

  const inputRef = useRef(null);

  // Drag & Drop handlers
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleFile = async (file) => {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowCrop(true);
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Use helper to get cropped blob, compress, then upload
  const handleUploadCropped = async () => {
    if (!imageFile || !croppedAreaPixels) {
      alert("Please choose and crop an image first.");
      return;
    }

    // get cropped blob
    const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);
    // optionally compress
    const compressed = await imageCompression(croppedBlob, {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    });

    // upload to server
    const fd = new FormData();
    fd.append("file", compressed, "avatar.jpg");

    const res = await fetch("/api/upload-profile-image", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    if (data?.url) {
      setPreviewUrl(data.url);
      setShowCrop(false);
      setImageFile(null);
      // optionally automatically save to DB immediately:
      // await saveProfile({ name, phone, address, image: data.url });
    } else {
      alert("Upload failed");
    }
  };

  const saveProfile = async (userId, payload) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data?.user) {
      // reflect changes locally
      alert("Profile saved");
      // Optionally revalidate server components or refresh page to pick up new session data
      router.refresh();
    } else {
      alert("Failed to save profile");
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const  id  = user.id;
    await saveProfile(user.id,{ id, name, phone, address, city, state_region,country,zipCode, profileImage: previewUrl });

    
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 dark:text-white">My Profile</h1>

      {/* Profile card */}
      <div className="max-w-5xl bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Profile Photo</h2>

        <div
          className="flex items-center gap-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="relative">
            <Image
              height={168}
              width={168}
              src={previewUrl || "/uploads/default-avatar.png"}
              alt="avatar"
              className="w-42 h-42 rounded-full object-cover border cursor-pointer"
              onClick={() => inputRef.current?.click()}
            />
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
            <div className="absolute -bottom-1 -right-1">
              <button
                className="px-2 py-1 bg-indigo-600 text-white rounded"
                onClick={() => inputRef.current?.click()}
                type="button"
              >
              <Edit size={20} />
              </button>
            </div>
          </div>

          <div>
           

            {showCrop && (
              <div className="mt-4">
                <div style={{ position: "relative", width: 400, height: 300 }}>
                  <Cropper
                    image={previewUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                    onClick={handleUploadCropped}
                  >
                    Upload Cropped Image
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={() => {
                      setShowCrop(false);
                      setImageFile(null);
                      setPreviewUrl(user?.image || "");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">{user.name}</h4>
        </div>
      </div>

      {/* Personal Info */}
      <div className="max-w-5xl bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Personal Information</h2>

        <form onSubmit={handleSaveChanges} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputBlock label="Full Name" value={name} onChange={setName} />
          <InputBlock label="Email Address" value={user?.email || ""} disabled />
          <InputBlock label="Phone Number" value={phone} onChange={setPhone} />
          <InputBlock label="Address" value={address} onChange={setAddress} />
          <InputBlock label="City" value={city} onChange={setCity} />
          <InputBlock label="State" value={state_region} onChange={setStateRegion} />
          <InputBlock label="Zip Code" value={zipCode} onChange={setZipCode} />
          <InputBlock label="Country" value={country} onChange={setCountry} />

          <div className="md:col-span-2 text-right mt-4">
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputBlock({ label, value, onChange, type = "text", disabled }) {
  return (
    <div>
      <label className="text-sm text-gray-600 dark:text-gray-300">{label}</label>
      <input
        type={type}
        value={value ?? ""}                 // important: never undefined
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full mt-1 border border-gray-200 rounded-xl p-2 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
      />
    </div>
  );
}
