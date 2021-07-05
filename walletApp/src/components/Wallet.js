import React, { Component } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import {Link} from "react-router-dom"

const Wallet = ({balance, decimals, conversion, symbol, localCurrency}) => (
      <div className="row justify-content-center">
        <div className="col-lg-4 col-sm-9 mt-5">
          <Card style={{width: "100%"}}>
            <div className="card-body text-center">
              <h4 className="card-title mb-4">Your Tiramisu Wallet</h4>
              <label>Current Balance</label>
              <p className="display-4"> {localCurrency}${Number(((balance * 10**(-decimals))*conversion).toFixed(2)).toLocaleString()}</p>
              <p className="card-text text-muted">Backed by {Number((balance * 10**(-decimals)).toFixed(2)).toLocaleString()} {symbol}</p>
              <Link to="pay"><i className="fas fa-chevron-circle-down"></i> Send/Receive Money</Link>
            </div>
          </Card>
        </div>
      </div>
)

export default Wallet
