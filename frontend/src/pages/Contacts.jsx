import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Upload, FileSpreadsheet, Trash2, X } from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [previewData, setPreviewData] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const fileInputRef = useRef(null);

  // =====================================================
  // LOAD CONTACTS
  // =====================================================

  const loadContacts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/contacts/`
      );

      setContacts(response.data);
    } catch (error) {
      console.error(
        "Failed to load contacts:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // =====================================================
  // SELECT FILE
  // =====================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      alert("Please select an .xlsx Excel file.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreviewData(null);
  };

  // =====================================================
  // PREVIEW EXCEL
  // =====================================================

  const handlePreview = async () => {
    if (!selectedFile) {
      alert("Please select an Excel file first.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(
        `${API_URL}/contacts/preview`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setPreviewData(response.data);
    } catch (error) {
      console.error(
        "Failed to preview Excel file:",
        error
      );

      const message =
        error.response?.data?.detail ||
        "Failed to preview Excel file.";

      alert(message);
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // IMPORT EXCEL
  // =====================================================

  const handleImport = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(
        `${API_URL}/contacts/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = response.data;

      alert(
        `Import completed!\n\n` +
        `Imported: ${result.imported}\n` +
        `Skipped: ${result.skipped}\n` +
        `Errors: ${
          result.validation_errors?.length || 0
        }`
      );

      setSelectedFile(null);
      setPreviewData(null);
      setShowUpload(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadContacts();

    } catch (error) {
      console.error(
        "Failed to import contacts:",
        error
      );

      const message =
        error.response?.data?.detail ||
        "Failed to import contacts.";

      alert(message);
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // REMOVE CONTACT
  // =====================================================

  const handleDelete = async (contactId, email) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${email}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/contacts/${contactId}`
      );

      await loadContacts();

      alert("Email removed successfully!");

    } catch (error) {
      console.error(
        "Failed to remove contact:",
        error
      );

      const message =
        error.response?.data?.detail ||
        "Failed to remove email.";

      alert(message);
    }
  };

  // =====================================================
  // CLOSE UPLOAD PANEL
  // =====================================================

  const closeUpload = () => {
    if (uploading) {
      return;
    }

    setSelectedFile(null);
    setPreviewData(null);
    setShowUpload(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Contacts
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the email addresses used as campaign
            recipients.
          </p>
        </div>

        {/* IMPORT BUTTON */}

        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          <Upload size={18} />

          Import Excel
        </button>

      </div>


      {/* =================================================
          UPLOAD PANEL
      ================================================= */}

      {showUpload && (

        <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50 p-6">

          <div className="mb-5 flex items-start justify-between">

            <div className="flex items-start gap-3">

              <div className="rounded-lg bg-blue-600 p-2 text-white">
                <FileSpreadsheet size={22} />
              </div>

              <div>

                <h2 className="font-semibold text-slate-900">
                  Import recipient emails
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Upload an Excel file containing an
                  <strong> email </strong>
                  column.
                </p>

              </div>

            </div>

            <button
              onClick={closeUpload}
              disabled={uploading}
              className="rounded-md p-1 text-slate-500 hover:bg-white hover:text-slate-800"
            >
              <X size={20} />
            </button>

          </div>


          {/* FILE SELECT */}

          <div className="rounded-lg border-2 border-dashed border-blue-200 bg-white p-6">

            <div className="text-center">

              <FileSpreadsheet
                size={40}
                className="mx-auto mb-3 text-green-600"
              />

              <p className="font-medium text-slate-800">
                Select your Excel file
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Only .xlsx files are supported
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploading}
                className="mt-4 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Choose Excel File
              </button>

            </div>


            {/* SELECTED FILE */}

            {selectedFile && (

              <div className="mt-5 flex items-center justify-between rounded-lg bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <FileSpreadsheet
                    size={22}
                    className="text-green-600"
                  />

                  <div>

                    <p className="text-sm font-medium text-slate-800">
                      {selectedFile.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {(
                        selectedFile.size /
                        1024
                      ).toFixed(1)}{" "}
                      KB
                    </p>

                  </div>

                </div>

                {!uploading && (

                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewData(null);

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>

                )}

              </div>

            )}


            {/* PREVIEW BUTTON */}

            {selectedFile && !previewData && (

              <div className="mt-5 flex justify-end">

                <button
                  onClick={handlePreview}
                  disabled={uploading}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading
                    ? "Checking..."
                    : "Preview File"}
                </button>

              </div>

            )}

          </div>


          {/* =================================================
              PREVIEW RESULT
          ================================================= */}

          {previewData && (

            <div className="mt-5 rounded-lg border bg-white p-5">

              <h3 className="font-semibold text-slate-900">
                Import Preview
              </h3>

              <div className="mt-4 grid grid-cols-3 gap-4">

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Total
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {previewData.total}
                  </p>
                </div>

                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-xs text-green-700">
                    Valid
                  </p>

                  <p className="mt-1 text-xl font-bold text-green-700">
                    {previewData.valid}
                  </p>
                </div>

                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-xs text-red-700">
                    Errors
                  </p>

                  <p className="mt-1 text-xl font-bold text-red-700">
                    {previewData.errors}
                  </p>
                </div>

              </div>


              {/* PREVIEW EMAILS */}

              {previewData.preview?.length > 0 && (

                <div className="mt-5">

                  <p className="mb-2 text-sm font-medium">
                    Valid email preview
                  </p>

                  <div className="max-h-40 overflow-y-auto rounded-lg border">

                    {previewData.preview.map(
                      (item, index) => (

                        <div
                          key={index}
                          className="border-b px-4 py-2 text-sm last:border-b-0"
                        >
                          {typeof item === "string"
                            ? item
                            : item.email}
                        </div>

                      )
                    )}

                  </div>

                </div>

              )}


              {/* IMPORT BUTTON */}

              <div className="mt-5 flex justify-end">

                <button
                  onClick={handleImport}
                  disabled={
                    uploading ||
                    previewData.valid === 0
                  }
                  className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {uploading
                    ? "Importing..."
                    : "Import Contacts"}
                </button>

              </div>

            </div>

          )}

        </div>

      )}


      {/* =================================================
          CONTACT COUNT
      ================================================= */}

      <div className="mb-4">

        <h2 className="text-lg font-semibold text-slate-900">
          Recipient Emails
        </h2>

        <p className="text-sm text-slate-500">
          {contacts.length}{" "}
          {contacts.length === 1
            ? "contact"
            : "contacts"}{" "}
          in your database
        </p>

      </div>


      {/* =================================================
          CONTACT TABLE
      ================================================= */}

      {loading ? (

        <div className="rounded-xl border p-10 text-center">
          <p className="text-sm text-slate-500">
            Loading contacts...
          </p>
        </div>

      ) : contacts.length === 0 ? (

        <div className="rounded-xl border p-10 text-center">

          <div className="mx-auto mb-4 w-fit rounded-full bg-blue-50 p-4">

            <UsersIcon />

          </div>

          <h3 className="font-semibold text-slate-800">
            No recipient emails yet
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Import an Excel file to add recipient
            emails.
          </p>

          <button
            onClick={() => setShowUpload(true)}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Import Excel
          </button>

        </div>

      ) : (

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr>

                <th className="p-4 text-left text-sm font-semibold text-slate-600">
                  ID
                </th>

                <th className="p-4 text-left text-sm font-semibold text-slate-600">
                  Email
                </th>

                <th className="p-4 text-right text-sm font-semibold text-slate-600">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {contacts.map((contact) => (

                <tr
                  key={contact.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4 text-sm text-slate-500">
                    #{contact.id}
                  </td>

                  <td className="p-4">

                    <span className="font-medium text-slate-800">
                      {contact.email}
                    </span>

                  </td>

                  <td className="p-4 text-right">

                    <button
                      onClick={() =>
                        handleDelete(
                          contact.id,
                          contact.email
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />

                      Remove
                    </button>

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


// Small icon used for the empty state
function UsersIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-blue-600"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}