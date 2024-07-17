import React from 'react'
import FooterComponent from '../components/FooterComponent';
import Navbar from '../components/Navbar';
import { Row, Col, Card } from 'react-bootstrap';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

const AboutUs = () => {
  return (
    <><Navbar /><div><br></br>
    <div style={{ margin: '100px' }}></div>
    <div style={{padding: '0 75px'}}>
      <React.Fragment>
        <h1>We Have Other Branches Also</h1>
        <div className="container text-center">
  <div className="row">
    <div className="col"><div className="card">
  <img src="..." className="card-img-top" alt="..." />
  <div className="card-body">
    <h5 className="card-title">Card title</h5>
    <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
    <a href="#" className="btn btn-primary">Go somewhere</a>
  </div>
</div></div>

    <div className="col"><div className="card">
  <img src="..." className="card-img-top" alt="..." />
  <div className="card-body">
    <h5 className="card-title">Card title</h5>
    <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
    <a href="#" className="btn btn-primary">Go somewhere</a>
  </div>
</div></div>

    <div className="col"><div className="card" >
  <img src="..." className="card-img-top" alt="..." />
  <div className="card-body">
    <h5 className="card-title">Card title</h5>
    <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
    <a href="#" className="btn btn-primary">Go somewhere</a>
  </div>
</div></div>

  </div>
</div>
      </React.Fragment>
      </div>

      <FooterComponent />
    </div></>
  )
}

export default AboutUs
