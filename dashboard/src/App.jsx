import challengeData from "./data/rockyWorldsChallengeMock.json";

const formatNumber = (value, options = {}) =>
  new Intl.NumberFormat("en-US", options).format(value);

function DataPill({ label, value }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs tracking-wide text-slate-300">
      <span className="text-slate-500">{label}</span>{" "}
      <span className="font-semibold text-slate-100">{value}</span>
    </div>
  );
}

function MetricBlock({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 shadow-inner shadow-black/20">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-50">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
    </div>
  );
}

function PropertyRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-3 last:border-b-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-200">{value}</dd>
    </div>
  );
}

function PosteriorSummary({ posterior }) {
  const generatorEntries = Object.entries(
    posterior.arrayParameterization,
  ).filter(([key]) => key !== "generator" && key !== "seed");

  return (
    <section className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/70">
            Posterior submission field
          </p>
          <h3 className="mt-2 font-mono text-lg text-slate-50">
            {posterior.targetField}
          </h3>
        </div>
        <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          {formatNumber(posterior.sampleCount)} samples
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
            P16
          </p>
          <p className="mt-1 font-mono text-sm text-slate-100">
            {posterior.credibleIntervalPpm.p16}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 ring-1 ring-cyan-300/20">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
            P50
          </p>
          <p className="mt-1 font-mono text-sm text-cyan-100">
            {posterior.credibleIntervalPpm.p50}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
            P84
          </p>
          <p className="mt-1 font-mono text-sm text-slate-100">
            {posterior.credibleIntervalPpm.p84}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
          Array parameterization
        </p>
        <p className="mt-2 font-mono text-sm text-slate-200">
          {posterior.arrayParameterization.generator}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-400">
          {generatorEntries.map(([key, value]) => (
            <div className="flex justify-between gap-3" key={key}>
              <span className="text-slate-500">{key}</span>
              <span className="font-mono text-slate-200">{value}</span>
            </div>
          ))}
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">min samples</span>
            <span className="font-mono text-slate-200">
              {formatNumber(posterior.minimumRequiredSamples)}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">units</span>
            <span className="font-mono text-slate-200">{posterior.units}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TargetCard({ target }) {
  const { observation, targetProperties, metrics } = target;

  return (
    <article className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-slate-900/65 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
            {target.targetRole}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {target.name}
          </h2>
          <p className="mt-2 text-sm text-slate-400">{target.planetClass}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
          <p className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-500">
            Host
          </p>
          <p className="mt-1 font-mono text-sm text-slate-100">
            {target.hostStar}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <DataPill
          label="Instrument"
          value={`${observation.instrument} ${observation.bandpass}`}
        />
        <DataPill label="Mode" value={observation.detectorMode} />
        <DataPill label="Type" value="Secondary eclipse" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MetricBlock
          label="Median depth"
          value={`${metrics.medianEclipseDepthPpm} ppm`}
          detail={`± ${metrics.eclipseDepthUncertaintyPpm} ppm posterior uncertainty`}
        />
        <MetricBlock
          label="Mid-eclipse T₀"
          value={metrics.midEclipseTime.bjdTdb.toFixed(5)}
          detail={`BJD_TDB ± ${metrics.midEclipseTime.uncertaintyDays} days`}
        />
        <MetricBlock
          label="Residual variance"
          value={formatNumber(
            metrics.detrendedResidualFluxVariance.valuePpmSquared,
          )}
          detail={`ppm²; RMS ${metrics.detrendedResidualFluxVariance.rmsPpm} ppm`}
        />
      </div>

      <div className="mt-6 grid flex-1 gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
            Target profile
          </p>
          <dl className="mt-3">
            <PropertyRow label="Dataset" value={target.datasetType} />
            <PropertyRow
              label="Eclipse ID"
              value={observation.eclipseIdentifier}
            />
            <PropertyRow
              label="Cadence"
              value={`${observation.cadenceSeconds} s`}
            />
            <PropertyRow
              label="Integrations"
              value={formatNumber(observation.integrationCount)}
            />
            <PropertyRow
              label="Period"
              value={`${targetProperties.orbitalPeriodDays} d`}
            />
            <PropertyRow
              label="Radius"
              value={`${targetProperties.planetRadiusEarth} R⊕`}
            />
            <PropertyRow
              label="Mass"
              value={`${targetProperties.planetMassEarth} M⊕`}
            />
            <PropertyRow
              label="T_eq"
              value={`${targetProperties.equilibriumTemperatureK} K`}
            />
          </dl>
        </div>

        <PosteriorSummary posterior={metrics.posteriorDistribution} />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
          Detrending model
        </p>
        <p className="mt-2 text-sm text-slate-300">
          {metrics.modelFitQuality.baselineModel}
        </p>
        <p className="mt-1 font-mono text-xs text-slate-500">
          χ²ν = {metrics.modelFitQuality.reducedChiSquared} · residual variance
          uncertainty{" "}
          {metrics.detrendedResidualFluxVariance.uncertaintyPpmSquared} ppm²
        </p>
      </div>
    </article>
  );
}

export default function App() {
  const { challenge, targets } = challengeData;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_34rem),linear-gradient(135deg,_#020617_0%,_#0f172a_50%,_#020617_100%)] px-4 py-8 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/25 backdrop-blur md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/80">
                JWST / MIRI 15 μm · Static comparative dashboard
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
                Rocky Worlds DDT Data Challenge target analysis
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400">
                A presentation-ready React and Tailwind layout comparing the
                challenge&apos;s real GJ 3929 b observation against the
                simulated LHS 1140 b target with mock Kaggle-style metric
                fields.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Schema context
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {challenge.dataReleaseContext}
              </p>
              <p className="mt-4 font-mono text-xs text-cyan-100/80">
                {challenge.submissionSchemaVersion}
              </p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          {targets.map((target) => (
            <TargetCard key={target.id} target={target} />
          ))}
        </section>

        <footer className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Mock data guardrails
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {challenge.submissionNotes.map((note) => (
              <p
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400"
                key={note}
              >
                {note}
              </p>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}
