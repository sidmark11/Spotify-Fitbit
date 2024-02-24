import React from 'react'
import { Link } from 'react-router-dom'


function CardItems(props) {
const text = props.text
const var_className = props.className
const newText = text.split("**").map(str => <p>{str}</p>);
  return (
    <>
        <li className='cards__item'>
            {/* we passed props from the card.js file, we can call them using props.propName */}
            <Link className='cards__item__link' to={props.path}>
                <div className='cards__item__info'>
                    <h4 className={` cards__item__text ${var_className}`} style={{ whiteSpace: 'pre-wrap' }}>{newText}</h4>
                </div>
                <div className='cards__item__badge' data-category={props.badge_text}></div>
            </Link>
        </li>
    </>
  )
}




export default CardItems
