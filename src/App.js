import {useState, useEffect} from 'react';
import './App.css';
import {ethers} from 'ethers';
import artifact from './artifacts/contracts/Staking.sol/Staking.json';
import IconWallet from './icons/icon-wallet.svg';
import EthLogo from './images/eth-logo.png';
import MetamaskLogo from './images/metamask-logo.png';
import StakingArtifact from "./contracts/Staking.json";
import contractAddress from "./contracts/contract-address.json";

// const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CONTRACT_ADDRESS = contractAddress.Token;

function App() {

  // general
  const [provider, setProvider] = useState(undefined)
  const [signer, setSigner] = useState(undefined)
  const [contract, setContract] = useState(undefined)
  const [signerAddress, setSignerAddress] = useState(undefined)

  // assets
  const [assetIds, setAssetIds] = useState([])
  const [assets, setAssets] = useState([])

  // staking
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [stakingLength, setStakingLength] = useState(undefined)
  const [stakingPercent, setStakingPercent] = useState(undefined)
  const [amount, setAmount] = useState(0)

  // helpers
  const toWei = ether => ethers.utils.parseEther(ether)
  const toEther = wei => ethers.utils.formatEther(wei)

  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      const contract = await new ethers.Contract(
        CONTRACT_ADDRESS,
        StakingArtifact.abi
      )
      setContract(contract)
    }
    onLoad()
  }, [])

  const isConnected = () => signer !== undefined

  const getSigner = async () => {
    provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner()
    return signer
  }

  const getAssetIds = async (address, signer) => {
    const assetIds = await contract.connect(signer).getPositionIdsForAddress(address)
    return assetIds
  }

  const calcDaysRemaining = (unlockDate) => {
    const timeNow = Date.now() / 1000
    const secondsRemaining = unlockDate - timeNow
    return Math.max( (secondsRemaining / 60 / 60 / 24).toFixed(0), 0)
  }

  const getAssets = async (ids, signer) => {
    const queriedAssets = await Promise.all(
      ids.map(id => contract.connect(signer).getPositionById(id))
    )
    console.log('queriedAssets')
    console.log(queriedAssets)

    queriedAssets.map(async asset => {
      const parsedAsset = {
        positionId: Number(asset.positionId),
        percentInterest: Number(asset.percentInterest) / 100,
        daysRemaining: calcDaysRemaining( Number(asset.unlockDate) ),
        etherInterest: toEther(asset.weiInterest),
        etherStaked: toEther(asset.weiStaked),
        unlockDate: Number(asset.positionId),
        open: asset.open,
      }

      console.log(parsedAsset)

      setAssets(prev => [...prev, parsedAsset])
    })
  }

  const connectAndLoad = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);

    console.log('connectAndLoad')
    const signer = await getSigner(provider)
    console.log(signer)
    setSigner(signer)

    const signerAddress = await signer.getAddress()
    console.log(signerAddress)
    setSignerAddress(signerAddress)

    const assetIds = await getAssetIds(signerAddress, signer)
    console.log(signer)
    setAssetIds(assetIds)

    
    console.log(assetIds)
    getAssets(assetIds, signer)
  }

  const openStakingModal = (stakingLength, stakingPercent) => {
    setShowStakeModal(true)
    setStakingLength(stakingLength)
    setStakingPercent(stakingPercent)
  }

  const stakeEther = async () => {
    const wei = toWei(amount)
    const data = { value: wei }
    console.log('stakeEther')
    console.log(wei)
    console.log(data)
    console.log(stakingLength)
    await contract.connect(signer).stakeEther(stakingLength, data)
    setShowStakeModal(false)
  }

  const withdraw = positionId => {
    contract.connect(signer).closePosition(positionId)
  }

  return (
    <div className="wrapper py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">

            <div className="row align-items-center mb-5">
              <div className="col-md-6">
                <h1 className="text-white mb-0">Staking Token</h1>
              </div>
              <div className="col-md-6">
                <button 
                  type="button" 
                  className="btn btn-gradient rounded-pill d-block ms-auto"
                  onClick={connectAndLoad}
                >
                  <div className="d-flex align-items-center px-3 py-2">
                    <img className="me-2" src={MetamaskLogo} alt="eth-logo" height="20" width="20" />
                    {isConnected() ? <span>Connected</span> : <span>Connect wallet</span>}
                  </div>
                </button>
              </div>
            </div>

            <div className="row mb-5">
              <div className="col-sm-4 col-md-4 mb-3 mb-sm-0">
                <div className="card-option">
                  <div className="card-box box-orange" onClick={() => openStakingModal(30, '7%')}>
                    <img src={IconWallet} alt="icons"/>
                  </div>
                  <div className="card-text">
                    <span className="card-text-percent">7%</span>
                    <span className="card-text-month">1 Months</span>
                  </div>
                </div> 
              </div>
              <div className="col-sm-4 col-md-4 mb-3 mb-sm-0">
                <div className="card-option">
                  <div className="card-box box-purple" onClick={() => openStakingModal(90, '10%')}>
                    <img src={IconWallet} alt="icons"/>
                  </div>
                  <div className="card-text">
                    <span className="card-text-percent">10%</span>
                    <span className="card-text-month">3 Months</span>
                  </div>
                </div> 
              </div>
              <div className="col-sm-4 col-md-4 mb-3 mb-sm-0">
                <div className="card-option">
                  <div className="card-box box-blue" onClick={() => openStakingModal(180, '12%')}>
                    <img src={IconWallet} alt="icons"/>
                  </div>
                  <div className="card-text">
                    <span className="card-text-percent">12%</span>
                    <span className="card-text-month">6 Months</span>
                  </div>
                </div> 
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="card-blur">
                  <table className="table table-borderless">
                    <thead className="text-white">
                      <tr>
                        <th scope="col">Asset</th>
                        <th scope="col">Percent Interest</th>
                        <th scope="col">Staked</th>
                        <th scope="col">Interest</th>
                        <th scope="col">Days Remaining</th>
                        <th scope="col"></th>
                      </tr>
                    </thead>
                    <tbody className="text-muted">
                      {assets.length > 0 && assets.map((a, idx) =>
                        <tr key={idx}>
                          <td>
                            <img src={EthLogo} alt="eth-logo" />
                          </td>
                          <td>{a.percentInterest}%</td>
                          <td>{a.etherStaked}</td>
                          <td>{a.etherInterest}</td>
                          <td>{a.daysRemaining} Days</td>
                          <td className="d-flex justify-content-end">
                            {a.open ?
                              <button 
                                type="button" 
                                className="btn btn-gradient btn-sm fs-small rounded-pill"
                                onClick={() => withdraw(a.positionId)}
                              >
                                Withdraw
                              </button> :
                              <span>Closed</span>
                            }
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {
              showStakeModal &&
              <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title text-dark">Stake Ether</h5>
                      <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowStakeModal(false)}></button>
                    </div>
                    <div className="modal-body">
                      <p className="text-dark fw-bold fs-small mb-0">{stakingLength} days @ {stakingPercent} APY</p>
                      <div className="mb-3">
                        <label htmlFor="amount" className="form-label">Amount ETH</label>
                        <input type="email" className="form-control" id="amount" placeholder="0" onChange={e => setAmount(e.target.value)} />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-gradient rounded-pill" onClick={() => stakeEther()}>Stake</button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
