import "./App.css";
import { useStickyState } from "./hooks";
import { IncomeForm } from "./income/IncomeForm";
import { Paycheck } from "./schema";

function App() {
  const [savedPaycheckData, setSavedPaycheckData] = useStickyState<Paycheck[]>(
    "paycheckData",
    []
  );

  const bonusNetPay = savedPaycheckData.reduce((acc, paycheck) => {
    const netPay = paycheck.bonusNetPay;
    return acc + netPay;
  }, 0);
  const netStockVestings = savedPaycheckData.reduce((acc, paycheck) => {
    const netStockVestings = paycheck.netStockVestings;
    return acc + netStockVestings;
  }, 0);
  const nonBonusNetPay = savedPaycheckData.reduce((acc, paycheck) => {
    const nonBonusNetPay = paycheck.nonBonusNetPay;
    return acc + nonBonusNetPay;
  }, 0);
  return (
    <div className="App">
      <button onClick={() => setSavedPaycheckData([])}>
        Clear Paycheck Data
      </button>
      {savedPaycheckData.length === 0 && (
        <IncomeForm onSubmit={(data) => setSavedPaycheckData(data)} />
      )}
      {savedPaycheckData.length > 0 && (
        <div>
          <h2>Paycheck Data</h2>
          <h3>
            Total Bonus Net Pay: $
            {bonusNetPay.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>
          <h3>
            Total Non-Bonus Net Pay: $
            {nonBonusNetPay.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>
          <h3>
            Total Net Stock Vestings: $
            {netStockVestings.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>
        </div>
      )}
    </div>
  );
}

export default App;
