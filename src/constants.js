import { ethers } from 'ethers';
import { Token, ChainId } from '@uniswap/sdk-core';
import { SWAP_ROUTER_02_ADDRESSES } from '@uniswap/smart-order-router';
import { UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk';
import 'dotenv/config';

export const walletAddress = process.env.WALLET_ADDRESS;

export function getEthersProvider() {
  return new ethers.providers.JsonRpcProvider(`${process.env.RPC_URL}`);
}

export function getSigner() {
  return new ethers.Wallet(`${process.env.WALLET_SECRET}`, getEthersProvider());
}

export const chainId =
  (await getEthersProvider().getNetwork().chainId) === 1
    ? ChainId.MAINNET
    : ChainId.BASE;

export const uniswapRouterAddress =
  process.env.UNISWAP_ROUTER === 'UNIVERSAL'
    ? UNIVERSAL_ROUTER_ADDRESS(chainId)
    : SWAP_ROUTER_02_ADDRESSES(chainId);

// export const WETH = new Token(
//   chainId,
//   chainId === ChainId.MAINNET
//     ? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
//     : '0x4200000000000000000000000000000000000006', // goerli     Sepolia 0xfff9976782d46cc05630d1f6ebab18b2324d6b14
//   18,
//   'WETH',
//   'Wrapped Ether'
// );

export const WETH = new Token(
  chainId,
  chainId === ChainId.MAINNET
    ? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    : '0x5c3Af824e48a2b5B3ec2a70699D69C8A6789DB15', // goerli     Sepolia 0xfff9976782d46cc05630d1f6ebab18b2324d6b14
  18,
  'liwei',
  'liwei'
);

export const UNI = new Token(
  chainId,
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',  //
  18,
  'UNI',
  'Uniswap'
);

// export const USDT = new Token(
//   chainId,
//   chainId === ChainId.MAINNET
//     ? '0xdAC17F958D2ee523a2206206994597C13D831ec7'
//     : '0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49', // goerli    
//   6,
//   'USDT',
//   'USD Tether'
// );

export const USDT = new Token(
  chainId,
  chainId === ChainId.MAINNET
    ? '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    : '0x7670564a11e38330d31EeddBd866570F6f7cE656', // goerli    
  18,
  'WMCAT',
  'Watermelon Cat'
);

export const DAI = new Token(
  chainId,
  chainId === ChainId.MAINNET
    ? '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    : '0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844', // goerli   
  18,
  'DAI',
  'Dai Stablecoin'
);


export const LIWEI = new Token(
  chainId,
  chainId === ChainId.MAINNET
    ? '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    : '0x5c3Af824e48a2b5B3ec2a70699D69C8A6789DB15', // goerli   
  18,
  'liwei',
  'liwei'
);

export const WMCAT = new Token(
  chainId,
  chainId === ChainId.MAINNET
    ? '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    : '0x7670564a11e38330d31EeddBd866570F6f7cE656', // goerli   
  18,
  'WMCAT',
  'Watermelon Cat'
);

