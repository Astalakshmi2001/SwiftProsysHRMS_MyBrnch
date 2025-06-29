import React from 'react'
import '../../App.css'
import { Colors } from '../../constant/colors'

function Signup() {
  return (
    <div className='container-fluid d-flex p-0'>
      <div className="imagecontainer" style={{ backgroundColor: Colors.primary, width: '60%', height: '100vh' }}>

      </div>
      <div className="contentcontainer">
        <div className='formcontainer'>
          <h3>SIGN UP</h3>
          <div className='input-field'>
            <input type="text" id='username' required />
            <label htmlFor="username">Username</label>
          </div>

          <div className='input-field'>
            <input type="email" id='email' required />
            <label htmlFor="email">Email</label>
          </div>

          <div className='input-field'>
            <input type="tel" id='mobile' maxLength={10} required />
            <label htmlFor="mobile">Mobile No</label>
          </div>

          <div className='input-field'>
            <input type="password" id='password' required />
            <label htmlFor="password">Password</label>
          </div>

          <div className='input-field'>
            <input type="password" id='confirmPassword' required />
            <label htmlFor="confirmPassword">Confirm Password</label>
          </div>
          <button>Sign up</button>
          <p>already have an account? <a href="/">Login</a></p>
        </div>
      </div>
    </div>
  )
}

export default Signup
