import { ExpenseCollection, PaycheckCollection, SankeyData } from "../schema";
import { SankeyD3 } from "./SankeyD3";
import { SankeyLink } from "./SankeyLink";

export type DiagramProps = {
  paycheckCollection: PaycheckCollection;
  expenseCollection: ExpenseCollection;
  mode: "income" | "expenses" | "allocation";
};

export const Diagram = ({
  paycheckCollection,
  expenseCollection,
  mode,
}: DiagramProps) => {
  const sankeyData = new SankeyData([]);
  if (mode === "income" || mode === "allocation") {
    sankeyData.append(paycheckCollection.sankeyData);
  }
  if (mode === "expenses" || mode === "allocation") {
    sankeyData.append(expenseCollection.sankeyData);
  }
  if (mode === "allocation") {
    sankeyData.append([
      {
        source: "Irregular Income",
        target: "Unallocated Spending",
        value: paycheckCollection.irregularIncome,
      },
      {
        source: "Salary Take-Home",
        target: "Unallocated Spending",
        value: paycheckCollection.nonBonusNetPay,
      },
      {
        source: "Unallocated Spending",
        target: "Expenses",
        value: expenseCollection.total,
      },
    ]);
  }
  const height = mode === "allocation" ? 600 : 500;
  return (
    <div>
      <h2>Diagram</h2>
      <SankeyD3 data={sankeyData.sankeyD3Data} width={1000} height={height} />
      <SankeyLink
        code={sankeyData.sankeymaticData}
        width={1000}
        height={height}
      >
        View in SankeyMatic
      </SankeyLink>
    </div>
  );
};
