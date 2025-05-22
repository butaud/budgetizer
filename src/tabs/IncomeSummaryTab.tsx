import { FC } from "react";

import "./IncomeSummaryTab.css";
import { PaycheckCollection } from "../data/collections";
import { IncomeForm } from "../income/IncomeForm";

export type IncomeSummaryTabProps = {
  paycheckCollection: PaycheckCollection;
};

export const IncomeSummaryTab: FC<IncomeSummaryTabProps> = ({
  paycheckCollection,
}) => {
  const onClear = () => {
    paycheckCollection.empty();
  };
  return (
    <div className="income-summary">
      <div className="income-summary-header">
        <ul>
          <li>
            <strong>
              Total Gross Pay from {paycheckCollection.length} paychecks:
            </strong>
            {" $"}
            {paycheckCollection.grossPay.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </li>
          <li>
            <strong>Total Bonus Net Pay:</strong> $
            {paycheckCollection.bonusNetPay.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </li>
          <li>
            <strong>Total Non-Bonus Net Pay:</strong> $
            {paycheckCollection.nonBonusNetPay.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </li>
          <li>
            <strong>Total Net Stock Vestings:</strong> $
            {paycheckCollection.netStockVestings.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </li>
          <li>
            <strong>Effective Tax Rate:</strong>{" "}
            {(
              paycheckCollection.taxesWithheld /
              paycheckCollection.taxableEarnings
            ).toLocaleString("en-US", {
              style: "percent",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </li>
        </ul>
        <button
          className="clear-button"
          onClick={onClear}
          disabled={paycheckCollection.length === 0}
        >
          Clear Income Data
        </button>
      </div>
      <IncomeForm paycheckCollection={paycheckCollection} />
    </div>
  );
};
