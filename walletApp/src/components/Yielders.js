import React, { Component } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import {Link} from "react-router-dom"

class Yielders extends Component {

  constructor(props) {
    super(props)
    this.state = {metadata: {}}
  }

  componentDidMount() {
    this.loadYielderMetadata(this.props.yielder)
  }

  loadYielderMetadata(yielderMetadataCID) {
    console.log("fetching!")
    fetch("https://ipfs.io/ipfs/QmQhekAo14BEc7nQxgPLE51gDFRdnvTobQTXfZXD2ugpb6")
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
              <h4 className="card-title mb-4">Yielder Settings</h4>
              <div>
                <img src={this.state.metadata.logo} className="small-logo mb-2"/>
                <h3>{this.state.metadata.name}</h3>
                <p>{this.state.metadata.description}<br></br>Author: {this.state.metadata.author}</p>
                <p className="lead">APY: {this.state.metadata.APY}</p>
                <p className="text-muted" style={{"fontSize": "10px"}}>Vault Address: {this.props.yielder}</p>
                <Link to="/yielders/switch">
                  <Button variant="warning">Switch Yielders</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }
}

export default Yielders
