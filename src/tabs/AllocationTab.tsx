import { FC } from "react";
import {
  Allocation,
  AllocationCollection,
  ExpenseCollection,
  PaycheckCollection,
} from "../schema";

import "./AllocationTab.css";
import ReactSlider from "react-slider";

export type AllocationTabProps = {
  allocations: Allocation[];
  paycheckCollection: PaycheckCollection;
  expenseCollection: ExpenseCollection;
  setAllocations: (allocations: Allocation[]) => void;
};

const Total: FC<{
  label: string;
  allocated: number;
  total: number;
  className?: string;
}> = ({ label, allocated, total, className }) => (
  <div
    className={
      "total" +
      (allocated > total ? " error" : "") +
      (className ? " " + className : "")
    }
  >
    <div className="label">{label}</div>
    <div className="value">
      {" "}
      $
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
  </div>
);

export const AllocationTab: FC<AllocationTabProps> = ({
  allocations,
  setAllocations,
  paycheckCollection,
  expenseCollection,
}) => {
  const expenseSliderValues = expenseCollection.expenseList.map((expense) => {
    const salaryAllocation = allocations.find(
      (allocation) =>
        allocation.to === expense.name && allocation.from === "Salary Take-Home"
    );
    const irregularAllocation = allocations.find(
      (allocation) =>
        allocation.to === expense.name && allocation.from === "Irregular Income"
    );
    const salaryValue = salaryAllocation?.value ?? 0;
    const irregularValue = expense.amount - (irregularAllocation?.value ?? 0);
    return { expense, values: [salaryValue, irregularValue] };
  });
  const allocationCollection = new AllocationCollection(allocations);
  return (
    <div className="allocation-tab">
      <Total
        label="Salary Take-Home"
        allocated={allocationCollection.salaryTotal}
        total={paycheckCollection.nonBonusNetPay}
        className="salary"
      />
      <div className="sliders">
        {expenseSliderValues.map(({ expense, values }, index) => (
          <>
            <span>{expense.name}</span>
            <ReactSlider
              className="horizontal-slider"
              thumbClassName="example-thumb"
              trackClassName="example-track"
              key={expense.name}
              min={0}
              max={expense.amount}
              step={1}
              pearling
              value={values}
              renderTrack={(props, state) => (
                <div {...props}>
                  {state.index === 0
                    ? values[0]
                    : state.index === 2
                    ? expense.amount - values[1]
                    : ""}
                </div>
              )}
              onChange={(newValues) => {
                const salaryAllocation = allocations.find(
                  (allocation) =>
                    allocation.to === expense.name &&
                    allocation.from === "Salary Take-Home"
                );
                const irregularAllocation = allocations.find(
                  (allocation) =>
                    allocation.to === expense.name &&
                    allocation.from === "Irregular Income"
                );
                const newSalaryAllocation: Allocation = {
                  from: "Salary Take-Home",
                  to: expense.name,
                  value: newValues[0],
                };
                const newIrregularAllocation: Allocation = {
                  from: "Irregular Income",
                  to: expense.name,
                  value: expense.amount - newValues[1],
                };
                const updatedAllocations = [...allocations];
                if (salaryAllocation) {
                  updatedAllocations[allocations.indexOf(salaryAllocation)] =
                    newSalaryAllocation;
                } else {
                  updatedAllocations.push(newSalaryAllocation);
                }
                if (irregularAllocation) {
                  updatedAllocations[allocations.indexOf(irregularAllocation)] =
                    newIrregularAllocation;
                } else {
                  updatedAllocations.push(newIrregularAllocation);
                }
                setAllocations(updatedAllocations);
              }}
            />
          </>
        ))}
      </div>
      <Total
        label="Irregular Income"
        allocated={allocationCollection.irregularTotal}
        total={paycheckCollection.irregularIncome}
        className="irregular"
      />
    </div>
  );
};
