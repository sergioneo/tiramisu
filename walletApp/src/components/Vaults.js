import React, { Component } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import {Link} from "react-router-dom"

class Vaults extends Component {

  constructor(props) {
    super(props)
    this.state = {metadata: {}}
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

  render() {
    return(
      <div className="row justify-content-center">
        <div className="col-lg-4 col-sm-9 mt-5">
          <Card style={{width: "100%"}}>
            <div className="card-body text-center">
              <h4 className="card-title mb-4">Vault Settings</h4>
              <div className="mb-3">
                <img src={this.state.metadata.logo} className="small-logo  mb-2"/>
                <h3>{this.state.metadata.name}</h3>
                <p className="lead">{this.state.metadata.description}</p>
                <p className="lead">Author: {this.state.metadata.author}</p>
                <p className="text-muted" style={{"fontSize": "10px"}}>Vault Address: {this.props.vaultAddress}</p>
                <Link to="/vaults/switch">
                  <Button variant="warning">Switch Vaults</Button>
                </Link>
              </div>
              <Link to="yielders"><i className="fas fa-chevron-circle-down"></i> Yielder Settings</Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }
}

export default Vaults
