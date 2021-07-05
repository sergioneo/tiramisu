import React, { Component } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import {Link} from "react-router-dom"

const YIELDER_LIST = [
  {
    "name": "USDC AAVE Yielder",
    "description": "Earn rewards by supplying your funds into the AAVE liquidity market, and withdrawing them back when you need them",
    "logo": "https://cryptologos.cc/logos/aave-aave-logo.svg?v=012",
    "address": "0x0000000"
  },
  {
    "name": "Akropolis/Yearn Yielder",
    "description": "Turn your USDC into Akro and stake it for rewards",
    "logo": "https://cryptologos.cc/logos/akropolis-akro-logo.svg?v=012",
    "address": "0x0000001"
  },
  {
    "name": "88mph 20% Yielder",
    "description": "Use 50% of your funds to deposit into 88mph, earn rewards in MPH and withdraw them as they become available",
    "logo": "https://cryptologos.cc/logos/88mph-mph-logo.svg?v=012",
    "address": "0x0000002"
  }
]

class YielderSwitch extends Component {

  constructor(props) {
    super(props)
    this.state = {metadata: {}, customYielder: false}
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

  showCustomYielder() {
    this.setState({customYielder: true})
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
              <h4 className="card-title mb-4">Yielder Switch</h4>
              <div className="text-left mb-4">
                <label>Current Yielder</label>
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
                  { YIELDER_LIST.map( (i, idx) => (<YielderItem metadata={i} index={idx} key={idx} />)) }
                </div>
              </div>
              {!this.state.customYielder &&
                <Link to={this.props.myroute} onClick={this.showCustomYielder.bind(this)}><i className="fas fa-chevron-circle-down"></i> Or use a custom yielder (dangerous)</Link>
              }
              {this.state.customYielder &&
                <div className="">
                  <input
                    className="form-control"
                    type='text'
                    name='customYielderAddress'
                    placeholder="The custom yielder's address (starts with 0x)"
                    onChange={this.myChangeHandler}
                  />
                  {this.state.customYielderAddress !== undefined &&
                    <Link to={"/yielders/switch/"+this.state.customYielderAddress} type="button" className="btn btn-danger w-100 mt-3">Switch with custom yielder</Link>
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

export default YielderSwitch

const YielderItem = ({metadata: {name, description, logo, address}}) => (
  <Link to={"/yielders/switch/"+address} className="list-group-item list-group-item-action" aria-current="true">
    <div className="d-flex w-100 justify-content-between">
      <h5 className="mb-1">{name}</h5>
      <img src={logo} className="small-logo"/>
    </div>
    <p className="mb-1">{description}</p>
  </Link>
)
