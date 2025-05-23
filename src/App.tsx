import "./App.css";
import { useStickyState } from "./hooks";
import { IncomeSummaryTab } from "./tabs/IncomeSummaryTab";
import { Allocation, Expense, Paycheck } from "./data/items";
import { AllocationTab } from "./tabs/AllocationTab";
import { Tabster } from "./tabs/Tabster";
import { Diagram } from "./diagram/Diagram";
import {
  AllocationCollection,
  ExpenseCollection,
  PaycheckCollection,
  useCollection,
} from "./data/collections";
import LZString from "lz-string";
import { useEffect } from "react";

function App() {
  const [activeTab, setActiveTab] = useStickyState<number>("activeTab", 0);
  const { collection: expenseCollection, sideloadItems: sideloadExpenses } =
    useCollection<Expense, ExpenseCollection>(
      "expenses",
      (expenses) => new ExpenseCollection(expenses)
    );
  const {
    collection: allocationCollection,
    sideloadItems: sideloadAllocations,
  } = useCollection<Allocation, AllocationCollection>(
    "allocations",
    (allocations) => new AllocationCollection(allocations)
  );

  const { collection: paycheckCollection, sideloadItems: sideloadPaychecks } =
    useCollection<Paycheck, PaycheckCollection>(
      "paychecks",
      (paychecks) => new PaycheckCollection(paychecks),
      (paycheckRaw: any) => Paycheck.fromString(JSON.stringify(paycheckRaw))
    );

  const shareCode = LZString.compressToEncodedURIComponent(
    JSON.stringify({
      paychecks: paycheckCollection.itemList,
      expenses: expenseCollection.itemList,
      allocations: allocationCollection.itemList,
    })
  );
  const url = new URL(window.location.href);
  url.searchParams.set("d", shareCode);
  const shareLink = url.toString();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("d");
    if (data) {
      const decompressedData = LZString.decompressFromEncodedURIComponent(data);
      if (decompressedData) {
        const parsedData = JSON.parse(decompressedData);
        const { paychecks, expenses, allocations } = parsedData;

        sideloadPaychecks(JSON.stringify(paychecks));
        sideloadExpenses(JSON.stringify(expenses));
        sideloadAllocations(JSON.stringify(allocations));

        // Clear the URL parameters
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }
  }, [sideloadAllocations, sideloadExpenses, sideloadPaychecks]);

  return (
    <div className="App">
      {paycheckCollection.length === 0 && (
        <IncomeSummaryTab paycheckCollection={paycheckCollection} />
      )}
      {paycheckCollection.length > 0 && (
        <>
          <div>
            <div className="share-link">
              <label htmlFor="share-link-input">Share link:</label>
              <input
                name="share-link-input"
                type="text"
                onFocus={(e) => e.currentTarget.select()}
                value={shareLink}
              ></input>
              <button onClick={() => navigator.clipboard.writeText(shareLink)}>
                Copy
              </button>
            </div>
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
            mode={activeTab === 0 ? "income" : "allocation"}
          />
        </>
      )}
    </div>
  );
}

export default App;
