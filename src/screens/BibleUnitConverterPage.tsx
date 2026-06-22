import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  categories,
  categoryOrder,
  demoOrder,
  demos,
  displayValue,
  fmt,
  modernInsight,
  units,
  type CategoryId,
  type UnitSystem,
} from "../data/bibleUnits";
import { cn } from "../lib/utils";

export function BibleUnitConverterPage() {
  const [amount, setAmount] = useState("300");
  const [category, setCategory] = useState<CategoryId>("length");
  const [unitId, setUnitId] = useState("cubit");
  const [system, setSystem] = useState<UnitSystem>("metric");
  const [silverPrice, setSilverPrice] = useState("70");
  const [goldPrice, setGoldPrice] = useState("2400");
  const [dayWageUsd, setDayWageUsd] = useState("100");
  const [tableOpen, setTableOpen] = useState(false);

  const unitsForCategory = useMemo(
    () => units.filter((item) => item.category === category),
    [category],
  );

  const unit = units.find((item) => item.id === unitId) ?? units[0];
  const amountNum = Number(amount || 0);
  const otherSystem: UnitSystem = system === "metric" ? "imperial" : "metric";

  const main = displayValue(unit, system, amountNum);
  const other = displayValue(unit, otherSystem, amountNum);
  const insight = modernInsight(unit, amountNum, {
    silverPrice: Number(silverPrice || 0),
    goldPrice: Number(goldPrice || 0),
    dayWageUsd: Number(dayWageUsd || 0),
  });

  function changeCategory(next: CategoryId) {
    setCategory(next);
    const first = units.find((item) => item.category === next);
    if (first && !units.some((item) => item.id === unitId && item.category === next)) {
      setUnitId(first.id);
    }
  }

  function applyDemo(demoId: keyof typeof demos) {
    const demo = demos[demoId];
    setAmount(String(demo.amount));
    setCategory(demo.category);
    setUnitId(demo.unit);
  }

  return (
    <section className="tool-page">
      <Link to="/" className="back-link">
        <ArrowLeft aria-hidden="true" size={18} />
        回首頁
      </Link>

      <header className="tool-header">
        <p className="eyebrow">聖經資源 · 單位換算</p>
        <h1>聖經單位換算器</h1>
        <p>
          輸入聖經中的單位數值，快速切換成公制或英制。第一版先收錄相對明確的長度、重量、乾量、液量與工資理解單位。
        </p>
      </header>

      <div className="uc-app">
        <div className="card uc-panel">
          <div className="uc-field">
            <label htmlFor="uc-amount">數值</label>
            <input
              id="uc-amount"
              className="input"
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div className="uc-grid2">
            <div className="uc-field">
              <label htmlFor="uc-category">分類</label>
              <select
                id="uc-category"
                className="input"
                value={category}
                onChange={(event) => changeCategory(event.target.value as CategoryId)}
              >
                {categoryOrder.map((id) => (
                  <option key={id} value={id}>
                    {categories[id]}
                  </option>
                ))}
              </select>
            </div>
            <div className="uc-field">
              <label htmlFor="uc-unit">聖經單位</label>
              <select
                id="uc-unit"
                className="input"
                value={unitId}
                onChange={(event) => setUnitId(event.target.value)}
              >
                {unitsForCategory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.zh} {item.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="uc-field">
            <label id="uc-system-label">顯示單位</label>
            <div className="uc-seg" role="group" aria-labelledby="uc-system-label">
              <button
                type="button"
                className={cn({ active: system === "metric" })}
                aria-pressed={system === "metric"}
                onClick={() => setSystem("metric")}
              >
                公制
              </button>
              <button
                type="button"
                className={cn({ active: system === "imperial" })}
                aria-pressed={system === "imperial"}
                onClick={() => setSystem("imperial")}
              >
                英制
              </button>
            </div>
          </div>

          <div className="uc-field">
            <label>快速範例</label>
            <div className="uc-quick">
              {demoOrder.map((id) => (
                <button key={id} type="button" onClick={() => applyDemo(id)}>
                  {demos[id].label}
                </button>
              ))}
            </div>
          </div>

          <details className="uc-settings">
            <summary>現代理解設定</summary>
            <div className="uc-settings-grid">
              <div className="uc-field">
                <label htmlFor="uc-silver">銀價 USD / 金衡盎司</label>
                <input
                  id="uc-silver"
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={silverPrice}
                  onChange={(event) => setSilverPrice(event.target.value)}
                />
              </div>
              <div className="uc-field">
                <label htmlFor="uc-gold">金價 USD / 金衡盎司</label>
                <input
                  id="uc-gold"
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={goldPrice}
                  onChange={(event) => setGoldPrice(event.target.value)}
                />
              </div>
              <div className="uc-field">
                <label htmlFor="uc-wage">一日工資 USD</label>
                <input
                  id="uc-wage"
                  className="input"
                  type="number"
                  step="1"
                  min="0"
                  value={dayWageUsd}
                  onChange={(event) => setDayWageUsd(event.target.value)}
                />
              </div>
            </div>
          </details>
        </div>

        <div className="card uc-result" aria-live="polite">
          <span className="uc-badge">{categories[unit.category]}</span>
          <div className="uc-big">約 {fmt(main.value)}</div>
          <div className="uc-unit">{main.unit}</div>
          <p className="uc-formula">
            {fmt(amountNum)} {unit.zh} × 約 {fmt(main.baseValue)} {main.baseUnit}
          </p>
          <div className="uc-meta">
            <div>
              <b>單位說明</b>
              <span>{unit.note}</span>
            </div>
            <div>
              <b>另一種顯示</b>
              <span className="uc-mini">
                {system === "metric" ? "英制" : "公制"}：約 {fmt(other.value)} {other.unit}
              </span>
            </div>
            <div className="uc-insight">
              <b>現代直覺理解</b>
              <span className="uc-insight-value">{insight.value}</span>
              <span className="uc-mini">{insight.note}</span>
            </div>
            <div>
              <b>提醒</b>
              <span className="uc-mini">
                古代單位依時代與資料來源可能有差異，本工具第一版採用常見教學約略值。
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card uc-table-card">
        <div className="uc-table-head">
          <h2>目前收錄單位</h2>
          <button
            type="button"
            className="uc-collapse-toggle"
            aria-expanded={tableOpen}
            onClick={() => setTableOpen((open) => !open)}
          >
            {tableOpen ? "收合" : "展開查看"}
          </button>
          <span className="uc-pill">{units.length} 個單位</span>
        </div>
        {tableOpen && (
          <div className="uc-table-body">
            <div className="uc-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>分類</th>
                    <th>單位</th>
                    <th>公制基準</th>
                    <th>英制基準</th>
                    <th>用途</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((item) => (
                    <tr key={item.id}>
                      <td>{categories[item.category]}</td>
                      <td>
                        <b>{item.zh}</b>
                        <br />
                        <span className="uc-mini">{item.en}</span>
                      </td>
                      <td>
                        約 {fmt(item.metric.value)} {item.metric.unit}
                      </td>
                      <td>
                        約 {fmt(item.imperial.value)} {item.imperial.unit}
                      </td>
                      <td>{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="uc-footer-note">
              下一版可加入：聖經出處、單位互轉、建築物預設範例、教學圖像比例尺，以及可調整不同資料來源的換算基準。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
