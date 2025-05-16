import "./App.css";
import { useStickyState } from "./hooks";
import { IncomeForm } from "./income/IncomeForm";
import { Paycheck, PaycheckCollection } from "./schema";

function App() {
  const [savedPaycheckData, setSavedPaycheckData] = useStickyState<Paycheck[]>(
    "paycheckData",
    []
  );

  const paycheckCollection = new PaycheckCollection(savedPaycheckData);

  return (
    <div className="App">
      <button onClick={() => setSavedPaycheckData([])}>
        Clear Paycheck Data
      </button>
      {savedPaycheckData.length === 0 && (
        <IncomeForm onSubmit={(data) => setSavedPaycheckData(data)} />
      )}
      {savedPaycheckData.length > 0 && (
        <>
          <div>
            <h2>Paycheck Summary</h2>
            <h3>
              Total Bonus Net Pay: $
              {paycheckCollection.bonusNetPay.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <h3>
              Total Non-Bonus Net Pay: $
              {paycheckCollection.nonBonusNetPay.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <h3>
              Total Net Stock Vestings: $
              {paycheckCollection.netStockVestings.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <h3>
              Effective Tax Rate:{" "}
              {(
                paycheckCollection.taxesWithheld /
                paycheckCollection.taxableEarnings
              ).toLocaleString("en-US", {
                style: "percent",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
          <div>
            <h2>Sankeymatic code</h2>
            <pre>{paycheckCollection.sankeyData}</pre>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
