import type { NextApiRequest, NextApiResponse } from "next";
import next from "next";

type nftData = {
  chain: string;
  tokenAddress: string;
  tokenId: string;
  name: string;
  symbol: string;
  tokenURI: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if ((req.query.network = "evm")) {
    const allNFTs = [];

    const address = req.query.address;

    const chains = ["eth", "polygon", "bsc", "arbitrum", "avalanche"];

    for (const chain of chains) {
      let url = `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=${chain}&format=decimal&media_items=false`;
      let apiKey = process.env.MORALIS_API_KEY;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey!,
        },
      });
      const data = await response.json();

      for (let i = 0; i < data.result.length; i++) {
        let nft: nftData = {
          chain: chain,
          tokenAddress: data.result[i].token_address,
          tokenId: data.result[i].token_id,
          name: data.result[i].name,
          symbol: data.result[i].symbol,
          tokenURI: data.result[i].token_uri,
        };
        allNFTs.push(nft);
      }
    }

    res.status(200).json(allNFTs);
  } else if ((req.query.network = "solana")) {
  } else if ((req.query.network = "aptos")) {
  }
}
