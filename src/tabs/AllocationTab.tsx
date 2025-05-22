import { FC, Fragment } from "react";
import { Allocation } from "../schema";

import "./AllocationTab.css";
import ReactSlider from "react-slider";
import {
  AllocationCollection,
  ExpenseCollection,
  PaycheckCollection,
} from "../data/collection";

export type AllocationTabProps = {
  allocationCollection: AllocationCollection;
  paycheckCollection: PaycheckCollection;
  expenseCollection: ExpenseCollection;
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
  allocationCollection,
  paycheckCollection,
  expenseCollection,
}) => {
  const expenseSliderValues = expenseCollection.itemList.map((expense) => {
    const salaryAllocation = allocationCollection.itemList.find(
      (allocation) =>
        allocation.to === expense.name && allocation.from === "Salary Take-Home"
    );
    const irregularAllocation = allocationCollection.itemList.find(
      (allocation) =>
        allocation.to === expense.name && allocation.from === "Irregular Income"
    );
    const salaryValue = salaryAllocation?.value ?? 0;
    const irregularValue = expense.amount - (irregularAllocation?.value ?? 0);
    return { expense, values: [salaryValue, irregularValue] };
  });
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
          <Fragment key={expense.name}>
            <span>{expense.name}</span>
            <ReactSlider
              className="horizontal-slider"
              thumbClassName="example-thumb"
              trackClassName="example-track"
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
                allocationCollection.upsertItem(newSalaryAllocation);
                allocationCollection.upsertItem(newIrregularAllocation);
              }}
            />
          </Fragment>
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
