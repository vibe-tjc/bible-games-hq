import { AlertTriangle } from "lucide-react";
import { apiConfigured } from "../lib/api";

export function ApiNotice() {
  if (apiConfigured) {
    return null;
  }

  return (
    <div className="api-notice" role="status">
      <AlertTriangle aria-hidden="true" size={18} />
      <span>
        尚未設定 <code>VITE_APPS_SCRIPT_URL</code>
        ，可先瀏覽介面；建立場次與提交結果需要 Google Apps Script Web App。
      </span>
    </div>
  );
}
