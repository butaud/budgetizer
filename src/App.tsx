import "./App.css";
import { useStickyState } from "./hooks";
import { IncomeSummaryTab } from "./tabs/IncomeSummaryTab";
import { Allocation, Expense, Paycheck } from "./data/items";
import { AllocationTab } from "./tabs/AllocationTab";
import { Tabster } from "./tabs/Tabster";
import { ExpensesTab } from "./tabs/ExpensesTab";
import { Diagram } from "./diagram/Diagram";
import {
  AllocationCollection,
  ExpenseCollection,
  PaycheckCollection,
  useCollection,
} from "./data/collections";

function App() {
  const [activeTab, setActiveTab] = useStickyState<number>("activeTab", 0);
  const expenseCollection = useCollection<Expense, ExpenseCollection>(
    "expenses",
    (expenses) => new ExpenseCollection(expenses)
  );
  const allocationCollection = useCollection<Allocation, AllocationCollection>(
    "allocations",
    (allocations) => new AllocationCollection(allocations)
  );

  const paycheckCollection = useCollection<Paycheck, PaycheckCollection>(
    "paychecks",
    (paychecks) => new PaycheckCollection(paychecks),
    (paycheckRaw: any) => Paycheck.fromString(JSON.stringify(paycheckRaw))
  );

  return (
    <div className="App">
      {paycheckCollection.length === 0 && (
        <IncomeSummaryTab paycheckCollection={paycheckCollection} />
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
                    <IncomeSummaryTab paycheckCollection={paycheckCollection} />
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
                      allocationCollection={allocationCollection}
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
