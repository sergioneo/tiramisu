import React, { Component } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'

class WatchOrder extends Component {
intervalID

  constructor(props) {
    super(props)
    this.state = {order: false, loading: true, currencyConversion: 0, trxHash: "", status: false}
  }

  componentDidMount() {
      this.loadOrderData()
      this.loadStatus()
  }

  componentWillUnmount() {
    /*
      stop getData() from continuing to run even
      after unmounting this component. Notice we are calling
      'clearTimeout()` here rather than `clearInterval()` as
      in the previous example.
    */
    clearTimeout(this.intervalID)
  }

  loadOrderData() {
    const orderId = this.props.id
    fetch("https://gateway.pinata.cloud/ipfs/"+orderId)
    .then(response => response.json())
    .then((responseJson) => {
      this.setState({order: responseJson})
      this.loadPrice(responseJson.currency)
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
    const wallet = this.props.wallet
    if (wallet === undefined) {
      this.intervalID = setTimeout(this.loadStatus.bind(this), 1000)
      return
    }
    const status = await wallet.methods.paymentStatus(this.props.id).call()
    this.setState({status})
    console.log(status)
    this.intervalID = setTimeout(this.loadStatus.bind(this), 1000)
  }

  completePayment() {
    this.props.wallet.methods.completePayment(
      this.props.id
    ).send({ from: this.props.account, gas: 3087200 })
      .on("transactionHash", function (trxHash) {
          console.log(trxHash)
          this.setState({trxHash: trxHash})
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
                  <h4 className="card-title mb-4">Order Status</h4>
                  <p className="text-muted">{this.state.order.orderId}</p>
                  <Items items={this.state.order.items} conversion={this.state.currencyConversion * this.props.localConversion * 10**(-this.state.order.decimals)} />
                  <p className="lead">Total {this.props.localCurrency+"$"+finalPrice.toFixed(2)} ({untouchedMerchantPrice.toFixed(2)} {this.state.order.currency})</p>
                  <hr></hr>
                  <div className="row mb-2">
                    <div className="col-sm-9 text-left">
                      {this.state.status == 0 ? "Waiting for Authorization" : "Authorized"}
                    </div>
                    <div className="col-sm-3">
                      <i className={"fas "+ (this.state.status == 0 ? "fa-sync fa-spin" : "fa-check-circle")}></i>
                    </div>
                  </div>
                  <div className={"row mb-2 "+(this.state.status == 0 ? "text-muted" : "")}>
                    <div className="col-sm-9 text-left">
                      {this.state.status != 2 ? "Waiting for Completion" : "Completed"}
                    </div>
                    <div className="col-sm-3">
                      {this.state.status == 0 || (this.state.status == 1 && this.state.trxHash === "") &&
                        <div></div>
                      }
                      {this.state.status != 0 && !(this.state.status == 1 && this.state.trxHash === "") &&
                        <i className={"fas "+ (this.state.status < 2 ? "fa-sync fa-spin" : "fa-check-circle")}></i>
                      }
                    </div>
                  </div>
                  <div className="mt-3">
                    {this.state.status == 1 && this.state.trxHash === "" &&
                      <Button variant="success" type="button" onClick={this.completePayment.bind(this)}>Complete Payment</Button>
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

export default WatchOrder

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
