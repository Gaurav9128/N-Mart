import React from 'react'
import FooterComponent from '../components/FooterComponent';
import Navbar from '../components/Navbar';
import { Container, Row, Col, Card } from 'react-bootstrap';

const AboutUs = () => {
  return (
    <><Navbar /><div><br></br>
    <div style={{ margin: '100px' }}></div>
    <div style={{padding: '0 75px'}}>
      <b>--AboutUs--</b>
      <br></br><br></br>
      <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header as="h2" className="text-center">
                            About Us
                        </Card.Header>
                        <Card.Body>
                            <Card.Text>
                                <p>
                                    Welcome to our company! We are dedicated to providing the best services in the industry. Our team of experts is committed to delivering top-notch solutions that meet the needs of our clients.
                                </p>
                                <p>
                                    Our mission is to innovate and lead the market with our exceptional services. We value integrity, quality, and customer satisfaction above all else.
                                </p>
                                <p>
                                    Thank you for choosing us. We look forward to working with you and achieving great success together.
                                </p>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
      </div>

      <FooterComponent />
    </div></>
  )
}

export default AboutUs
