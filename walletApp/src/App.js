import React, { useState, Component } from 'react'
import Web3 from 'web3'
import './App.css'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { useParams } from "react-router"
import Button from 'react-bootstrap/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { INFURA_ENDPOINT, VAULT_ABI, WALLET_ABI, COINMARKETCAP_API_ENDPOINT } from "./config"
import Wallet from './components/Wallet'
import Payment from './components/Payment'
import PaymentCentral from './components/PaymentCentral'
import NewOrder from './components/NewOrder'
import WatchOrder from './components/WatchOrder'
import Login from './components/Login'
import Vaults from './components/Vaults'
import VaultSwitch from './components/VaultSwitch'
import VaultSwitchConfirm from './components/VaultSwitchConfirm'
import Yielders from './components/Yielders'
import YielderSwitch from './components/YielderSwitch'
import YielderSwitchConfirm from './components/YielderSwitchConfirm'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'


class App extends Component {
  intervalID

  componentDidMount() {
    this.loadBlockchainData()
    this.getUSDToLocalCurrency(this.state.localCurrency)
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

  async loadBlockchainData() {
    const web3 = new Web3("https://ropsten.infura.io/v3/9da288f33ecd4936960db9d9f2e038d8")
    const privateKey = localStorage.getItem('pvtKey') || ''
    const walletAddress = localStorage.getItem('walletAddress') || ''
    this.setState({privateKey, walletAddress})
    if (privateKey === "" || walletAddress === "") {
        this.intervalID = setTimeout(this.loadBlockchainData.bind(this), 5000)
        return
    }
    const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;
    const wallet = new web3.eth.Contract(WALLET_ABI, walletAddress)
    const balance = await wallet.methods.balance().call()
    const symbol = await wallet.methods.backingAssetSymbol().call()
    const decimals = await wallet.methods.getDecimals().call()
    const ethBalance = await web3.eth.getBalance(account.address)
    const currentVault = await wallet.methods.BACKING_VAULT().call()
    const vault = new web3.eth.Contract(VAULT_ABI, currentVault)
    const yielder = await vault.methods.yielderPreference(walletAddress).call()
    const asset = await vault.methods.ASSET().call()
    this.setState({balance, symbol, decimals, wallet, account: account.address, web3, ethBalance, currentVault, yielder, asset})
    this.getUSDPriceFromAPI(symbol)
    this.intervalID = setTimeout(this.loadBlockchainData.bind(this), 1000)
  }

  getUSDPriceFromAPI(symbol) {
    if (this.state.price != 0) return;
    const CoinMarketCap = require('coinmarketcap-api')
    const apiKey = 'c3c05d14-19d8-4024-ba20-912fa45f60f3'
    const client = new CoinMarketCap(apiKey)
    client.getQuotes({symbol: symbol})
    .then((responseJson) => {
      var id = Object.keys(responseJson.data)[0]
      var price = responseJson.data[id].quote["USD"].price;
      this.setState({price})
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getUSDToLocalCurrency(local) {
    fetch("https://free.currconv.com/api/v7/convert?q=USD_"+local+"&compact=ultra&apiKey=6d9e7a2b46e61870bfd6")
    .then(response => response.json())
    .then((responseJson) => {
      var id = "USD_"+local
      var localConversion = responseJson[id];
      this.setState({localConversion})
    })
    .catch((error) => {
      console.error(error);
    });
  }

  changeLocalCurrency(event) {
    this.setState({localCurrency: event.target.value})
    this.getUSDToLocalCurrency(event.target.value)
  }

  constructor(props) {
    super(props)
    this.state = {localCurrency:"CLP", price: 0}
  }

  render() {
    return (
      <div className="container-fluid">
      <Navbar bg="light" variant="light" expand="lg" className="row">
        <Navbar.Brand href="/" className="logo"><img src="http://localhost:3000/tiramisu.png" className="logoimg"/> Tiramisu</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
          </Nav>
          <div className="form-inline my-2 my-lg-0">
            <div className="mr-4 text-dark">
              Wallet balance: {this.state.localCurrency}${Number(((this.state.balance * 10**(-this.state.decimals))*this.state.price*this.state.localConversion).toFixed(2)).toLocaleString()}
            </div>
            <select onChange={this.changeLocalCurrency.bind(this)}>
              {["CLP", "EUR", "USD", "ARS", "MXN", "CAD"].map((value, index) => {
                return <option key={index} value={value}>{value}</option>
              })}
            </select>
            {this.state.privateKey !== "" &&
              <div className="ml-2 text-dark">
                Available gas: {(this.state.ethBalance * 10**(-18)).toFixed(2)} Ether
              </div>
            }
          </div>
        </Navbar.Collapse>
      </Navbar>
      {this.state.privateKey !== "" && this.state.walletAddress !== "" &&
        <Router>
            <Switch>
              <Route exact path="/">
                <Wallet
                  balance={this.state.balance}
                  decimals={this.state.decimals}
                  conversion={this.state.price*this.state.localConversion}
                  symbol={this.state.symbol}
                  localCurrency={this.state.localCurrency}
                />
              </Route>
              <Route path="/pay/:id"render={({match}) => (
                  <Payment
                    id={match.params.id}
                    balance={this.state.balance}
                    decimals={this.state.decimals}
                    symbol={this.state.symbol}
                    localCurrency={this.state.localCurrency}
                    localConversion={this.state.localConversion}
                    wallet={this.state.wallet}
                    account={this.state.account}
                    inAsset={this.state.asset}
                    web3={this.state.web3}
                  />
                )}
              />
              <Route path="/pay"render={({match}) => (
                  <PaymentCentral
                    id={match.params.id}
                    localCurrency={this.state.localCurrency}
                    localConversion={this.state.localConversion}
                    wallet={this.state.wallet}
                    account={this.state.account}
                  />
                )}
              />
              <Route path="/vaults/switch/:id"render={({match}) => (
                  <VaultSwitchConfirm
                    newVault={match.params.id}
                    oldVault={this.state.yielder}
                    web3={this.state.web3}
                  />
                )}
              />
              <Route path="/vaults/switch"render={({match}) => (
                  <VaultSwitch
                    vaultAddress={this.state.currentVault}
                  />
                )}
              />
              <Route path="/vaults"render={({match}) => (
                  <Vaults
                    vaultAddress={this.state.currentVault}
                  />
                )}
              />
              <Route path="/yielders/switch/:id"render={({match}) => (
                  <YielderSwitchConfirm
                    newYielder={match.params.id}
                    oldYielder={this.state.yielder}
                    web3={this.state.web3}
                  />
                )}
              />
              <Route path="/yielders/switch"render={({match}) => (
                  <YielderSwitch
                    yielder={this.state.yielder}
                  />
                )}
              />
              <Route path="/yielders"render={({match}) => (
                  <Yielders
                    yielder={this.state.yielder}
                  />
                )}
              />
              <Route path="/receive/watch/:id"render={({match}) => (
                  <WatchOrder
                    id={match.params.id}
                    balance={this.state.balance}
                    decimals={this.state.decimals}
                    symbol={this.state.symbol}
                    localCurrency={this.state.localCurrency}
                    localConversion={this.state.localConversion}
                    wallet={this.state.wallet}
                    account={this.state.account}
                  />
                )}
              />
              <Route exact path="/receive">
                <NewOrder
                  account={this.state.account}
                  pvKey={this.state.privateKey}
                  decimals={this.state.decimals}
                  symbol={this.state.symbol}
                  walletAddress={this.state.walletAddress}
                  web3={this.state.web3}
                  asset={this.state.asset}
                />
              </Route>
            </Switch>
        </Router>
      }
      {(this.state.privateKey === "" || this.state.walletAddress === "") &&
        <Login />
      }
      </div>
    );
  }
}

export default App;
