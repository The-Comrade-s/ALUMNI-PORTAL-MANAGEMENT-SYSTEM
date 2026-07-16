/**
 * "The Gateway Mark" — the page's signature element.
 *
 * The institution's logo is three interlocking cog rings. Rather than
 * decorate pages with a generic gradient blob, this component turns that
 * same idea — separate parts, permanently linked — into an ambient graphic:
 * three slow-rotating ring outlines in navy/gold, always overlapping,
 * never separating. It stands for the alumni network itself: every
 * graduate is a distinct ring (their own school, class, career) that stays
 * interlocked with the institution and with each other.
 *
 * Used, restrained, in exactly two places: the landing hero background and
 * the auth-page loading state. Nowhere else — see SKILL guidance on
 * spending boldness in one place.
 */
export function GatewayMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="150" cy="150" r="90" stroke="#0B2D6B" strokeWidth="2" strokeDasharray="6 5" className="origin-[150px_150px] animate-mark-slow" />
      <circle cx="230" cy="150" r="90" stroke="#D4AF37" strokeWidth="2" strokeDasharray="6 5" className="origin-[230px_150px] animate-mark-slow-reverse" />
      <circle cx="190" cy="225" r="90" stroke="#1B4D95" strokeWidth="2" strokeDasharray="6 5" className="origin-[190px_225px] animate-mark-slow" />
    </svg>
  );
}
