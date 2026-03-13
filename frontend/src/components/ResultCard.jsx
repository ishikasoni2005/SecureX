import FraudScoreCard from "./FraudScoreCard";

function ResultCard({ result }) {
  return (
    <FraudScoreCard
      result={result}
      emptyLabel="Run an analysis to see SecureX findings, explanations, and warnings here."
    />
  );
}

export default ResultCard;
