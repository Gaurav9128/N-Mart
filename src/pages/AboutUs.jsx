import React,{ useState }from 'react'
import FooterComponent from '../components/FooterComponent';
import Navbar from '../components/Navbar';
import {Button,Modal,Row,Card,Col,Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const AboutUs = () => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  return (
    <><Navbar /><div><br></br>
    <div style={{ margin: '100px' }}></div>
    <div style={{padding: '0 75px'}}>
      <React.Fragment>
       <b> <h1>We Have Other Branches Also</h1><br/><br/></b>
        <div className="container text-center">
  <div className="row">
    <div className="col"><div className="card">
 
  <div className="card-body">
    <b><h5 className="card-title">NISHITA TRADING</h5></b><br/>
    <u><p className="card-text">WHOLESALERS OF COSMETICS</p>
    <p className="card-text">& PARLOUR PRODUCTS.</p></u><br/>
    <Button 
    variant="primary" 
    onClick={handleOpenModal}
    >
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                                Location
                            </Button>
                            
  </div>
</div></div>
<Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3571.9340166562!2d74.63045197571323!3d26.457855776921242!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396be716f2349cdf%3A0xe818727c88c019cc!2sNishita%20trading!5e0!3m2!1sen!2sin!4v1721273135010!5m2!1sen!2sin"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="col"><div className="card">
 
  <div className="card-body">
    <b><h5 className="card-title">NEW FASHIONS</h5></b><br/>
    <u><p className="card-text">Deals in all kinds of Imitation Jewellery, Necklace Set, Rajputi Set, Bridal Set,Bindi</p>
    <p className="card-text">All types of Hair Band Pin,Clip,Safety Pin all Items at wholesale Rate.</p></u><br/>
    <Button 
    variant="primary" 
    onClick={handleOpenModal}
    >
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                                Location
                            </Button>
                            
  </div>
</div></div>
<Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3571.8923008399315!2d74.62976088384028!3d26.459200317411366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396be71c92afcf7b%3A0x6268d9cef1a705d7!2sNew%20Fashions!5e0!3m2!1sen!2sin!4v1721274159412!5m2!1sen!2sin" 
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>


  <div className="col"><div className="card">
  <Container className="my-4">
 <div className="card-body">
   <b><h5 className="card-title">NEW LAXMI SUHAG BHANDAR</h5></b><br/>
   <u><p className="card-text">Deals in all kinds of Glass, Seep,Plastic,Metal,LakhBangles,Golden Kada</p>
   <p className="card-text">All types of Gota, Lace,Saree Fall in Wholesale Rate.</p></u><br/>
   <Button 
   variant="primary" 
   onClick={handleOpenModal}
   >
                               <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                               Location
                           </Button>
                           
 </div>
 </Container>
</div></div>

<Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3571.900564496638!2d74.63131157571323!3d26.458933976920488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396be71b88a63899%3A0x3dbd4725cf0df7d3!2sNew%20Laxmi%20Suhag%20Bhandar!5e0!3m2!1sen!2sin!4v1721274969400!5m2!1sen!2sin"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>


            <Row className="justify-content-center">
                <Col md={4} className="mb-5">
                    <Card className="text-center">
                        <Card.Body>
                            <b><h5 className="card-title">NISHITA Bangles</h5></b><br/>
                            <u>
                                <p className="card-text">Wholesaler and Manufactures of Bangles And Bindi</p>
                               
                            </u><br/>
                            <Button                         
   variant="primary" 
   onClick={handleOpenModal}
   >
                               <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                               Location
                           </Button>
                           
                           </Card.Body>
                    </Card>
                </Col>
            </Row>



<Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Location</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3571.9340166562!2d74.63045197571323!3d26.457855776921242!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396be716f2349cdf%3A0xe818727c88c019cc!2sNishita%20trading!5e0!3m2!1sen!2sin!4v1721273135010!5m2!1sen!2sin"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
    

  </div>
</div>
      </React.Fragment>
      </div>

      <FooterComponent />
    </div></>
  )
}

export default AboutUs
