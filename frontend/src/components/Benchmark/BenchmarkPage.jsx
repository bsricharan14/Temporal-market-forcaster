import Panel from "../ui/Panel";
import MetricCard from "../ui/MetricCard";

const BENCHMARK_ROWS = [
  { name: "OHLCV 1M Aggregate", vanilla: 4820, tuned: 210 },
  { name: "Daily Candle (1Y)", vanilla: 12340, tuned: 380 },
  { name: "Point Lookup", vanilla: 890, tuned: 18 },
  { name: "Rolling VWAP", vanilla: 9400, tuned: 160 },
];

export default function BenchmarkPage({ selectedAsset }) {
  return (
    <main className="page-shell">
      <header className="section-intro panel">
        <p className="eyebrow">Benchmark</p>
        <h2 className="headline">Database Performance Snapshot</h2>
        <p className="subline">
          Mock benchmark view for {selectedAsset.symbol} using the same single page navigation.
        </p>
      </header>

      <section className="benchmark-summary">
        <MetricCard
          label="Average Speedup"
          value="24.7x"
          delta="TimescaleDB"
          tone="positive"
          helper="Across synthetic workloads"
        />
        <MetricCard
          label="Best Case"
          value="1575x"
          delta="Cont. aggregates"
          tone="positive"
          helper="Read-heavy query path"
        />
        <MetricCard
          label="Insert Throughput"
          value="172K/s"
          delta="Hypertable"
          tone="neutral"
          helper="Batch tick ingestion"
        />
      </section>

      <Panel title="Latency Comparison" subtitle="Vanilla SQL vs tuned stack (dummy data)">
        <div className="benchmark-table">
          {BENCHMARK_ROWS.map((row) => {
            const max = Math.max(row.vanilla, row.tuned);
            const vanillaWidth = (row.vanilla / max) * 100;
            const tunedWidth = (row.tuned / max) * 100;

            return (
              <article key={row.name} className="benchmark-row">
                <div className="benchmark-head">
                  <h3>{row.name}</h3>
                  <p>
                    <span className="negative">{row.vanilla}ms</span>
                    <span> vs </span>
                    <span className="positive">{row.tuned}ms</span>
                  </p>
                </div>

                <div className="latency-track">
                  <span className="latency-fill negative" style={{ width: `${vanillaWidth}%` }} />
                </div>
                <div className="latency-track tuned">
                  <span className="latency-fill positive" style={{ width: `${tunedWidth}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </Panel>
    </main>
  );
}
