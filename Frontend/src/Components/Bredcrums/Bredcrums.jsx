import React from 'react'
import './Bredcrums.css'
import arrow_icon from "../Assets/breadcrum_arrow.png"

const Bredcrums = (props) => {
    const {product} = props
  return (
    <div className='breadcrum'>
        Home <img src={arrow_icon} alt="" /> Shop <img src={arrow_icon} alt="" />{product?.category} <img src={arrow_icon}  /> {product?.name}
    </div>
  )
}

export default Bredcrums