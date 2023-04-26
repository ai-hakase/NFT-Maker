// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// NFTのカウンターをインポート
import "@openzeppelin/contracts/utils/Counters.sol";

// 画像をBase64 に変換する
import "./livraries/Basse64.sol";
import "hardhat/console.sol";

/**
 * IPFS → 画像やファイルを保存しておくP2Pネットワーク。誰が元のファイルを持っているのかがわかる。 → もちろん、改善不可
 * web3Storage （https://web3.storage/）で簡単に使用することができる → アップロードするだけで、IPFS としてファイルが使える。
 * bafybeibnjxaiqmhcee67uonmhb5zqduzm5xalbst7v6mckmfc7dh7pep7u → ラム様の画像のCID
 *
 * ⭐ NFT で唯一性と作者の証明、IPFSでファイルの出本、誰が持っているかがわかる。
 */

// ERC721 トークンの関数を継承
contract Web3Mint is ERC721 {
    // NFT struct
    struct NftAttributes {
        string name;
        string imageUrl;
    }

    // NFTを格納する配列を用意
    NftAttributes[] Web3Nfts;

    // _tokenID -> NFT の Counter を定義
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    //  ERC721 の コンストラクタに 初期値を設定する。
    // Name、Symbol を設定。
    constructor() ERC721("NFTName", "NFTImage") {
        console.log("########################## \n This is my NFT contract");
    }

    // NFT を作成する → Mintする。 → Name と Symbol（URL） を配列に格納して TokenID をインクリメントする
    function mintIpfsNFT(string memory name, string memory imageUrl) public {
        // 現在のトークンIDの数値を受け取る
        uint256 currentTokenId = _tokenIds.current();

        // トークンIDを 安全に、関数の呼び出し主のアドレスに送る
        _safeMint(msg.sender, currentTokenId);

        // Web3Nfts に NFT 受け取った構造体を追加 → _TokenID でインデックスを指定して取り出す
        NftAttributes memory nftAttributes = NftAttributes({
            name: name,
            imageUrl: imageUrl
        });
        Web3Nfts.push(nftAttributes);

        // TokenId をインクリメントして重ならないようにする → Mint するときに重なってはならないため。
        _tokenIds.increment();
        console.log("NFT w/, ID : %s, minted : %s", currentTokenId, msg.sender);
    }

    // 画像データを取得して返す
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        // Base64に変換して返す。
        string memory NFTJson = Base64.encode(
            // Bytes にキャスト
            bytes(
                // String にキャスト
                string(
                    // Jsonで返すので、Jsonの型になるようにハードコーディングする。
                    abi.encodePacked(
                        "{",
                        // Json Name の 左辺 ###############
                        ' "Name" : ',
                        // Json Name の 右辺 ###############
                        '"', // " を記載
                        Web3Nfts[tokenId].name,
                        " -- NFT #: ",
                        Strings.toString(tokenId), //  Int → String
                        '"', // " を記載
                        // Json description ###############
                        ' "description": "An epic NFT"',
                        // Json image の 右辺 ###############
                        ' "image" : ',
                        // Json image の 右辺 ###############
                        '"', // " を記載
                        "ipfs://",
                        Web3Nfts[tokenId].imageUrl,
                        '"', // " を記載
                        "}"
                    )
                )
            )
        );

        // Json をString で返す。→ Opensea で使えるJson にして返す。
        string memory outOutNFTJson = string(
            abi.encodePacked("data:application/json;base64,", NFTJson)
        );

        return outOutNFTJson;
    }
}
