import React from 'react'
import { Footer } from 'flowbite-react';

const FooterComponent = () => {
  return (
    <Footer container className=' border-t-2'>
      <div className="w-full bg-white">
        <div className="grid w-full md:grid-cols-4">
          <div className='col-span-1'>
            <img className='w-32 h-auto' src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2Fmartlogo.jpeg?alt=media&token=ee6e2494-2792-4ff4-9219-f9de328d566f" />
            <div className='flex gap-2'>
            <img className='w-32 h-auto' src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2Fappstore.svg?alt=media&token=847b3d40-1e77-4976-970e-f9c86e5883d5" />
            <img className='w-32 h-auto' src="https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2Fplaystore.svg?alt=media&token=5699433f-6e9d-4d34-9321-cf0cc87e4699" />
            </div>
          </div>
          <div></div>
          <div className="col-span-2 grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <Footer.Title title="FAQs" />
              <Footer.LinkGroup col>
                <Footer.Link href="#">Privacy Policy</Footer.Link>
                <Footer.Link href="#">Pricing, Delivery, Return & Refund Policy</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Follow us" />
              <Footer.LinkGroup>
                <Footer.Link href="#">
                  <img className='w-6 h-auto' src='https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2Ffacebook.svg?alt=media&token=074ee693-5cec-43b3-a8d3-c516825e4391' />
                </Footer.Link>
                <Footer.Link href="#">
                  <img className='w-6 h-auto' src='https://firebasestorage.googleapis.com/v0/b/ajmerstore-7d3af.appspot.com/o/assets%2Finstagram.svg?alt=media&token=5291bf6d-489c-40db-977e-bdb5f5caa8f0' />
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Others" />
              <Footer.LinkGroup col>
                <Footer.Link href="#">Contact Us</Footer.Link>
                <Footer.Link href="#">About Us</Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>
        </div>
        <Footer.Divider />
        <div className="w-full sm:flex sm:items-center sm:justify-between">
          <Footer.Copyright href="#" by="SG™" year={2024} />
          <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
          </div>
        </div>
      </div>
    </Footer>
  )
}

export default FooterComponent
