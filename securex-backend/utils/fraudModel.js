// Lightweight anomaly/risk scoring for fraud/threat-like events.
// Combines categorical risk weights with robust z-score on numeric fields.

const CATEGORY_WEIGHTS = {
  type: {
    phishing: 0.7,
    brute_force: 0.6,
    sql_injection: 0.8,
    zero_day: 0.9,
    insider_threat: 0.85,
    ddos: 0.5,
    malware: 0.6
  },
  countryRisk: {
    // Example: elevate risk for certain country codes if desired
  }
};

function clamp01(x) {
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function robustZScore(value, median, mad) {
  if (value == null || median == null || !mad || mad === 0) return 0;
  // 1.4826 approximates std from MAD for normal distributions
  return Math.abs((value - median) / (1.4826 * mad));
}

// Compute a risk score in [0,1]
function scoreEvent(eventFeatures = {}, baselines = {}) {
  // Categorical contributions
  const typeWeight = CATEGORY_WEIGHTS.type[eventFeatures.type] || 0.3;

  // Numeric anomaly contributions (example fields)
  const loginAttemptsZ = robustZScore(
    eventFeatures.loginAttempts,
    baselines.loginAttemptsMedian,
    baselines.loginAttemptsMAD
  );
  const amountZ = robustZScore(
    eventFeatures.amount,
    baselines.amountMedian,
    baselines.amountMAD
  );

  // Map z-scores to [0,1] with a soft cap
  const zToScore = (z) => clamp01(1 - Math.exp(-Math.min(6, z)));
  const loginAnomaly = zToScore(loginAttemptsZ);
  const amountAnomaly = zToScore(amountZ);

  // Heuristic aggregation
  const weighted = 0.45 * typeWeight + 0.3 * loginAnomaly + 0.25 * amountAnomaly;
  return clamp01(weighted);
}

module.exports = {
  scoreEvent
};


