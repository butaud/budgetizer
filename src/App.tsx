import "./App.css";
import { useStickyState } from "./hooks";
import { IncomeForm } from "./income/IncomeForm";
import { IncomeSummaryTab } from "./IncomeSummaryTab";
import { SankeyD3 } from "./SankeyD3";
import { SankeyLink } from "./SankeyLink";
import { PaycheckCollection } from "./schema";
import { SpendingTab } from "./SpendingTab";
import { Tabster } from "./Tabster";

function App() {
  const [savedPaycheckData, setSavedPaycheckData] = useStickyState<string>(
    "paycheckData",
    "[]"
  );

  const paycheckCollection = PaycheckCollection.fromString(savedPaycheckData);

  return (
    <div className="App">
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
            <Tabster
              tabs={[
                {
                  label: "Income",
                  content: (
                    <IncomeSummaryTab
                      paycheckCollection={paycheckCollection}
                      onClear={() => setSavedPaycheckData("[]")}
                    />
                  ),
                },
                {
                  label: "Spending",
                  content: <SpendingTab />,
                },
              ]}
            />
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
