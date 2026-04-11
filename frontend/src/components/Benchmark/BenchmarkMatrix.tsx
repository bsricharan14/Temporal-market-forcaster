interface BenchmarkStats {
    median_ms?: number | null;
    rows?: number;
}

type BenchmarkCase = {
    id: string;
    label: string;
    plain: BenchmarkStats;
    hypertable: BenchmarkStats;
    continuous_aggregate?: BenchmarkStats | null;
    speedup?: {
        hypertable_vs_plain?: number | null;
        cagg_vs_plain?: number | null;
    };
};

interface BenchmarkMatrixProps {
    cases: BenchmarkCase[];
    loading: boolean;
}

function formatMs(value?: number | null) {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return "--";
    }
    return `${value.toFixed(3)} ms`;
}

function formatSpeedup(value?: number | null) {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return "--";
    }
    return `${value.toFixed(2)}x`;
}

function speedupClass(value?: number | null) {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return "speedup-neutral";
    }
    return value > 1 ? "speedup-positive" : "speedup-negative";
}

export default function BenchmarkMatrix({ cases, loading }: BenchmarkMatrixProps) {
    return (
        <div className="benchmark-matrix-panel">
            {loading ? (
                <div className="benchmark-loading">Running benchmark, please wait...</div>
            ) : null}

            <div className="benchmark-table-wrapper">
                <table className="benchmark-table" role="table" aria-label="Benchmark result matrix">
                    <thead>
                        <tr>
                            <th>Query</th>
                            <th>Plain</th>
                            <th>Hypertable</th>
                            <th>Hyper Speedup</th>
                            <th>Cagg</th>
                            <th>Cagg Speedup</th>
                            <th>Rows</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cases.map((row) => (
                            <tr key={row.id}>
                                <td>{row.label}</td>
                                <td>{formatMs(row.plain?.median_ms)}</td>
                                <td>{formatMs(row.hypertable?.median_ms)}</td>
                                <td>
                                    <span className={`speedup-pill ${speedupClass(row.speedup?.hypertable_vs_plain)}`}>
                                        {formatSpeedup(row.speedup?.hypertable_vs_plain)}
                                    </span>
                                </td>
                                <td>{row.continuous_aggregate ? formatMs(row.continuous_aggregate?.median_ms) : "N/A"}</td>
                                <td>
                                    {row.continuous_aggregate ? (
                                        <span className={`speedup-pill ${speedupClass(row.speedup?.cagg_vs_plain)}`}>
                                            {formatSpeedup(row.speedup?.cagg_vs_plain)}
                                        </span>
                                    ) : (
                                        "N/A"
                                    )}
                                </td>
                                <td>{row.plain?.rows ?? "--"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
