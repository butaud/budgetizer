import "./App.css";
import { useStickyState } from "./hooks";
import { IncomeForm } from "./income/IncomeForm";
import { SankeyD3 } from "./SankeyD3";
import { SankeyLink } from "./SankeyLink";
import { PaycheckCollection } from "./schema";

function App() {
  const [savedPaycheckData, setSavedPaycheckData] = useStickyState<string>(
    "paycheckData",
    "[]"
  );

  const paycheckCollection = PaycheckCollection.fromString(savedPaycheckData);

  return (
    <div className="App">
      <button onClick={() => setSavedPaycheckData("[]")}>
        Clear Paycheck Data
      </button>
      {paycheckCollection.length === 0 && (
        <IncomeForm
          onSubmit={(data) =>
            setSavedPaycheckData(new PaycheckCollection(data).stringify())
          }
        />
      )}
      {paycheckCollection.length > 0 && (
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
            <h2>Diagram</h2>
            <SankeyD3 data={paycheckCollection.sankeyD3Data} />
            <SankeyLink code={paycheckCollection.sankeymaticData}>
              View in SankeyMatic
            </SankeyLink>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
