import React from 'react'
import FooterComponent from '../components/FooterComponent';
import Navbar from '../components/Navbar'

const PrivacyPolicy = () => {
  return (
    <><Navbar /><div><br></br>
    <div style={{ margin: '100px' }}></div>
    <div style={{padding: '0 75px'}}>
      <b>--Pricing Policy--</b>
      <br></br><br></br>
      1. Pricing and Currency<br></br><br></br>
      <b>1.1 Currency</b>
      All prices listed on our website are in [INR] and are subject to change without notice.<br></br><br></br>

      <b>1.2 Price Changes</b>
      N-mart reserves the right to change prices at any time without prior notice.
      Price changes will not affect orders that have already been placed and confirmed.<br></br><br></br>

      <b>1.3 Promotional Pricing</b>
      We may offer promotional pricing on certain products or for certain periods.
      These promotions are subject to specific terms and conditions, which will be communicated at the time of the promotion.<br></br><br></br>
      <b>1.4 Taxes and Duties</b>
      Prices do not include applicable taxes, duties, or shipping charges.
      These will be calculated and added to your total order amount during the checkout process.<br></br><br></br>

      <b>Delivery Policy</b><br></br><br></br>
      <b>1. Shipping and Delivery </b><br></br><br></br>

      <b>1.1 Shipping Methods</b>
      We offer various shipping methods to meet your needs. Shipping options will be presented at checkout,
      and you can choose the one that best suits your requirements.<br></br><br></br>

      <b>1.2 Shipping Charges</b>
      Shipping charges are calculated based on the weight and dimensions of your order,
      as well as the delivery location. These charges will be displayed at checkout.<br></br><br></br>

      <b>1.3 Delivery Timeframes</b>
      Estimated delivery times will be provided at checkout. While we strive to deliver your order within the estimated timeframe,
      delays may occur due to unforeseen circumstances.<br></br><br></br>

      <b>1.4 Order Tracking</b>
      Once your order has been shipped, you will receive a confirmation email with tracking information.
      You can use this information to track the status of your delivery.<br></br><br></br><br></br>


      <b>Return & Refund Policy</b><br></br>
      NO RETURN NO EXCHANGE..<br/><br/> 

      {/* "If by mistake an expired product is received, you can exchange it at the shop within 7 days or request a refund." */}
      "We'll deliver the product within 3-7 business days. If there is any delay, we will inform you via email or phone."
      
      </div>

      <FooterComponent />
    </div></>
  )
}

export default PrivacyPolicy
