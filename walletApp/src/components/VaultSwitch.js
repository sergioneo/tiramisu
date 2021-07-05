import React, { Component } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import {Link} from "react-router-dom"

const VAULT_LIST = [
  {
    "name": "WBTC Vault",
    "description": "Store your funds in WBTC (Wrapped Bitcoin)",
    "logo": "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg?v=012",
    "address": "0x0000000"
  },
  {
    "name": "WETH Vault",
    "description": "Store your funds in WETH (Wrapped Ethereum)",
    "logo": "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=012",
    "address": "0x0000001"
  },
  {
    "name": "DAI Vault",
    "description": "Store your funds in DAI (stable)",
    "logo": "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=012",
    "address": "0x0000002"
  },
  {
    "name": "LINK Vault",
    "description": "Store your funds in LINK",
    "logo": "https://cryptologos.cc/logos/chainlink-link-logo.svg?v=012",
    "address": "0x0000003"
  }
]

class VaultSwitch extends Component {

  constructor(props) {
    super(props)
    this.state = {metadata: {}, customVault: false}
  }

  componentDidMount() {
    this.loadVaultMetadata(this.props.vaultAddress)
  }

  loadVaultMetadata(vaultMetadataCID) {
    console.log("fetching!")
    fetch("https://ipfs.io/ipfs/QmSzzkXXWr3xgmaeKzL19QnY445n1fQGLJfvUE9xf6mRD8")
    .then(response => response.json())
    .then((responseJson) => {
      this.setState({metadata: responseJson})
      console.log(this.state.metadata)
    })
    .catch((error) => {
      console.error(error);
    });
  }

  showCustomVault() {
    this.setState({customVault: true})
  }

  myChangeHandler = (event) => {
    let nam = event.target.name;
    let val = event.target.value;
    this.setState({[nam]: val});
  }

  render() {
    return(
      <div className="row justify-content-center">
        <div className="col-sm-4 mt-5">
          <Card style={{width: "100%"}}>
            <div className="card-body text-center">
              <h4 className="card-title mb-4">Vault Switch</h4>
              <div className="text-left mb-4">
                <label>Current Vault</label>
                <div className="list-group">
                  <div className="list-group-item list-group-item-action" aria-current="true">
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">{this.state.metadata.name}</h5>
                      <img src={this.state.metadata.logo} className="small-logo"/>
                    </div>
                    <p className="mb-1">{this.state.metadata.description}</p>
                  </div>
                </div>
                <hr></hr>
                <label>Exchange with:</label>
                <div className="list-group limited-scroll">
                  { VAULT_LIST.map( (i, idx) => (<VaultItem metadata={i} index={idx} key={idx} />)) }
                </div>
              </div>
              {!this.state.customVault &&
                <Link to={this.props.myroute} onClick={this.showCustomVault.bind(this)}><i className="fas fa-chevron-circle-down"></i> Or use a custom vault (dangerous)</Link>
              }
              {this.state.customVault &&
                <div className="">
                  <input
                    className="form-control"
                    type='text'
                    name='customVaultAddress'
                    placeholder="The custom vault's address (starts with 0x)"
                    onChange={this.myChangeHandler}
                  />
                  {this.state.customVaultAddress !== undefined &&
                    <Link to={"/vaults/switch/"+this.state.customVaultAddress} type="button" className="btn btn-danger w-100 mt-3">Switch with custom vault</Link>
                  }
                </div>
              }
            </div>
          </Card>
        </div>
      </div>
    )
  }
}

export default VaultSwitch

const VaultItem = ({metadata: {name, description, logo, address}}) => (
  <Link to={"/vaults/switch/"+address} className="list-group-item list-group-item-action" aria-current="true">
    <div className="d-flex w-100 justify-content-between">
      <h5 className="mb-1">{name}</h5>
      <img src={logo} className="small-logo"/>
    </div>
    <p className="mb-1">{description}</p>
  </Link>
)
