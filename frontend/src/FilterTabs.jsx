import React from 'react';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'done', label: 'Done' },
];

export default function FilterTabs({ value, onChange }) {
  return (
    <div className="filter-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={tab.key === value ? 'tab active' : 'tab'}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
