import { useEffect, useMemo, useState } from "react";
import CandlestickChart from "../Chart/CandlestickChart";
import PredictionsPanel from "../Predictions/PredictionsPanel";
import MetricCard from "../ui/MetricCard";
import Panel from "../ui/Panel";
import Pill from "../ui/Pill";

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value > 1000 ? 0 : 2,
  }).format(value);
}

function formatDelta(basePrice, livePrice) {
  const change = Number((livePrice - basePrice).toFixed(2));
  const percent = Number(((change / basePrice) * 100).toFixed(2));
  return { change, percent };
}

function buildCandlesFromTicks(ticks, timeframeMinutes) {
  if (!ticks?.length) {
    return [];
  }

  const buckets = new Map();
  const bucketMs = timeframeMinutes * 60 * 1000;

  for (const tick of ticks) {
    const date = new Date(tick.time);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const bucketStartMs = Math.floor(date.getTime() / bucketMs) * bucketMs;
    const key = new Date(bucketStartMs).toISOString();
    const price = Number(tick.price);
    const volume = Number(tick.volume) || 0;
    const existing = buckets.get(key);

    if (!existing) {
      buckets.set(key, {
        bucket: key,
        open: price,
        high: price,
        low: price,
        close: price,
        volume,
      });
      continue;
    }

    existing.close = price;
    existing.high = Math.max(existing.high, price);
    existing.low = Math.min(existing.low, price);
    existing.volume += volume;
  }

  return Array.from(buckets.values())
    .sort((a, b) => new Date(a.bucket).getTime() - new Date(b.bucket).getTime())
    .map((item, index) => ({ ...item, index }));
}

export default function Dashboard({
  assets,
  onSymbolChange,
  selectedAsset,
  livePrice,
  candles,
  predictions,
  simulationControls,
}) {
  const [ticks, setTicks] = useState([]);
  const [benchmarkSummary, setBenchmarkSummary] = useState(null);
  const [dashboardError, setDashboardError] = useState("");
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const chartCandles = useMemo(() => buildCandlesFromTicks(ticks, 60), [ticks]);
  const currentLivePrice = ticks.length ? Number(ticks[ticks.length - 1]?.price) : livePrice;
  const movement = formatDelta(selectedAsset.basePrice, currentLivePrice);
  const movementTone = movement.change >= 0 ? "positive" : "negative";
  const busyAction = simulationControls?.busyAction ?? "";

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadDashboardData = async () => {
      setDashboardLoading(true);
      setDashboardError("");

      const ticksUrl = `/api/market/ticks?symbol=${encodeURIComponent(selectedAsset.symbol)}&limit=2500`;
      const benchmarkUrl = `/api/market/benchmark?symbol=${encodeURIComponent(selectedAsset.symbol)}&window=${encodeURIComponent("60 minutes")}&runs=3`;

      try {
        const [ticksResult, benchmarkResult] = await Promise.allSettled([
          fetch(ticksUrl, { signal: controller.signal }),
          fetch(benchmarkUrl, { signal: controller.signal }),
        ]);

        if (active && ticksResult.status === "fulfilled") {
          if (ticksResult.value.ok) {
            const tickData = await ticksResult.value.json();
            setTicks(Array.isArray(tickData) ? tickData : []);
          } else {
            setDashboardError("Unable to load chart data");
          }
        }

        if (active && benchmarkResult.status === "fulfilled") {
          if (benchmarkResult.value.ok) {
            const summaryData = await benchmarkResult.value.json();
            setBenchmarkSummary(summaryData.summary ?? null);
          } else {
            setBenchmarkSummary(null);
          }
        }
      } catch (error) {
        if (active) {
          setDashboardError(error?.message || "Dashboard data fetch failed");
        }
      } finally {
        if (active) {
          setDashboardLoading(false);
        }
      }
    };

    loadDashboardData();
    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedAsset.symbol]);

  return (
    <main className="page-shell">
      <header className="section-intro panel">
        <p className="eyebrow">Dashboard</p>
        <h2 className="headline">Portfolio Snapshot For {selectedAsset.symbol}</h2>
        <p className="subline">
          Live mock pricing with reusable cards, chart, predictions, and watchlist.
        </p>

        <div className="chart-controls-actions">
          <button
            className="sim-btn"
            disabled={busyAction !== ""}
            onClick={() => simulationControls?.runAction?.("start")}
          >
            {busyAction === "start" ? "Starting..." : "Start"}
          </button>
          <button
            className="sim-btn"
            disabled={busyAction !== ""}
            onClick={() => simulationControls?.runAction?.("stop")}
          >
            {busyAction === "stop" ? "Stopping..." : "Stop"}
          </button>
          <button
            className="sim-btn"
            disabled={busyAction !== ""}
            onClick={() => simulationControls?.runAction?.("restart")}
          >
            {busyAction === "restart" ? "Restarting..." : "Restart"}
          </button>
        </div>

        {dashboardError ? <p className="subline simulation-error">{dashboardError}</p> : null}
        {simulationControls?.errorMessage ? (
          <p className="subline simulation-error">{simulationControls.errorMessage}</p>
        ) : null}
      </header>

      <section className="stats-grid">
        <MetricCard
          label="Live Price"
          value={formatPrice(currentLivePrice)}
          delta={`${movement.change >= 0 ? "+" : ""}${movement.change} (${movement.percent}%)`}
          tone={movementTone}
          helper={`${selectedAsset.symbol} · ${selectedAsset.sector}`}
        />
        <MetricCard
          label="Predicted Next Candle"
          value="Bullish"
          delta="74% confidence"
          tone="positive"
          helper="XGBoost Classification"
        />
        <MetricCard
          label="Avg Hyper Speedup"
          value={benchmarkSummary?.avg_hypertable_speedup ? `${benchmarkSummary.avg_hypertable_speedup}x` : "--"}
          delta="plain vs hypertable"
          tone={benchmarkSummary?.avg_hypertable_speedup > 1 ? "positive" : "negative"}
          helper="60m window · 3 runs"
        />
        <MetricCard
          label="Avg Cagg Speedup"
          value={benchmarkSummary?.avg_cagg_speedup ? `${benchmarkSummary.avg_cagg_speedup}x` : "--"}
          delta="plain vs cagg"
          tone={benchmarkSummary?.avg_cagg_speedup > 1 ? "positive" : "neutral"}
          helper={benchmarkSummary?.best_hypertable_case ? `Best ${benchmarkSummary.best_hypertable_case.label}` : "No cagg data"}
        />
      </section>

      <section className="content-grid">
        <Panel
          title={`${selectedAsset.symbol} Price Action`}
          subtitle={`${selectedAsset.name} · ${selectedAsset.marketCap} market cap`}
          right={<Pill tone={movementTone}>{movement.change >= 0 ? "Uptrend" : "Pullback"}</Pill>}
        >
          <CandlestickChart data={chartCandles} />
        </Panel>

        <PredictionsPanel
          symbol={selectedAsset.symbol}
          regime={selectedAsset.regime}
          predictions={predictions}
        />
      </section>

      <section className="bottom-grid">
        <Panel title="Watchlist" subtitle="Mock symbols for demo navigation">
          <div className="watchlist-table">
            {assets.map((asset) => {
              const isActive = asset.symbol === selectedAsset.symbol;
              const previewDelta = formatDelta(asset.basePrice, asset.basePrice * 1.004);

              return (
                <button
                  key={asset.symbol}
                  className={`watchlist-row ${isActive ? "active" : ""}`}
                  onClick={() => onSymbolChange(asset.symbol)}
                >
                  <span>{asset.symbol}</span>
                  <span>{asset.sector}</span>
                  <span>{formatPrice(asset.basePrice)}</span>
                  <span className={previewDelta.change >= 0 ? "positive" : "negative"}>
                    {previewDelta.change >= 0 ? "+" : ""}
                    {previewDelta.percent}%
                  </span>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel title="Activity Feed" subtitle="Placeholder updates for UI testing">
          <ul className="activity-feed">
            <li>
              <span className="activity-time">09:35</span>
              <p>{selectedAsset.symbol} mock WebSocket tick received.</p>
            </li>
            <li>
              <span className="activity-time">09:34</span>
              <p>Predictions recalculated from dummy feature vector.</p>
            </li>
            <li>
              <span className="activity-time">09:31</span>
              <p>Continuous aggregate refresh simulated.</p>
            </li>
          </ul>
        </Panel>
      </section>
    </main>
  );
}
