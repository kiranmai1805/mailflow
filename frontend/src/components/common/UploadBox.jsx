import { useState } from "react";
import { previewContacts, importContacts } from "../../services/contacts";

export default function UploadBox({ onImported }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const handlePreview = async () => {
    if (!file) {
      alert("Please select an Excel file.");
      return;
    }

    try {
      setLoading(true);

      const data = await previewContacts(file);
      setPreview(data.preview || []);
    } catch (error) {
      console.error(error);
      alert("Failed to preview contacts.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setImporting(true);

      const data = await importContacts(file);

      alert(
        `Import completed! ${data.imported ?? data.total ?? 0} contacts imported.`
      );

      setPreview([]);
      setFile(null);

      if (onImported) {
        onImported();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to import contacts.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold">Import Contacts</h2>
        <p className="text-sm text-gray-500">
          Upload an Excel file containing email addresses.
        </p>
      </div>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => {
          setFile(e.target.files[0]);
          setPreview([]);
        }}
        className="block w-full text-sm"
      />

      <div className="flex gap-3">
        <button
          onClick={handlePreview}
          disabled={!file || loading}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Preview"}
        </button>

        {preview.length > 0 && (
          <button
            onClick={handleImport}
            disabled={importing}
            className="rounded-lg bg-green-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {importing ? "Importing..." : "Import Contacts"}
          </button>
        )}
      </div>

      {preview.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold">
            Preview ({preview.length})
          </h3>

          <div className="max-h-60 overflow-auto rounded-lg border">
            {preview.map((contact, index) => (
              <div
                key={index}
                className="border-b px-4 py-3 last:border-b-0"
              >
                {contact.email}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}