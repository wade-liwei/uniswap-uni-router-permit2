import { ethers, BigNumber } from 'ethers';
import {
  PERMIT2_ADDRESS,
  SignatureTransfer,
  AllowanceTransfer,
  AllowanceProvider
} from '@uniswap/permit2-sdk';
import { AlphaRouter, SwapType } from '@uniswap/smart-order-router';
import { CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import erc20Abi from './erc20ABI.json' assert { type: 'json' };
import {
  DAI,
  USDT,
  WETH,
  WMCAT,
  chainId,
  getSigner,
  walletAddress,
  getEthersProvider,
  uniswapRouterAddress,
  LIWEI,
  BASED,
  USDC
} from './constants.js';

const ethersProvider = getEthersProvider();
const ethersSigner = getSigner();

async function approvePermit2Contract(erc20Address, amount) {
  const erc20 = new ethers.Contract(erc20Address, erc20Abi, ethersSigner);
  const approveTx = await erc20.approve(PERMIT2_ADDRESS, amount);
  console.log('approve tx hash:', approveTx.hash);
  // wait for approve transaction confirmation
  const receipt = await approveTx.wait();
  if (receipt.status === 1) console.log('approve transaction confirmed');
  else throw new Error(receipt);
}

async function getAllowanceAmount(erc20TokenAddress, spender) {
  const erc20 = new ethers.Contract(erc20TokenAddress, erc20Abi, ethersSigner);
  const allowance = await erc20.allowance(walletAddress, spender);
  

  console.log("allowance-----",allowance)

  return allowance;
}

async function getSwapRoute(
  sourceToken,
  destToken,
  amountInWei,
  permit,
  signature
) {
  const inputAmount = CurrencyAmount.fromRawAmount(
    sourceToken,
    amountInWei.toString()
  );


  console.log("AlphaRouter",chainId)

  console.log("AlphaRouter  chainId",chainId)
  const router = new AlphaRouter({ chainId, provider: ethersProvider });
  console.log("router.route  begin")
  const route = await router.route(
    inputAmount,
    destToken,
    TradeType.EXACT_INPUT,
    {
      recipient: walletAddress,
      slippageTolerance: new Percent(5, 1000),
      // type: SwapType.SWAP_ROUTER_02,
      // deadline: Math.floor(Date.now() / 1000 + 1800),

      type: SwapType.UNIVERSAL_ROUTER,
      deadlineOrPreviousBlockhash: Math.floor(Date.now() / 1000 + 1800),

      inputTokenPermit: {
        ...permit,
        signature

        // for ROUTER V2
        // r: signature.r,
        // s: signature.s,
        // v: signature.v,
        // for allowance transfer with Router V2
        // expiry: permit.sigDeadline,
        // nonce: permit.details.nonce
        // for signature transfer with Router V2
        // deadline: permit.deadline,
        // amount: permit.permitted.amount
      }
    }
  );
  console.log("router.route  end")
  console.log(`Quote Exact In: ${amountInWei}  -> ${route.quote.toExact()}`);
  return route;
}

async function executeSwap() {
  // swap basic info
  // NOTE: not handling native currency swaps here
  // const sourceToken = USDT;
  // const destToken = WETH;

  // const sourceToken = LIWEI;
  // const destToken = WMCAT;

  const sourceToken = BASED;
  const destToken = USDC;

  console.log("begin")
  console.log(new Date().toLocaleTimeString());


  // BASED,
  // USDC

  // const sourceToken = LIWEI;
  // const destToken = WMCAT;
  const amount = 1;

  const amountInWei = ethers.utils.parseUnits(
    amount.toString(),
    sourceToken.decimals
  );
  // expiry for permit & tx confirmation, 30 mins
  const expiry = Math.floor(Date.now() / 1000 + 1800);

  // check if we have approved enough amount
  // for PERMIT2 in source token contract
  const allowance = await getAllowanceAmount(
    sourceToken.address,
    PERMIT2_ADDRESS
  );
  console.log('current allowance:', allowance.toString());
  if (allowance.eq(0) || allowance.lt(amountInWei)) {
    // approve permit2 contract for source token
    // NOTE: amount is set to max here
    // NOTE: this will send out approve tx
    // and wait for confirmation
    console.log('sending approve tx to add more allowance');
    await approvePermit2Contract(
      sourceToken.address,
      ethers.constants.MaxInt256
    );
  }

  // allowance provider is part of permit2 sdk
  // using it to get nonce value of last permit
  // we signed for this source token
  const allowanceProvider = new AllowanceProvider(
    ethersProvider,
    PERMIT2_ADDRESS
  );

  // for allowance based transfer we can just use
  // next nonce value for permits.
  // for signature transfer probably it has to be
  // a prime number or something. checks uniswap docs.
  // const nonce = 1;

  console.log("nonce begin")
  console.log(new Date().toLocaleTimeString());

  const nonce = await allowanceProvider.getNonce(
    sourceToken.address,
    walletAddress,
    uniswapRouterAddress
  );
  console.log('nonce value:', nonce);

  console.log("nonce end")
  console.log(new Date().toLocaleTimeString());

  // create permit with SignatureTransfer
  // const permit = {
  //   permitted: {
  //     token: sourceToken.address,
  //     amount: amountInWei
  //   },
  //   spender: uniswapRouterAddress,
  //   nonce,
  //   deadline: expiry
  // };
  // const { domain, types, values } = SignatureTransfer.getPermitData(
  //   permit,
  //   PERMIT2_ADDRESS,
  //   chainId
  // );

  // create permit with AllowanceTransfer
  const permit = {
    details: {
      token: sourceToken.address,
      amount: amountInWei,
      expiration: expiry,
      nonce
    },
    spender: uniswapRouterAddress,
    sigDeadline: expiry
  };
  const { domain, types, values } = AllowanceTransfer.getPermitData(
    permit,
    PERMIT2_ADDRESS,
    chainId
  );

  // console.log(JSON.stringify({ domain, types, values }));

  // create signature for permit
  const signature = await ethersSigner._signTypedData(domain, types, values);
  console.log('signature: ', signature);
  // for V2 router we need to provide v, r, & s from signature.
  // we can split the signature using provider utils
  // const splitSignature = ethers.utils.splitSignature(signature);
  // console.log('split signature:', splitSignature);

  // NOTE: optionally verify the signature
  const address = ethers.utils.verifyTypedData(
    domain,
    types,
    values,
    signature
  );

  if (address !== walletAddress)
    throw new Error('signature verification failed');
  else console.log(`signature verified, signed by: ${address}`);
  // get swap route for tokens


  console.log("router begin")
  console.log(new Date().toLocaleTimeString());

  const route = await getSwapRoute(
    sourceToken,
    destToken,
    amountInWei,
    permit,
    signature
  );



  console.log('route calldata:', route.methodParameters.calldata);

  console.log("router end")
  console.log(new Date().toLocaleTimeString());

  //const V3_SWAP_ROUTER_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'

  const V3_SWAP_ROUTER_ADDRESS = '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD'

  console.log("uniswapRouterAddress",uniswapRouterAddress)
  console.log("V3_SWAP_ROUTER_ADDRESS",V3_SWAP_ROUTER_ADDRESS)



  // create transaction arguments for swap
  const txArguments = {
    data: route.methodParameters.calldata,
    to: uniswapRouterAddress,
    //to: V3_SWAP_ROUTER_ADDRESS,
    // value: BigNumber.from(route.methodParameters.value),
    value: BigNumber.from(0),
    from: walletAddress,
    gasPrice: route.gasPriceWei,
    gasLimit: BigNumber.from('1000000')

    //333,334
  };

  console.log("send")
  console.log(new Date().toLocaleTimeString());

  // send out swap transaction
  const transaction = await ethersSigner.sendTransaction(txArguments);
  console.log('swap transaction', transaction.hash);
}

executeSwap();
