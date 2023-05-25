import React, { useState, useEffect } from 'react'
import './App.css';
import { ethers } from "ethers";
import StakingArtifact from "./contracts/Staking.json";
import contractAddress from "./contracts/contract-address.json";
import {toWei, toEther, calcDaysRemaining} from "./helpers";
import { ButtonConnect, StakingOption, StakingTable } from './components';

const _ethereum = window.ethereum;


export default function App() {

	// state variable
	const [account, setAccount] = useState('');
	const [assets, setAssets] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [stakingLength, setStakingLength] = useState(undefined);
	const [stakingPercent, setStakingPercent] = useState(undefined);
	const [amount, setAmount] = useState(0);
	const [contract, setContract] = useState(undefined);

	const _detectProvider = () => {
			const _provider = _ethereum ? new ethers.providers.Web3Provider(_ethereum) : ethers.providers.getDefaultProvider();
			const _contract = new ethers.Contract(contractAddress.Token, StakingArtifact.abi, _provider.getSigner(0));
			setContract(_contract)
	}

	//Ambil akun pertama di metamask saat awal pemuatan atau saat reload halaman
	useEffect(() => {
	  const _getAcccount = async () => {
	    if(_ethereum) {
	    	const [account] = await _ethereum.request({ method: 'eth_accounts' });
	    	setAccount(
	    	  account ? account : ''
	    	)
	    }
	    else {
	    	console.log('Please Install Metamask')
	    }
	  }
	  _getAcccount()
	}, [])

	// Deteksi jika terjadi pergantian akun di metamask
  useEffect(() => {
  	if(_ethereum) {
	    _ethereum.on('accountsChanged', function ([account]) {
	      setAccount(
	        account ? account : ''
	      )
	    });
  		_detectProvider()
	  }
	  else {
    	console.log('Please Install Metamask')
    }
    
  }, [])

	//Aksi koneksi ke metamask
	const _connectToWallet = async () => {
	  if (_ethereum) {
	    const [account] = await _ethereum.request({ method: 'eth_requestAccounts' });
	    setAccount(account)
	  }
	  else {
	    console.log('Please install metamask');
	  }
	}

	const _getAssetIds = async (account) => {
		const assetIds = await contract.getPositionIdsForAddress(account);
		return assetIds;
	}

	const _queryAssets = async (assetIds) => {
		const queriedAssets = await Promise.all(
		  assetIds.map(id => contract.getPositionById(id))
		)

		return queriedAssets;
	}

	const _mappingAssets = async (assets) => {
		let newAssets = [];

		assets.map(async asset => {
		  const rows = {
		    positionId: Number(asset.positionId),
		    percentInterest: Number(asset.percentInterest) / 100,
		    daysRemaining: calcDaysRemaining( Number(asset.unlockDate) ),
		    etherInterest: toEther(asset.weiInterest),
		    etherStaked: toEther(asset.weiStaked),
		    unlockDate: Number(asset.positionId),
		    open: asset.open,
		  }

		  newAssets = [...newAssets, rows]
		})

		return newAssets
	}

	useEffect(() => {
		const getAllAssets = async () => {
			if(account.length > 0) {
				try {
					_detectProvider();
					const assetIds = await _getAssetIds(account)
					const queryAssets = await _queryAssets(assetIds)
					const newAssets = await _mappingAssets(queryAssets)

					setAssets(newAssets)
				}
				catch(error) {
					console.log(error)
				}
			}
		}

		getAllAssets()

		console.log('account')
		console.log(account)

	}, [account])

	const _openStakingModal = (_stakingLength, _stakingPercent) => {
		if(_ethereum) {
		  setShowModal(true)
		  setStakingLength(_stakingLength)
		  setStakingPercent(_stakingPercent)
		}
		else {
			alert('Please install Metamask!')
		}
	}

	const _onWithdraw = positionId => {
		_detectProvider();
	  contract.closePosition(positionId)
	}

	const _onStakeEther = async () => {
		_detectProvider();
	  const wei = toWei(amount)
	  const data = { value: wei }
	  await contract.stakeEther(stakingLength, data)
	  setShowModal(false)
	}

	return (
		<div className="wrapper py-5">
		  <div className="container mb-5">
		    <div className="row justify-content-center">
		      <div className="col-md-12 col-lg-8">

		      	<div className="row align-items-center mb-5">
		      	  <div className="col-6 col-sm-6 col-md-6">
		      	    <h1 className="text-white mb-0">Staking Coins</h1>
		      	  </div>
		      	  <div className="col-6 col-sm-6 col-md-6">
		      	  	<ButtonConnect 
		      	  		account={account} 
		      	  		onClick={_connectToWallet}
		      	  		detect={_ethereum}
		      	  		account={account}
		      	  	/>
		      	  </div>
		      	</div>

		      	<div className="row mb-5">
		      	  <div className="col-sm-4 col-md-4 mb-3 mb-sm-0">
		      	    <StakingOption 
		      	    	percent={7}
		      	    	month={1}
		      	    	color="orange"
		      	    	onClick={() => _openStakingModal(30, '7%')}
		      	    />
		      	  </div>
		      	  <div className="col-sm-4 col-md-4 mb-3 mb-sm-0">
		      	  	<StakingOption 
		      	  		percent={10}
		      	  		month={3}
		      	  		color="purple"
		      	  		onClick={() => _openStakingModal(90, '10%')}
		      	  	/>
		      	  </div>
		      	  <div className="col-sm-4 col-md-4 mb-3 mb-sm-0">
		      	  	<StakingOption 
		      	  		percent={12}
		      	  		month={6}
		      	  		color="blue"
		      	  		onClick={() => _openStakingModal(180, '12%')}
		      	  	/>
		      	  </div>
		      	</div>

		      	<div className="row">
		      	  <div className="col-md-12">
		      	    <StakingTable 
		      	    	assets={assets} 
		      	    	detect={_ethereum}
		      	    	onWithdraw={_onWithdraw} 
		      	    />
		      	  </div>
		      	</div>

		      	{
		      	  showModal &&
		      	  <div className="modal fade show d-block" tabIndex="-1">
		      	    <div className="modal-dialog">
		      	      <div className="modal-content">
		      	        <div className="modal-header">
		      	          <h5 className="modal-title text-dark">Stake Ether</h5>
		      	          <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)}></button>
		      	        </div>
		      	        <div className="modal-body">
		      	          <p className="text-dark fw-bold fs-small mb-0">{stakingLength} days @ {stakingPercent} APY</p>
		      	          <div className="mb-3">
		      	            <label htmlFor="amount" className="form-label">Amount ETH</label>
		      	            <input type="email" className="form-control" id="amount" placeholder="0" onChange={e => setAmount(e.target.value)} />
		      	          </div>
		      	        </div>
		      	        <div className="modal-footer">
		      	          <button type="button" className="btn btn-gradient rounded-pill" onClick={() => _onStakeEther()}>Stake</button>
		      	        </div>
		      	      </div>
		      	    </div>
		      	  </div>
		      	}
		      	
					</div>
				</div>
			</div>
		</div>
	)
}