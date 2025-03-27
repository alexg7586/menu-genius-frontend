import { useRef, useState } from "react";

export default function Home() {
  const fileInputRef = useRef(null);
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const language = "English"; // 固定语言为英文

  const languageTextMap = {
    English: {
      preview: "🖼️ Preview",
      upload: "Choose and Upload Image",
      tryAnother: "🔁 Try Another Image",
      clear: "❌ Clear",
      loading: "Analyzing menu image...",
      uploadError: "Upload failed. Please try again.",
      title: "🍽️ Menu Description"
    }
  };

  const resetState = () => {
    setMenu(null);
    setError("");
    setLoading(false);
    setPreviewUrl(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", "English");

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    setLoading(true);
    setError("");
    setMenu(null);

    try {
      const res = await fetch("https://menu-genius-backend.onrender.com/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMenu(data.menu);
      }
    } catch (err) {
      setError(languageTextMap.English.uploadError);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const handleClear = () => {
    resetState();
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text">
          🍽️ MenuGenius
        </h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base">
          AI-powered Menu Decoder
        </p>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />

      {!menu && !error && (
        <button
          onClick={handleButtonClick}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full shadow hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
          disabled={loading}
        >
          {loading
            ? languageTextMap.English.loading
            : languageTextMap.English.upload}
        </button>
      )}

      {(menu || error) && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleButtonClick}
            className="bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-600 transition"
            disabled={loading}
          >
            {languageTextMap.English.tryAnother}
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-300 text-gray-800 px-5 py-2 rounded-full hover:bg-gray-400 transition"
          >
            {languageTextMap.English.clear}
          </button>
        </div>
      )}

      {previewUrl && !loading && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">
            {languageTextMap.English.preview}
          </h2>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-xs rounded shadow"
          />
        </div>
      )}

      {error && <p className="text-red-500 mt-4">❌ {error}</p>}

      {menu && (
        <div className="mt-6 w-full max-w-xl">
          <h2 className="text-xl font-semibold mb-4">
            {languageTextMap.English.title}
          </h2>
          <div className="space-y-6">
            {menu.map((item, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
