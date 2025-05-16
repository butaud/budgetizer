import { FC } from "react";
import { PaycheckCollection } from "../schema";

import "./IncomeSummaryTab.css";

export type IncomeSummaryTabProps = {
  paycheckCollection: PaycheckCollection;
  onClear: () => void;
};

export const IncomeSummaryTab: FC<IncomeSummaryTabProps> = ({
  paycheckCollection,
  onClear,
}) => {
  return (
    <div className="income-summary">
      <button className="clear-button" onClick={onClear}>
        Clear Income Data
      </button>
      <ul>
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
    </div>
  );
};
