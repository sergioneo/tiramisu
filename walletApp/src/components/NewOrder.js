import React, { Component } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { v4 as uuidv4 } from 'uuid';
import {Link} from "react-router-dom";
const PINATA_API_KEY= "20b4bc997e30c80bbe90"
const PINATA_API_SECRET = "bdd2dfa426c115084e096a41f3f8658cb032687b3d07af10fba77ad5722e7f60"
const PINATA_API_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MTQwNGQ3Zi05ZTc3LTQ4N2UtOWFkYS1kOTUyZDMzNDkyODIiLCJlbWFpbCI6InNlcmdpby55YW5lekBhbHVtbm9zLnVzbS5jbCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2V9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIyMGI0YmM5OTdlMzBjODBiYmU5MCIsInNjb3BlZEtleVNlY3JldCI6ImJkZDJkZmE0MjZjMTE1MDg0ZTA5NmE0MWYzZjg2NThjYjAzMjY4N2IzZDA3YWYxMGZiYTc3YWQ1NzIyZTdmNjAiLCJpYXQiOjE2MjQ3NTA3OTV9.Vv93zcV-Fw7ApC7Qh9eHLrWFCYfIlxO1l4f7Huu6MWk"

class Payment extends Component {

  constructor(props) {
    super(props)
    this.state = {orderHash: ""}
  }

  async submitToIPFS() {
    const web3 = this.props.web3
    const amount = this.state.price * 10**this.props.decimals
    const orderId = uuidv4()
    var hash = web3.utils.soliditySha3(amount, orderId).toString("hex");
    const completeSignature = await web3.eth.accounts.sign(hash, this.props.pvKey);
    var order = {
      "merchantId": 1,
      "orderId": orderId,
      "items": [
        {
          "SKU": "11223344",
          "title": this.state.productName,
          "price": amount.toString()
        }
      ],
      "currency": this.props.symbol,
      "currencyAddress": this.props.asset,
      "timestamp": Date.now(),
      "price": amount.toString(),
      "decimals": this.props.decimals,
      "status": "PENDING",
      "signature": completeSignature.signature,
      "payeeWallet": this.props.walletAddress
    }
    const pinataSDK = require('@pinata/sdk');
    const pinata = pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);
    pinata.pinJSONToIPFS(order).then((result) => {
        //handle results here
        console.log(result);
        console.log(result.IpfsHash)
        this.setState({orderHash: result.IpfsHash})
    }).catch((err) => {
        //handle error here
        console.log(err);
    });
  }

  myChangeHandler = (event) => {
    let nam = event.target.name;
    let val = event.target.value;
    this.setState({[nam]: val});
  }

  render() {
    if (this.state.orderHash === "") {
      return(
        <div className="row justify-content-center">
          <div className="col-lg-4 col-sm-9 mt-5">
            <Card style={{width: "100%"}}>
              <div className="card-body text-center">
                <h4 className="card-title mb-4">New Payment Request</h4>
                <form>
                  <div className="mb-3 text-left">
                    <label className="form-label">Product Name</label>
                    <input
                      className="form-control"
                      type='text'
                      name='productName'
                      onChange={this.myChangeHandler}
                    />
                  </div>
                  <div className="mb-3 text-left">
                    <label className="form-label">Product Price</label>
                    <input
                      className="form-control"
                      type='text'
                      name='price'
                      onChange={this.myChangeHandler}
                    />
                  </div>
                  <Button variant="success" type="button" onClick={this.submitToIPFS.bind(this)}>Create Order</Button>
                </form>
              </div>
            </Card>
          </div>
        </div>

      )
    } else {
      var QRCode = require('qrcode.react')
      var url = window.location.origin+"/pay/"+this.state.orderHash
      return(
        <div className="row justify-content-center">
          <div className="col-lg-4 col-sm-9 mt-5">
            <Card style={{width: "100%"}}>
              <div className="card-body text-center">
                <div>
                  <QRCode value={url} /><br></br>
                  <a href={url}>{this.state.orderHash}</a>
                  <br></br>
                  <Link to={"receive/watch/"+this.state.orderHash}>Progress</Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )
    }
  }
}

export default Payment
