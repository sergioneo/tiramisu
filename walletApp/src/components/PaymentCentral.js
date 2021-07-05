import React, { Component } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import {Link} from "react-router-dom"

class PaymentCentral extends Component {

  constructor(props) {
    super(props)
    this.state = {order: false, loading: true, currencyConversion: 0, paymentHash: ""}
  }

  render() {
    return(
      <div className="row justify-content-center">
        <div className="col-lg-4 col-sm-9 mt-5">
          <Card style={{width: "100%"}}>
            <div className="card-body text-center">
              <h4 className="card-title mb-4">Send/Receive Money</h4>
              <Link to="">
                <Button variant="primary" className="w-100 mb-2">Send Money</Button>
              </Link>
              <Link to="/receive">
                <Button variant="primary" className="w-100 mb-2">Receive Money</Button>
              </Link>
              <Link to="">
                <Button variant="primary" className="w-100 mb-5">Pay an existing order</Button>
              </Link>
              <Link to="vaults"><i className="fas fa-chevron-circle-down"></i> Vault Settings</Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }
}

export default PaymentCentral
