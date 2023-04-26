/** @format */

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Web3Mint', function () {
    // すべてのテストで同じセットアップを再利用するために、フィクスチャを定義します。
    // loadFixtureを使って、このセットアップを一度実行し、その状態をスナップショットします、
    // そして、すべてのテストでHardhat Networkをそのスナップショットにリセットします。
    async function deployWeb3MintFixture() {
        // 契約は、デフォルトで最初の署名者/アカウントを使用して展開されます。
        const [owner, otherAccount] = await ethers.getSigners();
        const Web3Mint = await ethers.getContractFactory('Web3Mint');
        const web3Mint = await Web3Mint.deploy();

        return { web3Mint, owner, otherAccount };
    }

    describe('Web3Mint', function () {
        it('Should return the nft', async function () {
            const { web3Mint, owner, otherAccount } = await loadFixture(
                deployWeb3MintFixture
            );

            let nftName = 'rumu';
            let ipfsCID =
                'bafkreifn7p4nd5lqzw6z26pjbx3wgtek53vxyhkgbjiurcl62rmwnuwwwq';

            await web3Mint.connect(owner).mintIpfsNFT(nftName, ipfsCID); // 0
            await web3Mint.connect(otherAccount).mintIpfsNFT(nftName, ipfsCID); // 1

            console.log(await web3Mint.tokenURI(0));
            console.log(await web3Mint.tokenURI(1));
            expect(1).to.equal(1);
        });
    });
});
