import "./paul-journeys/paul-journeys.css";
import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { createPaulGame } from "./paul-journeys/game";

export function PaulJourneysPage() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const game = createPaulGame(rootRef.current);
    game.start();
    return () => game.destroy();
  }, []);

  return (
    <>
      <Link to="/" className="back-link">
        <ArrowLeft aria-hidden="true" size={18} />
        回首頁
      </Link>

      <section className="paul-game" ref={rootRef}>
        <div id="stage">
          <svg
            className="paul-map"
            viewBox="0 0 1200 760"
            preserveAspectRatio="xMidYMid meet"
          />
          <div className="paul-leaf" />
          <div id="flash" />

          <div className="hud panel" id="hudTL">
            <div className="lv" id="hLv">—</div>
            <div className="rf" id="hRf"></div>
            <div className="dots" id="hDots"></div>
          </div>

          <div className="hud" id="hudTR">
            <div className="panel scorebox">
              <div className="sc" id="hScore">0</div>
              <div className="stars" id="hStars"></div>
            </div>
            <div className="btnrow">
              <button className="ibtn" id="bMap">真實地圖</button>
              <button className="ibtn" id="bHint">提示</button>
              <button className="ibtn" id="bLog">記錄</button>
              <button className="ibtn" id="bSound">♪</button>
              <button className="ibtn" id="bRe">重來</button>
              <button className="ibtn" id="bMenu">選單</button>
            </div>
          </div>

          <div className="hud panel" id="quest">
            <span className="qh">任務</span>
            <div id="qTxt">選擇一段旅程</div>
          </div>

          <div id="combo"></div>

          <div className="hud panel" id="dlg">
            <div className="dh">
              <div className="dnm" id="dNm"></div>
              <div className="drf" id="dRf"></div>
            </div>
            <div className="dmeta" id="dMeta"></div>
            <div className="dft" id="dFt"></div>
            <div className="dnext">
              <button className="cont" id="dCont">繼續探索 ▸</button>
            </div>
          </div>

          <div className="ov" id="startOv">
            <div className="sheet">
              <h2>保羅宣道大冒險</h2>
              <p className="lead">
                操作傳道者保羅,按正確順序連出三次宣道的路線。連對下一站可得分並解鎖事蹟;連得越順、用越少提示,星等越高。<br />
                右上角可隨時在<b>繪製地圖</b>與<b>真實地圖</b>之間切換。選一段旅程出發:
              </p>
              <div className="jsel" id="jsel"></div>
              <label className="opt">
                <input type="checkbox" id="challenge" /> 挑戰模式:隱藏未抵達城市的地名
              </label>
              <div className="legend">
                <span><i className="lg-d"></i>城市</span>
                <span><i className="lg-l"></i>陸路</span>
                <span><i className="lg-s"></i>海路</span>
                <span>金色 = 已抵達</span>
              </div>
            </div>
          </div>

          <div className="ov hidden" id="winOv">
            <div className="sheet" id="winSheet"></div>
          </div>

          <div className="ov hidden" id="logOv">
            <div className="sheet">
              <button className="close" id="logClose">×</button>
              <h2 style={{ fontSize: "21px" }} id="logTitle">旅程記錄</h2>
              <div id="logBody"></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
