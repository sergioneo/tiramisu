import React, { Component } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import {Link} from "react-router-dom"

const YIELDER_DATA =
{
  "name": "LINK Vault",
  "description": "Store your funds in LINK",
  "logo": "https://cryptologos.cc/logos/chainlink-link-logo.svg?v=012",
  "address": "0x0000003"
}

class VaultSwitchConfirm extends Component {

  constructor(props) {
    super(props)
    this.state = {metadata: {}, customVault: false}
  }

  componentDidMount() {
    this.loadVaultMetadata(this.props.vault)
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
              <div className="text-left mb-2">
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
                <label>New Vault:</label>
                <div className="list-group">
                  <div className="list-group-item list-group-item-action" aria-current="true">
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">{YIELDER_DATA.name}</h5>
                      <img src={YIELDER_DATA.logo} className="small-logo"/>
                    </div>
                    <p className="mb-1">{YIELDER_DATA.description}</p>
                  </div>
                </div>
              </div>
              <Button variant="success" type="button" className="w-100 mt-5">Perform Switch</Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }
}

export default VaultSwitchConfirm
