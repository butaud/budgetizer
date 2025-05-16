import { useState } from "react";

import "./Tabster.css";

export type TabsterTab = {
  label: string;
  content: React.ReactNode;
};
export type TabsterProps = {
  tabs: TabsterTab[];
};

export const Tabster: React.FC<TabsterProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="tabster">
      <div className="tabster-tabs">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tabster-tab ${activeTab === index ? "active" : ""}`}
            onClick={() => setActiveTab(index)}
            disabled={activeTab === index}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabster-content">{tabs[activeTab].content}</div>
    </div>
  );
};
