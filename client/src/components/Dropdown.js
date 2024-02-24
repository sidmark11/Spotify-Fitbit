import React, {useState} from 'react'
import Select from './select.js'
// props.genre will be genre array from playlist page
function Dropdown({options}) {
  const [menuShow, setMenuShow] = useState(false)
  const [selected, setSelected] = useState(options[0])

  const selectOption = e => {
    setSelected(e.target.innerText)
    setMenuShow(!menuShow)
  }

  const dropdownList = options.map((option, i) => 
    <li key={i} onClick={selectOption}>{option}</li>
  )
  return (
    <div className='dropdown'>
      <Select 
        menuShow={menuShow}
        setMenuShow={setMenuShow}
        selected={selected}
      />
    
      <ul className={`menu ${menuShow && 'menu-open'}`}>
        {dropdownList}
      </ul>
    </div>
  )
}

export default Dropdown
