import { FC } from "react";
import {
  Allocation,
  AllocationCollection,
  ExpenseCollection,
  PaycheckCollection,
} from "../schema";

import "./AllocationTab.css";

export type AllocationTabProps = {
  allocations: Allocation[];
  paycheckCollection: PaycheckCollection;
  expenseCollection: ExpenseCollection;
  setAllocations: (allocations: Allocation[]) => void;
};

const Total: FC<{ label: string; allocated: number; total: number }> = ({
  label,
  allocated,
  total,
}) => (
  <div className={"total" + (allocated > total ? " error" : "")}>
    <strong>{label}</strong>: $
    {allocated.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}{" "}
    / $
    {total.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}
  </div>
);

export const AllocationTab: FC<AllocationTabProps> = ({
  allocations,
  setAllocations,
  paycheckCollection,
  expenseCollection,
}) => {
  const changeAllocation = (index: number, allocation: Allocation) => {
    const updatedAllocations = [...allocations];
    updatedAllocations[index] = allocation;
    setAllocations(updatedAllocations);
  };
  const addAllocation = (newAllocation: Allocation) => {
    setAllocations([...allocations, newAllocation]);
  };
  const deleteAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const allocationCollection = new AllocationCollection(allocations);
  return (
    <div className="allocation-tab">
      <div className="totals">
        <Total
          label="Salary Take-Home"
          allocated={allocationCollection.salaryTotal}
          total={paycheckCollection.nonBonusNetPay}
        />
        <Total
          label="Irregular Income"
          allocated={allocationCollection.irregularTotal}
          total={paycheckCollection.irregularIncome}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((allocation, index) => (
            <tr key={index}>
              <td>
                <select
                  value={allocation.from}
                  onChange={(e) => {
                    if (
                      e.target.value === "Salary Take-Home" ||
                      e.target.value === "Irregular Income"
                    ) {
                      changeAllocation(index, {
                        ...allocation,
                        from: e.target.value,
                      });
                    }
                  }}
                >
                  <option value="Salary Take-Home">Salary Take-Home</option>
                  <option value="Irregular Income">Irregular Income</option>
                </select>
              </td>
              <td>
                <select
                  value={allocation.to}
                  onChange={(e) =>
                    changeAllocation(index, {
                      ...allocation,
                      to: e.target.value,
                    })
                  }
                >
                  <option value="Unallocated Spending">
                    Unallocated Spending
                  </option>
                  {expenseCollection.names.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={allocation.value}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    changeAllocation(index, {
                      ...allocation,
                      value: parseFloat(e.target.value),
                    })
                  }
                />
              </td>
              <td>
                <button onClick={() => deleteAllocation(index)}>X</button>
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <button
                onClick={() =>
                  addAllocation({
                    from: "Salary Take-Home",
                    to: "Unallocated Spending",
                    value: 0,
                  })
                }
              >
                + Add Allocation
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
