// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "https://github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CanSwap {

    ERC20 public USDC = ERC20(0x07865c6E87B9F70255377e024ace6630C1Eaa37F);
    ERC20 public DAI = ERC20(0xaD6D458402F60fD3Bd25163575031ACDce07538D);
    ERC20 public WBTC = ERC20(0x442Be68395613bDCD19778e761f03261ec46C06D);
    ERC20 public LINK = ERC20(0x20fE562d797A42Dcb3399062AE9546cd06f63280);
    ERC20 public WETH = ERC20(0xc778417E063141139Fce010982780140Aa0cD5Ab);

    address internal constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D ;
    IUniswapV2Router02 public uniswapRouter;

    constructor() {
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
    }

    function swap(uint256 maxIn, uint256 amountOut, ERC20 inToken, ERC20 outToken) public {
        require(inToken.approve(address(uniswapRouter), maxIn), 'approve failed.');
        // amountOutMin must be retrieved from an oracle of some kind
        address[] memory path = new address[](3);
        path[0] = address(inToken);
        path[1] = address(uniswapRouter.WETH());
        path[2] = address(outToken);
        uniswapRouter.swapTokensForExactTokens(amountOut, maxIn, path, address(this), block.timestamp + 30);
    }

    function getExpectedAmount(uint256 amount, ERC20 inToken, ERC20 outToken) public view returns (uint256) {
        address[] memory path = new address[](3);
        path[0] = address(inToken);
        path[1] = address(uniswapRouter.WETH());
        path[2] = address(outToken);
        return uniswapRouter.getAmountsIn(amount, path)[0];
    }

}
