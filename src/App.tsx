import "./App.css";
import { useStickyState } from "./hooks";
import { IncomeForm } from "./income/IncomeForm";
import { IncomeSummaryTab } from "./tabs/IncomeSummaryTab";
import { Allocation, AllocationCollection, PaycheckCollection } from "./schema";
import { AllocationTab } from "./tabs/AllocationTab";
import { Tabster } from "./tabs/Tabster";
import { ExpensesTab } from "./tabs/ExpensesTab";
import { Diagram } from "./diagram/Diagram";
import { useExpenseCollection } from "./data/collection";

function App() {
  const [savedPaycheckData, setSavedPaycheckData] = useStickyState<string>(
    "paycheckData",
    "[]"
  );
  const [activeTab, setActiveTab] = useStickyState<number>("activeTab", 0);
  const [allocations, setAllocations] = useStickyState<Allocation[]>(
    "allocations",
    []
  );
  const expenseCollection = useExpenseCollection();

  const paycheckCollection = PaycheckCollection.fromString(savedPaycheckData);
  const allocationCollection = new AllocationCollection(allocations);

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
              activeTab={activeTab}
              setActiveTab={setActiveTab}
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
                  label: "Expenses",
                  content: (
                    <ExpensesTab expenseCollection={expenseCollection} />
                  ),
                },
                {
                  label: "Allocation",
                  content: (
                    <AllocationTab
                      allocations={allocations}
                      setAllocations={setAllocations}
                      paycheckCollection={paycheckCollection}
                      expenseCollection={expenseCollection}
                    />
                  ),
                },
              ]}
            />
          </div>
          <Diagram
            paycheckCollection={paycheckCollection}
            expenseCollection={expenseCollection}
            allocationCollection={allocationCollection}
            mode={
              activeTab === 0
                ? "income"
                : activeTab === 1
                ? "expenses"
                : "allocation"
            }
          />
        </>
      )}
    </div>
  );
}

export default App;
