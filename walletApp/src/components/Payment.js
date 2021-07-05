import React, { Component } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { WALLET_ABI } from "../config"
import Web3 from 'web3'

class Payment extends Component {

  constructor(props) {
    super(props)
    this.state = {order: false, loading: true, currencyConversion: 0, paymentHash: "", expectedAmount: -1}
  }

  componentDidMount() {
      this.loadOrderData()
      this.loadStatus()
  }

  loadOrderData() {
    const wallet = this.props.wallet
    const orderId = this.props.id
    if (wallet === undefined) {
      setTimeout(this.loadOrderData.bind(this), 500)
      return
    }
    console.log(wallet)
    fetch("https://gateway.pinata.cloud/ipfs/"+orderId)
    .then(response => response.json())
    .then((responseJson) => {
      this.setState({order: responseJson})
      this.loadPrice(responseJson.currency)
      this.loadConversionData(wallet, responseJson.price, responseJson.currencyAddress)
      this.loadStatus()
    })
    .catch((error) => {
      console.error(error);
    });
  }

  loadPrice(currency) {
    const CoinMarketCap = require('coinmarketcap-api')
    const apiKey = 'c3c05d14-19d8-4024-ba20-912fa45f60f3'
    const client = new CoinMarketCap(apiKey)
    client.getQuotes({symbol: currency})
    .then((responseJson) => {
      console.log(responseJson)
      var id = Object.keys(responseJson.data)[0]
      var price = responseJson.data[id].quote["USD"].price;
      this.setState({currencyConversion: price, loading: false})
    })
    .catch((error) => {
      console.error(error);
    });
  }

  async loadStatus() {
    if (!this.state.order) {
      this.intervalID = setTimeout(this.loadStatus.bind(this), 1000)
      return
    }
    const web3 = new Web3("https://ropsten.infura.io/v3/9da288f33ecd4936960db9d9f2e038d8")
    const privateKey = localStorage.getItem('pvtKey') || ''
    const walletAddress = localStorage.getItem('walletAddress') || ''
    const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;
    const payeeWallet = new web3.eth.Contract(WALLET_ABI, this.state.order.payeeWallet)
    const status = await payeeWallet.methods.paymentStatus(this.props.id).call()
    this.setState({status})
    this.intervalID = setTimeout(this.loadStatus.bind(this), 1000)
  }

  async loadConversionData(wallet, amount, to) {
    console.log("calling with")
    console.log(amount)
    console.log(this.props.inAsset)
    console.log(to)
    const expectedAmount = await wallet.methods.getExpectedAmount(amount, this.props.inAsset, to).call()
    this.setState({expectedAmount})
  }

  pay() {
    this.props.wallet.methods.sendPayment(
      this.props.id,
      this.state.order.payeeWallet,
      this.state.order.price,
      this.state.order.orderId,
      this.state.order.signature
    ).send({ from: this.props.account, gas: 3087200 })
      .on("transactionHash", function (trxHash) {
          console.log(trxHash)
          this.setState({paymentHash: trxHash})
      }.bind(this))
      .on("receipt", function (r) {
          console.log("Receipt");
          console.log(r);
      })
      .on("confirmation", function (c) {
          console.log("Confirmed");
          console.log(c);
      })
      .on("error", async function (error) {
          console.log("Error: "+error);
      });
  }

  render() {
    var finalPrice = 0
    var merchantPrice = 0
    var untouchedMerchantPrice = 0
    if (!this.state.loading && this.state.currencyConversion !== 0) {
      untouchedMerchantPrice = this.state.order.price * 10**(-this.state.order.decimals)
      merchantPrice = this.state.order.price * this.state.currencyConversion * 10**(-this.state.order.decimals)
      finalPrice = merchantPrice * this.props.localConversion
    }
    var myPrice = this.state.expectedAmount * 10**(-this.props.decimals)
    if (myPrice === -1) {
      myPrice = this.state.order.price * 10**(-this.state.order.decimals)
    }
    return(
      <div>
        {this.state.loading &&
          <span>Loading</span>
        }
        {!this.state.loading && this.state.order !== false &&
          <div className="row justify-content-center">
            <div className="col-lg-4 col-sm-9 mt-5">
              <Card style={{width: "100%"}}>
                <div className="card-body text-center">
                  <h4 className="card-title mb-4">Send Payment</h4>
                  <p className="text-muted">{this.state.order.orderId}</p>
                  <Items items={this.state.order.items} conversion={this.state.currencyConversion * this.props.localConversion * 10**(-this.state.order.decimals)} />
                  <p className="lead">Total {this.props.localCurrency+"$"+finalPrice.toFixed(2)} ({untouchedMerchantPrice.toFixed(2)} {this.state.order.currency})</p>
                  <p className="card-text text-muted">You will pay {myPrice.toFixed(2)} {this.props.symbol} from your wallet.</p>
                  {this.props.symbol != this.state.order.currency &&
                  <p className="card-text text-muted">Your payment will be made in {this.state.order.currency}.</p>
                  }
                  <hr></hr>
                  <div className="row mb-2">
                    <div className="col-sm-9 text-left">
                      {this.state.status != 2 ? "Waiting for Authorization" : "Authorized"}
                    </div>
                    <div className="col-sm-3">
                      {this.state.status == 0 && this.state.paymentHash === "" &&
                        <div></div>
                      }
                      {(this.state.status != 0 || (this.state.status == 0 && this.state.paymentHash !== "")) &&
                        <i className={"fas "+ (this.state.status == 0 ? "fa-sync fa-spin" : "fa-check-circle")}></i>
                      }
                    </div>
                  </div>
                  <div className={"row mb-2 "+(this.state.status == 0 ? "text-muted" : "")}>
                    <div className="col-sm-9 text-left">
                      {this.state.status < 2 ? "Waiting for Completion" : "Completed"}
                    </div>
                    <div className="col-sm-3">
                      {this.state.status == 0 &&
                        <div></div>
                      }
                      {this.state.status != 0 &&
                        <i className={"fas "+ (this.state.status < 2 ? "fa-sync fa-spin" : "fa-check-circle")}></i>
                      }
                    </div>
                  </div>
                  <div className="mt-3">
                    {this.state.status == 0 && this.state.paymentHash === "" &&
                      <Button variant="success" type="button" onClick={this.pay.bind(this)}>Authorize Payment</Button>
                    }
                  </div>
                </div>
              </Card>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default Payment

const Items = ({items, conversion}) => (
  <table className="table">
    <thead className="thead-light">
      <tr>
        <th scope="col">#</th>
        <th scope="col">SKU</th>
        <th scope="col">Item</th>
        <th scope="col">Price</th>
      </tr>
    </thead>
    <tbody>
      { items.map( (i, idx) => (<Item item={i} index={idx} key={idx} conversion={conversion} />)) }
    </tbody>
  </table>
)

const Item = ({item, index, conversion}) => (
  <tr>
    <th scope="row">{index+1}</th>
    <td>{item.SKU}</td>
    <td>{item.title}</td>
    <td>${(item.price * conversion).toFixed(2)}</td>
  </tr>
)
