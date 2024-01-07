import React from 'react'
import './button.css'
import { Link } from 'react-router-dom'

//creating an array of button styles
const STYLES = ['btn--primary', 'btn--outline'];

const SIZES = ['btn--medium', 'btn--large'];

//when using export const and explicitly defining, we can have multiple exports in the same file/module
//then we can import like this: import { Button, other } from './button.js'; 

//children is a special prop in react, so, when we import it, we don't need to specify what the children are
    //eg, we don't need to say children='' because react knows what the children property is
    //for non-special (such as buttonStyle, type, and onClick), we need to specify them
export const Button = ({
    children, 
    type, 
    onClick, 
    buttonStyle, 
    buttonSize,
    route}) => {
    // if the styles array has the buttonStyle argument, the checkButtonStyle = the arg, else it equals the default first val
    const checkButtonStyle = STYLES.includes(buttonStyle) ? buttonStyle : STYLES[0];
    const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0];

    //puts a button over the link to the sign-up page
    return (
        <Link to={`${route}`} className='btn-mobile'>
            <button
            //`` allows us to put in template literals (${checkButtonSize}) whereas '' doesn't
            className={`btn ${checkButtonStyle} ${checkButtonSize}`} // how does adding template literals give the right classname for styling?
            onClick={onClick}
            type={type}>
                {children}
            </button>
        </Link>
    )
};