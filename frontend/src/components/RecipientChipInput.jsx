import { useState } from "react";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Turns raw email typing into removable "chips" — paste a whole list and it
// splits on commas/spaces/newlines automatically.
function RecipientChipInput({ recipients, onChange }) {
  const [draft, setDraft] = useState("");

  const commitDraft = (raw) => {
    const pieces = raw
      .split(/[\s,]+/)
      .map((r) => r.trim())
      .filter(Boolean);

    if (pieces.length === 0) return;

    const merged = [...recipients];
    pieces.forEach((p) => {
      if (!merged.includes(p)) merged.push(p);
    });
    onChange(merged);
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      commitDraft(draft);
    } else if (e.key === "Backspace" && draft === "" && recipients.length > 0) {
      onChange(recipients.slice(0, -1));
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text");
    if (/[\s,]/.test(text)) {
      e.preventDefault();
      commitDraft(text);
    }
  };

  const removeChip = (chip) => {
    onChange(recipients.filter((r) => r !== chip));
  };

  return (
    <div className="chip-input" onClick={() => document.getElementById("recipient-draft")?.focus()}>
      {recipients.map((chip) => (
        <span key={chip} className={`chip ${isValidEmail(chip) ? "" : "chip-invalid"}`}>
          {chip}
          <button
            type="button"
            className="chip-remove"
            onClick={(e) => {
              e.stopPropagation();
              removeChip(chip);
            }}
            aria-label={`Remove ${chip}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id="recipient-draft"
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commitDraft(draft)}
        onPaste={handlePaste}
        placeholder={recipients.length === 0 ? "Type an email and press Enter..." : ""}
      />
    </div>
  );
}

export default RecipientChipInput;
