import React, { Component, useEffect } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'

class Login extends Component {

  savePrivateKey(event) {
    event.preventDefault()
    localStorage.setItem('pvtKey', this.state.privateKey);
    localStorage.setItem('walletAddress', this.state.walletAddress);
  }

  handleChange = e => {
   this.setState({
    [e.target.name]:e.target.value
  })}

  render() {
    return(
      <div className="row justify-content-center">
        <div className="col-lg-4 col-sm-9 mt-5">
          <Card style={{width: "100%"}}>
            <div className="card-body text-center">
              <h4 className="card-title mb-4">Login with your private key</h4>
              <label>Stored securely in your browser, no one will be able to see it</label>
              <form>
                <div className="form-group">
                  <label htmlFor="exampleInputPassword1">Private key</label>
                  <input type="password" className="form-control" name="privateKey" placeholder="Private Key" onChange={this.handleChange} />
                </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Tiramisu Wallet Address</label>
                    <input type="text" className="form-control" name="walletAddress" placeholder="Tiramisu Wallet" onChange={this.handleChange} />
                  </div>
                <Button type="button" variant="primary" onClick={this.savePrivateKey.bind(this)}>Login</Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    )
  }

}

export default Login
