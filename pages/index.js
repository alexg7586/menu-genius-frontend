import { useRef, useState } from "react";

export default function Home() {
  const fileInputRef = useRef(null);
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [language, setLanguage] = useState("English");

  const languageOptions = [
    { label: "English", value: "English" },
    { label: "简体中文", value: "Simplified Chinese" },
  ];

  
const languageTextMap = {
  English: {
    preview: "🖼️ Preview",
    upload: "Choose and Upload Image",
    tryAnother: "🔁 Try Another Image",
    clear: "❌ Clear",
    loading: "Analyzing menu image...",
    uploadError: "Upload failed. Please try again.",
    title: "🍽️ Menu Description"
  },
  "Simplified Chinese": {
    preview: "🖼️ 图片预览",
    upload: "选择并上传图片",
    tryAnother: "🔁 重新上传",
    clear: "❌ 清空",
    loading: "正在分析菜单图片...",
    uploadError: "上传失败，请重试。",
    title: "🍽️ 菜单介绍"
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
    formData.append("language", language);

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
      setError(languageTextMap[language]?.uploadError || "Upload failed. Please try again.");
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
    

      <select
        className="mb-6 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {languageOptions.map((lang) => (
          <option key={lang.value} value={lang.value}>{lang.label}</option>
        ))}
      </select>

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
            ? languageTextMap[language]?.loading
            : languageTextMap[language]?.upload || "Choose and Upload Image"}
        </button>
      )}

      {(menu || error) && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleButtonClick}
            className="bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-600 transition"
            disabled={loading}
          >
            {languageTextMap[language]?.tryAnother || "🔁 Try Another Image"}
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-300 text-gray-800 px-5 py-2 rounded-full hover:bg-gray-400 transition"
          >
            {languageTextMap[language]?.clear || "❌ Clear"}
          </button>
        </div>
      )}
      
      {previewUrl && !loading && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">
            {languageTextMap[language]?.preview}
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
          <h2 className="text-xl font-semibold mb-4">{languageTextMap[language]?.title || "🍽️ Menu Description"}</h2>
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