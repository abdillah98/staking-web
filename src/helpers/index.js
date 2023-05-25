import { ethers } from "ethers";

export const toWei = ether => ethers.utils.parseEther(ether);

export const toEther = wei => ethers.utils.formatEther(wei);

export const calcDaysRemaining = (unlockDate) => {
  const timeNow = Date.now() / 1000
  const secondsRemaining = unlockDate - timeNow
  return Math.max( (secondsRemaining / 60 / 60 / 24).toFixed(0), 0)
}