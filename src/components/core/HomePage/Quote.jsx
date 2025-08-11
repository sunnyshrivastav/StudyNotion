import React from 'react'
import HightlightText from "../HomePage/HighlightText"


function Quote() {
  return (
    <div>
      We are passionate about revolutionizing the way we learn. Our innovative platform
      <HightlightText text={"combines technology"}/>
      <span className='text-brown-800'>
        {" expertiess"}
      </span>
      , and community to create an 
      <span className='text-brown-50'>
        {" unparalleled educational experience."}
      </span>
    </div>
  )
}

export default Quote
