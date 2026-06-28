import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function PhilemonPage() {
  return (
    <section style={{ width: "min(980px, 100%)", margin: "0 auto", padding: "24px 16px 40px" }}>
      <Link to="/" className="back-link">
        <ArrowLeft aria-hidden="true" size={18} />
        回首頁
      </Link>
      <iframe
        title="腓利門書・讀經四步"
        src={`${import.meta.env.BASE_URL}games/philemon-study-game.html`}
        style={{
          width: "100%",
          height: "calc(100vh - 140px)",
          minHeight: "720px",
          border: 0,
          borderRadius: "18px",
          background: "#ebe0c7",
        }}
      />
    </section>
  );
}
