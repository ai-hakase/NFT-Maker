/** @format */

import { ethers } from 'hardhat';

async function main() {
    // コントラクトがコンパイルします
    // コントラクトを扱うために必要なファイルが `artifacts` ディレクトリの直下に生成されます。
    const Web3Mint = await ethers.getContractFactory('Web3Mint');

    // Hardhat がローカルの Ethereum ネットワークを作成します。
    const web3mint = await Web3Mint.deploy();

    // コントラクトが Mint され、ローカルのブロックチェーンにデプロイされるまで待ちます。
    await web3mint.deployed();

    // コントラクトアドレスをコンソールに出力 → テストネットで使う。
    // npx hardhat run scripts/deploy.ts --network sepolia → 0x0f85C6D6D721a09Bbe809a4ace0D523CdE1520A7
    console.log('Contract deployed to : ', web3mint.address);

    let nftName: string = 'rumu';
    let ipfsCID: string =
        'bafkreifn7p4nd5lqzw6z26pjbx3wgtek53vxyhkgbjiurcl62rmwnuwwwq';

    let txn = await web3mint.mintIpfsNFT(nftName, ipfsCID); // 0
    txn.wait();

    let returnedTokenUri = await web3mint.tokenURI(0);
    console.log('tokenURI:', returnedTokenUri);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
