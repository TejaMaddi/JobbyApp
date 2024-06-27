import Cookies from 'js-cookie'
import {Redirect} from 'react-router-dom'
import {Component} from 'react'

import './index.css'

class Login extends Component {
  state = {
    showSubmitError: false,
    username: '',
    password: '',
    errorMsg: '',
  }

  onChangeUserInput = event => {
    this.setState({
      username: event.target.value,
    })
  }

  onChangePassInput = event => {
    this.setState({
      password: event.target.value,
    })
  }

  onSubmitSuccess = token => {
    Cookies.set('jwt_token', token, {expires: 29})
    const {history} = this.props
    history.replace('/')
  }

  onSubmitFailure = errorMsg => {
    this.setState({
      showSubmitError: true,
      errorMsg,
    })
  }

  onSubmitForm = async event => {
    event.preventDefault()
    const {username, password} = this.state
    const userDetails = {username, password}
    const apiUrl = 'https://apis.ccbp.in/login'
    const options = {
      method: 'POST',
      body: JSON.stringify(userDetails),
    }
    const response = await fetch(apiUrl, options)
    console.log(response.ok)
    const data = await response.json()
    console.log(data.error_msg)
    if (response.ok) {
      this.onSubmitSuccess(data.jwt_token)
    } else {
      this.onSubmitFailure(data.error_msg)
    }
  }

  renderLoginForm() {
    return (
      <form className="form" onSubmit={this.onSubmitForm}>
        <img
          src="https://assets.ccbp.in/frontend/react-js/logo-img.png"
          className="logo-image"
          alt="website logo"
        />
        <label className="label" htmlFor="username">
          USERNAME
        </label>
        <input
          type="text"
          className="input-element"
          id="username"
          placeholder="Username"
          onChange={this.onChangeUserInput}
        />
        <label className="label" htmlFor="password">
          PASSWORD
        </label>
        <input
          type="password"
          className="input-element"
          id="password"
          placeholder="Password"
          onChange={this.onChangePassInput}
        />
        <button type="submit" className="submit-button">
          Login
        </button>
      </form>
    )
  }

  render() {
    const jwtToken = Cookies.get('jwt_token')
    if (jwtToken !== undefined) {
      return <Redirect to="/" />
    }
    const {showSubmitError, errorMsg} = this.state
    console.log(showSubmitError)
    return (
      <div className="app-container">
        <div className="login-card">
          {this.renderLoginForm()}
          {showSubmitError && <p className="error-msg">* {errorMsg}</p>}
        </div>
      </div>
    )
  }
}

export default Login
