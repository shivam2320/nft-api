import type { NextApiRequest, NextApiResponse } from "next";

type nftData = {
  network: string;
  chain: string;
  tokenAddress: string;
  tokenId: string;
  name: string;
  symbol: string;
  image: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token_address = req.query.token_address;
  const token_id = req.query.token_id;
  const network = req.query.network;

  if (network == "evm") {
    const chain = req.query.chain;
    let url = `https://deep-index.moralis.io/api/v2.2/nft/${token_address}/${token_id}?chain=${chain}&format=decimal&media_items=false`;
    let apiKey = process.env.MORALIS_API_KEY;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey!,
      },
    });
    let data = await response.json();
    let image = JSON.parse(data.metadata).image;

    let nftData: nftData = {
      network: network,
      chain: chain as string,
      tokenAddress: data.token_address,
      tokenId: data.token_id,
      name: data.name,
      symbol: data.symbol,
      image: image,
    };

    res.status(200).json(nftData);
  }
}
