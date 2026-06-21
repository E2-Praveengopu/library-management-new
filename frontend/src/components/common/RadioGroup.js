import React from 'react';
import '../../styles/RadioGroup.css';

function RadioGroup({ label, name, value, onChange, options }) {
  return (
    <div className="form-field-group-full">
      <label className="form-label">{label}</label>
      <div className="radio-group">
        {options.map((option) => (
          <label key={option.value} className="radio-option-label">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="radio-input"
            />
            <span className="radio-text">
              <strong>{option.label}</strong>
              <span className="radio-desc">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default RadioGroup;
