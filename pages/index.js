import { useRef, useState } from "react";

// Text labels for UI components
const languageText = {
  preview: "🖼️ Preview",
  upload: "Choose and Upload Image",
  tryAnother: "🔁 Try Another Image",
  clear: "❌ Clear",
  loading: "Analyzing menu image...",
  uploadError: "Upload failed. Please try again.",
  title: "🍽️ Menu Description"
};

// Single dish card component
const MenuCard = ({ item }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
  </div>
);

export default function Home() {
  const fileInputRef = useRef(null);

  // App state: menu result, error message, loading flag, image preview
  const [state, setState] = useState({
    menu: null,
    error: "",
    loading: false,
    previewUrl: null,
  });

  // Reset app state
  const resetState = () => {
    setState({ menu: null, error: "", loading: false, previewUrl: null });
  };

  // Handle user selecting an image
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", "English");

    // Generate preview from selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setState(prev => ({ ...prev, previewUrl: reader.result }));
    };
    reader.readAsDataURL(file);

    setState(prev => ({ ...prev, loading: true, error: "", menu: null }));

    // Send request to backend API
    try {
      const res = await fetch("https://menu-genius-backend.onrender.com/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      // Error or success handling
      if (data.error) {
        setState(prev => ({ ...prev, error: data.error }));
      } else if (!data.menu || !Array.isArray(data.menu)) {
        setState(prev => ({ ...prev, error: "Invalid response format" }));
      } else {
        setState(prev => ({ ...prev, menu: data.menu }));
      }
    } catch (err) {
      setState(prev => ({ ...prev, error: languageText.uploadError }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Trigger file input
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  // Clear all content
  const handleClear = () => {
    resetState();
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const { menu, error, loading, previewUrl } = state;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      {/* Title section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text">
          🍽️ MenuGenius
        </h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base">
          AI-powered Menu Decoder
        </p>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />

      {/* Upload button */}
      {!menu && !error && (
        <button
          onClick={handleButtonClick}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full shadow hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? languageText.loading : languageText.upload}
        </button>
      )}

      {/* Action buttons (Try Another / Clear) */}
      {(menu || error) && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleButtonClick}
            className="bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-600 transition"
            disabled={loading}
          >
            {languageText.tryAnother}
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-300 text-gray-800 px-5 py-2 rounded-full hover:bg-gray-400 transition"
          >
            {languageText.clear}
          </button>
        </div>
      )}

      {/* Preview section */}
      {previewUrl && !loading && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">{languageText.preview}</h2>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-xs rounded shadow"
          />
        </div>
      )}

      {/* Error display */}
      {error && <p className="text-red-500 mt-4">❌ {error}</p>}

      {/* Menu result cards */}
      {menu && (
        <div className="mt-6 w-full max-w-xl">
          <h2 className="text-xl font-semibold mb-4">{languageText.title}</h2>
          <div className="space-y-6">
            {menu.map((item, index) => (
              <MenuCard key={index} item={item} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}