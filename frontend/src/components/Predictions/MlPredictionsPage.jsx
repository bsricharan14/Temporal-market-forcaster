import PredictionsPanel from "./PredictionsPanel";
import Panel from "../ui/Panel";
import Pill from "../ui/Pill";

const MODELS = [
  {
    title: "Trend Classifier",
    family: "XGBoost",
    metric: "74.2% accuracy",
    status: "Active",
    tone: "positive",
  },
  {
    title: "Volatility Regressor",
    family: "LightGBM",
    metric: "MAE $0.42",
    status: "Active",
    tone: "warning",
  },
  {
    title: "Regime Clusterer",
    family: "K-Means (k=3)",
    metric: "Silhouette 0.68",
    status: "Active",
    tone: "neutral",
  },
  {
    title: "Gap Predictor",
    family: "XGBoost Multi-Class",
    metric: "68.1% accuracy",
    status: "Shadow",
    tone: "negative",
  },
];

export default function MlPredictionsPage({ selectedAsset, predictions }) {
  return (
    <main className="page-shell">
      <header className="section-intro panel">
        <p className="eyebrow">ML Predictions</p>
        <h2 className="headline">Model Outputs For {selectedAsset.symbol}</h2>
        <p className="subline">
          Dummy model cards and registry metadata for your single page app flow.
        </p>
      </header>

      <section className="content-grid">
        <PredictionsPanel
          symbol={selectedAsset.symbol}
          regime={selectedAsset.regime}
          predictions={predictions}
        />

        <Panel title="Model Registry" subtitle="Current mocked training artifacts">
          <div className="model-registry">
            {MODELS.map((model) => (
              <article key={model.title} className="model-row">
                <div>
                  <h3>{model.title}</h3>
                  <p>{model.family}</p>
                </div>
                <div className="model-meta">
                  <Pill tone={model.tone}>{model.metric}</Pill>
                  <span className="model-status">{model.status}</span>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </section>
    </main>
  );
}
