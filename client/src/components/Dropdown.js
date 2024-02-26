import React, { useState, useEffect, useRef } from 'react';
import Select from './select'; 
import './Dropdown.css'; 

function Dropdown({ options, onSelect }) {
  const [menuShow, setMenuShow] = useState(false);
  const [selected, setSelected] = useState(options[0]);
  const dropdownRef = useRef(null); 

  const selectOption = (e) => {
    const newSelected = e.target.innerText;
    setSelected(newSelected);
    onSelect(newSelected); 
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuShow(false); 
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); 

  const dropdownList = options.map((option, i) => (
    <li key={i} onClick={selectOption}>{option}</li>
  ));

  return (
    <div className='dropdown' ref={dropdownRef}>
      <Select 
        menuShow={menuShow}
        setMenuShow={setMenuShow}
        selected={selected}
      />
      <ul className={`menu ${menuShow ? 'menu-open' : ''}`}>
        {dropdownList}
      </ul>
    </div>
  );
}

export default Dropdown;
