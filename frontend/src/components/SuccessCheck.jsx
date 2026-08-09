// Animated SVG checkmark shown briefly after a successful send
function SuccessCheck() {
  return (
    <div className="success-check-overlay">
      <svg className="success-check" viewBox="0 0 52 52">
        <circle className="success-check-circle" cx="26" cy="26" r="24" fill="none" />
        <path className="success-check-mark" fill="none" d="M14 27l7 7 17-17" />
      </svg>
    </div>
  );
}

export default SuccessCheck;
