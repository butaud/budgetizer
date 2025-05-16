import "./App.css";
import { useStickyState } from "./hooks";
import { IncomeForm } from "./income/IncomeForm";
import { IncomeSummaryTab } from "./tabs/IncomeSummaryTab";
import { Expense, ExpenseCollection, PaycheckCollection } from "./schema";
import { SpendingTab } from "./tabs/SpendingTab";
import { Tabster } from "./tabs/Tabster";
import { ExpensesTab } from "./tabs/ExpensesTab";
import { Diagram } from "./diagram/Diagram";

function App() {
  const [savedPaycheckData, setSavedPaycheckData] = useStickyState<string>(
    "paycheckData",
    "[]"
  );
  const [expenses, setExpenses] = useStickyState<Expense[]>("expenses", []);

  const paycheckCollection = PaycheckCollection.fromString(savedPaycheckData);
  const expenseCollection = new ExpenseCollection(expenses);

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
                {
                  label: "Expenses",
                  content: (
                    <ExpensesTab
                      expenses={expenses}
                      setExpenses={setExpenses}
                    />
                  ),
                },
              ]}
            />
          </div>
          <Diagram
            paycheckCollection={paycheckCollection}
            expenseCollection={expenseCollection}
          />
        </>
      )}
    </div>
  );
}

export default App;
