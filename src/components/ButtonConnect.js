import React from 'react'
import MetamaskLogo from '../images/metamask-logo.png';

export default function ButtonConnect({account, detect, onClick}) {
  const accountText = `${account.substring(0, 4)}...${account.substring(account.length - 4, account.length)}`;
	return (
		<button 
      type="button" 
      className={`btn ${detect ? 'btn-gradient' : 'btn-dark'} rounded-pill d-block ms-auto`}
      onClick={onClick}
      disabled={!detect}
    >
    	{
        detect ?
        <div className="d-flex align-items-center px-3 py-2">
          <img className="me-2" src={MetamaskLogo} alt="eth-logo" height="20" width="20" />
          {account.length > 0 ? <span>{accountText}</span> : <span>Connect wallet</span>}
        </div> :
        <div className="d-flex align-items-center px-3 py-2">
          <img className="me-2" src={MetamaskLogo} alt="eth-logo" height="20" width="20" />
          Not Detected
        </div>
      }
    </button>
	)
}