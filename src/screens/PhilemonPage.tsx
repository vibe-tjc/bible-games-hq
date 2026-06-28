import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function PhilemonPage() {
  return (
    <section style={{ width: "100%", padding: 0 }}>
      <div style={{ width: "min(1120px, 100%)", margin: "0 auto", padding: "20px 16px 10px" }}>
        <Link to="/" className="back-link">
          <ArrowLeft aria-hidden="true" size={18} />
          回首頁
        </Link>
      </div>
      <iframe
        title="讀經四步"
        src={`${import.meta.env.BASE_URL}games/philemon-study-game.html`}
        style={{
          display: "block",
          width: "100%",
          height: "calc(100dvh - 128px)",
          minHeight: "680px",
          border: 0,
          background: "#ebe0c7",
        }}
      />
    </section>
  );
}
