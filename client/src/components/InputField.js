import React from 'react';
import './Dropdown.css'; 
function InputField({ placeholder, onChange}) {
  return (
    <input
      type="text"
      className="inputField"
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default InputField;
