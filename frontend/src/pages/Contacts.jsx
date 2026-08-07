import { useEffect, useState } from "react";
import axios from "axios";
import { getContacts } from "../services/contacts";

const API_URL = "http://127.0.0.1:8000";

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadContacts = async () => {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handlePreview = async () => {
    if (!file) {
      alert("Please select an XLSX file first.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_URL}/contacts/preview`,
        formData
      );

      setPreview(response.data);
    } catch (error) {
      console.error("Preview failed:", error);
      alert("Failed to preview the file.");
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert("Please select an XLSX file first.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_URL}/contacts/import`,
        formData
      );

      alert(
        `Import completed!\n\n` +
        `Imported: ${response.data.imported}\n` +
        `Skipped: ${response.data.skipped}`
      );

      setFile(null);
      setPreview(null);

      await loadContacts();
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import contacts.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">
        Contacts
      </h1>

      <p className="mb-6 text-gray-500">
        {contacts.length} contacts in your database
      </p>

      {/* Upload Section */}
      <div className="mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Import Contacts
        </h2>

        <p className="mb-4 text-sm text-gray-500">
          Upload an XLSX file containing an <strong>email</strong> column.
        </p>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setPreview(null);
          }}
          className="mb-4 block"
        />

        {file && (
          <p className="mb-4 text-sm">
            Selected file: <strong>{file.name}</strong>
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            disabled={!file || uploading}
            className="rounded-md border px-5 py-2 disabled:opacity-50"
          >
            {uploading ? "Processing..." : "Preview"}
          </button>

          <button
            onClick={handleImport}
            disabled={!file || uploading}
            className="rounded-md bg-black px-5 py-2 text-white disabled:opacity-50"
          >
            {uploading ? "Importing..." : "Import Contacts"}
          </button>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="mb-8 rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Import Preview
          </h2>

          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="rounded-md border p-4">
              <p className="text-sm text-gray-500">
                Total
              </p>
              <p className="text-2xl font-bold">
                {preview.total}
              </p>
            </div>

            <div className="rounded-md border p-4">
              <p className="text-sm text-gray-500">
                Valid
              </p>
              <p className="text-2xl font-bold">
                {preview.valid}
              </p>
            </div>

            <div className="rounded-md border p-4">
              <p className="text-sm text-gray-500">
                Errors
              </p>
              <p className="text-2xl font-bold">
                {preview.errors}
              </p>
            </div>
          </div>

          {preview.preview?.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">
                Emails to be imported
              </h3>

              <div className="max-h-48 overflow-y-auto rounded-md border p-3">
                {preview.preview.map((item, index) => (
                  <p
                    key={index}
                    className="border-b py-2 last:border-b-0"
                  >
                    {item.email}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing Contacts */}
      {loading ? (
        <p>Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-500">
            No contacts imported yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">
                  ID
                </th>

                <th className="p-4 text-left">
                  Email
                </th>
              </tr>
            </thead>

            <tbody>
              {contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {contact.id}
                  </td>

                  <td className="p-4">
                    {contact.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Contacts;