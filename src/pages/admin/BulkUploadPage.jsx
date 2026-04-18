import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import userService from "../../services/user.service";

export default function BulkUploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    const allowed = [".csv", ".xlsx", ".xls"];
    const ext = selected.name.substring(selected.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error("Please upload a .csv or .xlsx file.");
      return;
    }
    setFile(selected);
    setResults(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    setUploading(true);
    try {
      const response = await userService.bulkUpload(file);
      const data = response.data;
      setResults(data);
      if (data.error_count === 0) {
        toast.success(`All ${data.success_count} users created successfully!`);
      } else {
        toast(`${data.success_count} created, ${data.error_count} failed.`);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || "Upload failed.";
      toast.error(detail);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await userService.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bulk_upload_template.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download template.");
    }
  };

  const handleReset = () => {
    setFile(null);
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Bulk User Upload</h1>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <button onClick={handleDownloadTemplate} className="px-4 py-2 bg-gray-100 rounded-lg">Download Template</button>
      </div>
      <div className="border border-dashed p-8 text-center mb-6">
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" id="bulk" />
        <label htmlFor="bulk" className="cursor-pointer">
          {file ? <p>{file.name}</p> : <p>Click to select a CSV or Excel file</p>}
        </label>
      </div>
      <div className="flex gap-3 mb-8">
        <button onClick={handleUpload} disabled={!file || uploading} className="px-6 py-2 bg-amber-600 text-white rounded-lg">
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {file && <button onClick={handleReset} className="px-4 py-2 bg-white border">Clear</button>}
      </div>
      {results && (
        <div>
          <div className="flex gap-4 mb-4">
             <div>✓ {results.success_count} Created</div>
             <div>✗ {results.error_count} Failed</div>
          </div>
          <table className="min-w-full"><tbody className="divide-y">
            {results.results.map((r, i) => (
              <tr key={i}>
                <td>{r.row}</td>
                <td>{r.email}</td>
                <td>{r.status}</td>
                <td>{r.detail}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}
