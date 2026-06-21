import React from 'react';
import '../../styles/FormInput.css';

function FormInput({ label, type = 'text', name, value, onChange, placeholder, required, wrapperClassName = 'form-field-group-full' }) {
  return (
    <div className={wrapperClassName}>
      <label className="form-label">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="form-input"
      />
    </div>
  );
}

export default FormInput;
