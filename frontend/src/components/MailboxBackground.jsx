// Purely decorative animated background: a row of mailboxes along the bottom,
// each gently bobbing and periodically "launching" an envelope upward.
const MAILBOX_COUNT = 9;

function MailboxBackground() {
  const mailboxes = Array.from({ length: MAILBOX_COUNT }, (_, i) => i);

  return (
    <div className="mailbox-background" aria-hidden="true">
      {mailboxes.map((i) => {
        // Spread mailboxes evenly across the width with a little randomness per box
        const left = (i / MAILBOX_COUNT) * 100 + Math.random() * 6;
        const bobDuration = 3 + Math.random() * 2;
        const bobDelay = Math.random() * 3;
        const launchDuration = 5 + Math.random() * 3;
        const launchDelay = Math.random() * 6;
        const drift = (Math.random() - 0.5) * 80;

        const boxStyle = {
          left: `${left}%`,
          animationDuration: `${bobDuration}s`,
          animationDelay: `${bobDelay}s`,
        };

        const envelopeStyle = {
          left: `${left}%`,
          animationDuration: `${launchDuration}s`,
          animationDelay: `${launchDelay}s`,
          "--drift": `${drift}px`,
        };

        return (
          <span key={i}>
            <span className="mailbox" style={boxStyle}>
              📮
            </span>
            <span className="launched-envelope" style={envelopeStyle}>
              ✉️
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default MailboxBackground;
