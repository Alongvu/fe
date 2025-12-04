import React from 'react'
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
        <div className="descriptionbox-navigator">
            <div className="descriptionbox-nav-box">Description</div>
            <div className="descriptionbox-nav-box fade">Reviews (122)</div>
        </div>
        <div className="descriptionbox-description">
            <p>An e-commerce wedsite is an online flatform that facilitates the buying and selling of products of services over the internet.It servers as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions wwithout the need for a physical presence.E-commerce wedsites have gained immense popalarity due to their convenience, accessibility, and the global reach the offer.</p>
            <p>
                E-commerce wedsites typically display products or servicer along with detailed descriptions,images,prices,and any avaiable variations(e.g,size,colors).Earch product usually has its own dedicated page with relevant information.
            </p>
        </div>
    </div>
  )
}
export default DescriptionBox