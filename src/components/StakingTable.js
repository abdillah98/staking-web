import React from 'react';
import EthLogo from '../images/eth-logo.png';
import iconWithdraw from '../icons/icon-withdraw.svg';

export default function StakingTable({assets, detect, onWithdraw}) {
	return (
		<div className="card-blur">
			<div class="table-responsive">
			  <table className="table table-borderless table-custom">
			    <TableHead />
			    {
			    	detect ?
			    	<TableBody assets={assets} onWithdraw={onWithdraw} /> :
			    	<NotDetected />
			    }
			  </table>
			</div>
		</div>
	)
}

function TableHead() {
	return (
		<thead className="text-white">
		  <tr>
		    <th scope="col">Asset</th>
		    <th scope="col" width="25%">Percent Interest</th>
		    <th scope="col">Staked</th>
		    <th scope="col">Interest</th>
		    <th scope="col">Days Remaining</th>
		    <th scope="col"></th>
		  </tr>
		</thead>
	)
}

function TableBody({assets, onWithdraw}) {
	return (
		<tbody className="text-muted">
		  {assets.length > 0 && assets.map((row, index) =>
		    <tr key={index}>
		      <td>
		        <img src={EthLogo} alt="eth-logo" />
		      </td>
		      <td>{row.percentInterest}%</td>
		      <td>{row.etherStaked}</td>
		      <td>{row.etherInterest}</td>
		      <td>{row.daysRemaining} Days</td>
		      <td className="d-flex justify-content-end">
		        {row.open ?
		          <button 
		            type="button" 
		            className="btn btn-gradient btn-sm fs-small rounded-pill"
		            onClick={() => onWithdraw(row.positionId)}
		          >
		            <div className="d-flex align-items-center py-1 px-2">
		            	<img className="me-1" src={iconWithdraw} alt="icon-withdraw" />
		            	<span>Withdraw</span>
		            </div>
		          </button> :
		          <span className="px-4 me-2">Closed</span>
		        }
		      </td>
		    </tr>
		  )}
		</tbody>
	)
}

function NotDetected() {
	return (
		<tbody className="text-muted">
			<tr>
				<td colspan="6" align="center" className="text-danger">
					Metamask not detected!
				</td>
			</tr>
		</tbody>
	)
}