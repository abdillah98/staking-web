import React from 'react';
import IconWallet from '../icons/icon-wallet.svg';

export default function StakingOption({percent, month, color, onClick}) {
	return (
		<div className="card-option">
		  <div className={`card-box box-${color}`} onClick={onClick}>
		    <img src={IconWallet} alt="icons"/>
		  </div>
		  <div className="card-text">
		    <span className="card-text-percent">{month} Months</span>
		    <span className="card-text-month">{percent}% </span>
		  </div>
		</div> 
	)
}