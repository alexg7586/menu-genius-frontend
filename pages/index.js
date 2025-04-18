import { useRef, useState } from "react";
import { FaMoon, FaSun, FaUpload, FaRedo, FaTrash } from "react-icons/fa"; // Import icons

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
const MenuCard = ({ item }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {item.name || "Unnamed Dish"}
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed">
        {item.description || "No description available."}
      </p>
      {item.price && (
        <p className="text-sm text-gray-800 font-semibold mt-2">
          Price: {item.price}
        </p>
      )}
    </div>
  );
};

export default function Home() {
  const fileInputRef = useRef(null);

  // App state: menu result, error message, loading flag, image preview, dark mode, pagination
  const [state, setState] = useState({
    menu: null,
    error: "",
    loading: false,
    previewUrl: null,
    progress: 0,
    darkMode: false,
    currentPage: 1,
    itemsPerPage: 6, // Number of items per page desired number of cards per page
  });

  // Reset app state
  const resetState = () => {
    setState({ menu: null, error: "", loading: false, previewUrl: null, progress: 0, darkMode: state.darkMode, currentPage: 1 });
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
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

    setState(prev => ({ ...prev, loading: true, error: "", menu: null, progress: 0 }));

    // Simulate progress
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.progress >= 100) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, progress: prev.progress + 10 };
      });
    }, 200);

    // Send request to backend API
    try {
      const res = await fetch("https://menu-genius-backend.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      // Check if response is valid JSON
      let data;
      try {
        data = await res.json();
      } catch (err) {
        setState(prev => ({ ...prev, error: "Invalid response from server" }));
        return;
      }

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

  // Handle page change
  const handlePageChange = (direction) => {
    setState((prev) => {
      const totalPages = Math.ceil((prev.menu?.length || 0) / prev.itemsPerPage);
      let newPage = prev.currentPage + direction;
      if (newPage < 1) newPage = 1;
      if (newPage > totalPages) newPage = totalPages;
      return { ...prev, currentPage: newPage };
    });
  };

  const { menu, error, loading, previewUrl, progress, darkMode, currentPage, itemsPerPage } = state;

  // Calculate paginated menu items
  const paginatedMenu = menu
    ? menu.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : [];

  return (
    <main className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} min-h-screen flex flex-col items-center justify-center p-4`}>
      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 rounded-full shadow hover:shadow-lg transition"
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      {/* Title section */}
      <div className="text-center mb-8">
        <img src="/2025-02-13_20.45.46.webp" alt="Logo" className="w-106 h-72 mx-auto mb-4 rounded-lg" />
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
        <>
          <button
            onClick={handleButtonClick}
            className="flex items-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full shadow hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loader border-t-transparent border-white"></div>
                <span className="ml-2">{languageText.loading}</span>
              </>
            ) : (
              <>
                <FaUpload className="mr-2" />
                {languageText.upload}
              </>
            )}
          </button>

          {/* Progress bar */}
          {loading && (
            <div className="w-full max-w-md mt-4">
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-full bg-blue-500 rounded"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Action buttons (Try Another / Clear) */}
      {(menu || error) && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleButtonClick}
            className="flex items-center bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-600 transition"
            disabled={loading}
          >
            <FaRedo className="mr-2" />
            {languageText.tryAnother}
          </button>
          <button
            onClick={handleClear}
            className="flex items-center bg-gray-300 text-gray-800 px-5 py-2 rounded-full hover:bg-gray-400 transition"
          >
            <FaTrash className="mr-2" />
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
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <span className="block sm:inline">❌ {error}</span>
          <button
            onClick={() => setState(prev => ({ ...prev, error: "" }))}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-red-500 hover:text-red-800">&times;</span>
          </button>
        </div>
      )}

      {/* Menu result cards */}
      {menu && (
        <div className="mt-6 w-full max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {paginatedMenu.map((item, index) => (
              <MenuCard key={index} item={item} />
            ))}
          </div>

          {/* Pagination controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(-1)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {Math.ceil(menu.length / itemsPerPage)}
            </span>
            <button
              onClick={() => handlePageChange(1)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition disabled:opacity-50"
              disabled={currentPage === Math.ceil(menu.length / itemsPerPage)}
            >
              Next
            </button>
          </div>

          {/* Items per page dropdown */}
          <div className="mt-4">
            <label htmlFor="itemsPerPage" className="mr-2">Cards per page:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => setState(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value, 10) }))}
              className="border rounded px-2 py-1"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={6}>6</option>
              <option value={8}>8</option>
            </select>
          </div>
        </div>
      )}

      {/* Add CSS for the spinner */}
      <style jsx>{`
        .loader {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 4px solid #fff;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}