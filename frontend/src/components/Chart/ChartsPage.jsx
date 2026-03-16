import CandlestickChart from "./CandlestickChart";
import Panel from "../ui/Panel";
import Pill from "../ui/Pill";

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value > 1000 ? 0 : 2,
  }).format(value);
}

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D"];

export default function ChartsPage({ selectedAsset, livePrice, candles }) {
  const trendTone = livePrice >= selectedAsset.basePrice ? "positive" : "negative";

  return (
    <main className="page-shell">
      <header className="section-intro panel">
        <p className="eyebrow">Charts</p>
        <h2 className="headline">Price Action And Context</h2>
        <p className="subline">
          Chart-focused dummy layout for testing indicators and symbol switching.
        </p>
      </header>

      <section className="content-grid charts-grid">
        <Panel
          title={`${selectedAsset.symbol} Candlestick View`}
          subtitle={`${selectedAsset.name} · Dummy feed`}
          right={<Pill tone={trendTone}>{formatPrice(livePrice)}</Pill>}
        >
          <div className="chart-toolbar">
            {TIMEFRAMES.map((timeframe) => (
              <button
                key={timeframe}
                className={`toolbar-chip ${timeframe === "1H" ? "active" : ""}`}
              >
                {timeframe}
              </button>
            ))}
          </div>
          <CandlestickChart data={candles} />
        </Panel>

        <Panel
          title="Chart Stats"
          subtitle="Mock values for this symbol"
          className="chart-stats-panel"
        >
          <div className="info-list">
            <div>
              <span>Last Price</span>
              <strong>{formatPrice(livePrice)}</strong>
            </div>
            <div>
              <span>Session Open</span>
              <strong>{formatPrice(candles[0].open)}</strong>
            </div>
            <div>
              <span>Session High</span>
              <strong>{formatPrice(Math.max(...candles.map((point) => point.high)))}</strong>
            </div>
            <div>
              <span>Session Low</span>
              <strong>{formatPrice(Math.min(...candles.map((point) => point.low)))}</strong>
            </div>
            <div>
              <span>Volume</span>
              <strong>
                {new Intl.NumberFormat("en-US").format(
                  candles.reduce((sum, point) => sum + point.volume, 0),
                )}
              </strong>
            </div>
          </div>
        </Panel>
      </section>
    </main>
  );
}
