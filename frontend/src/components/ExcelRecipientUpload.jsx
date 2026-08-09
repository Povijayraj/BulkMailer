import { useRef, useState } from "react";
import * as XLSX from "xlsx";

const EMAIL_REGEX = /[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+/g;

// Reads an uploaded Excel/CSV file, scans every cell on every sheet, and
// pulls out anything that looks like an email address — works regardless of
// which column the addresses are in or whether there's a header row.
function ExcelRecipientUpload({ recipients, onChange }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [addedCount, setAddedCount] = useState(null);

  const extractEmailsFromWorkbook = (workbook) => {
    const found = new Set();

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

      rows.forEach((row) => {
        row.forEach((cell) => {
          const matches = String(cell).match(EMAIL_REGEX);
          if (matches) matches.forEach((m) => found.add(m.trim()));
        });
      });
    });

    return Array.from(found);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError("");
    setAddedCount(null);
    setFileName(file.name);
    setParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const emails = extractEmailsFromWorkbook(workbook);

        if (emails.length === 0) {
          setUploadError("No email addresses found in that file.");
        } else {
          const merged = [...recipients];
          let newCount = 0;
          emails.forEach((email) => {
            if (!merged.includes(email)) {
              merged.push(email);
              newCount += 1;
            }
          });
          onChange(merged);
          setAddedCount(newCount);
        }
      } catch (err) {
        setUploadError("Couldn't read that file. Make sure it's a valid .xlsx, .xls, or .csv file.");
      } finally {
        setParsing(false);
      }
    };
    reader.onerror = () => {
      setUploadError("Failed to read the file.");
      setParsing(false);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="excel-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        className="excel-upload-input"
        id="excel-upload-input"
      />
      <label htmlFor="excel-upload-input" className="excel-upload-button">
        📎 {parsing ? "Reading file..." : "Upload Excel / CSV"}
      </label>
      {fileName && !parsing && <span className="excel-upload-filename">{fileName}</span>}

      {uploadError && <div className="message error excel-upload-message">{uploadError}</div>}
      {addedCount !== null && !uploadError && (
        <div className="message success excel-upload-message">
          Added {addedCount} new recipient{addedCount === 1 ? "" : "s"} from the file.
        </div>
      )}
    </div>
  );
}

export default ExcelRecipientUpload;
