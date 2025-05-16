import { ExpenseCollection, PaycheckCollection } from "../schema";
import { SankeyD3 } from "./SankeyD3";
import { SankeyLink } from "./SankeyLink";

export type DiagramProps = {
  paycheckCollection: PaycheckCollection;
  expenseCollection: ExpenseCollection;
};

export const Diagram = ({
  paycheckCollection,
  expenseCollection,
}: DiagramProps) => {
  const sankeyData = paycheckCollection.sankeyData;
  if (expenseCollection.length > 0) {
    sankeyData.append(expenseCollection.sankeyData);
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
  return (
    <div>
      <h2>Diagram</h2>
      <SankeyD3 data={sankeyData.sankeyD3Data} width={1000} height={600} />
      <SankeyLink code={sankeyData.sankeymaticData} width={1000} height={600}>
        View in SankeyMatic
      </SankeyLink>
    </div>
  );
};
