import {
  AllocationCollection,
  PaycheckCollection,
  SankeyData,
} from "../schema";
import { SankeyD3 } from "./SankeyD3";
import { SankeyLink } from "./SankeyLink";

import "./Diagram.css";
import { useState } from "react";
import { ExpenseCollection } from "../data/collection";

export type DiagramProps = {
  paycheckCollection: PaycheckCollection;
  expenseCollection: ExpenseCollection;
  allocationCollection: AllocationCollection;
  mode: "income" | "expenses" | "allocation";
};

export const Diagram = ({
  paycheckCollection,
  expenseCollection,
  allocationCollection,
  mode,
}: DiagramProps) => {
  const [focused, setFocused] = useState(false);
  const sankeyData = new SankeyData([]);
  const errors: string[] = [];
  if (mode === "income") {
    sankeyData.append(paycheckCollection.sankeyData);
  }
  if (mode === "expenses") {
    sankeyData.append(expenseCollection.sankeyData);
  }
  if (mode === "allocation") {
    if (!focused) {
      sankeyData.append(paycheckCollection.sankeyData);
    }
    if (allocationCollection.salaryTotal > paycheckCollection.nonBonusNetPay) {
      errors.push("Salary allocation exceeds salary take-home pay.");
    }
    if (
      allocationCollection.irregularTotal > paycheckCollection.irregularIncome
    ) {
      errors.push("Irregular income allocation exceeds irregular income.");
    }
    sankeyData.append(allocationCollection.sankeyData);
    sankeyData.append([
      {
        source: "Irregular Income",
        target: "Unallocated Spending",
        value:
          paycheckCollection.irregularIncome -
          allocationCollection.irregularTotal,
      },
      {
        source: "Salary Take-Home",
        target: "Unallocated Spending",
        value:
          paycheckCollection.nonBonusNetPay - allocationCollection.salaryTotal,
      },
    ]);
    expenseCollection.expenseList.forEach((expense) => {
      const allocatedAmount = allocationCollection.getAllocatedAmount(
        expense.name
      );
      const unallocatedAmount = expense.amount - allocatedAmount;

      if (allocatedAmount > expense.amount) {
        errors.push(
          `Allocation for ${expense.name} exceeds the total amount of ${expense.amount}.`
        );
      }
      if (unallocatedAmount > 0) {
        sankeyData.append([
          {
            source: "Unallocated Spending",
            target: expense.name,
            value: unallocatedAmount,
          },
        ]);
      }
    });

    // Calculate shortfall or surplus
    const netIncome =
      paycheckCollection.irregularIncome + paycheckCollection.nonBonusNetPay;
    const totalExpenses = expenseCollection.total;
    const diff = netIncome - totalExpenses;
    if (diff < 0) {
      sankeyData.append([
        {
          source: "Shortfall",
          target: "Unallocated Spending",
          value: Math.abs(diff),
          sourceColor: "#d62728", // red
        },
      ]);
    } else if (diff > 0) {
      sankeyData.append([
        {
          source: "Unallocated Spending",
          target: "Surplus",
          value: diff,
          targetColor: "#2ca02c", // green
        },
      ]);
    }
  }
  const height = mode === "allocation" ? 600 : 500;
  return (
    <div className="diagram">
      {mode === "allocation" && (
        <label>
          <input
            type="checkbox"
            checked={focused}
            onChange={() => setFocused(!focused)}
          />
          Focused
        </label>
      )}
      {errors.map((error, index) => (
        <p key={index} className="error">
          Error: {error}
        </p>
      ))}
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
