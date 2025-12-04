import React from 'react'
import Hero from '../Componnents/Hero/Hero'
import Popular from '../Componnents/Popular/Popular'
import Offers from '../Componnents/Offers/Offers'
import NewCollections from '../Componnents/NewCollections/NewCollections'
import { NewsLetter } from '../Componnents/NewsLetter/NewsLetter'

const Shop = () => {
  return (
    <div>
      <Hero />
      <Popular /> 
      <Offers />
      <NewCollections />
      <NewsLetter />
    </div>
  )
}

export default Shop
