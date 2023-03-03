const nftModel = require("../models/nft");
const { createNftValidation } = require("../utils/validation");
var cronJob = require("cron").CronJob;
var cron = require("node-cron");
const { ethers } = require("ethers");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { statusCodes } = require("../utils/utility");
const { contractId, ABI } = require("../constant");
 
 
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(contractId, ABI, signerOrProvider);
 
const fetchNft = async () => {
  console.log("Inside FetchNFT ")
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://eth-goerli.alchemyapi.io/v2/5nUo5YmuBU8FQYxNiXKqWWlxxXmUXHex"
    );
    const contract = fetchContract(provider);
    const data = await contract.fetchMarketItems();
    console.log("checking nft --> ", data);
 
    const dataPromiseArr = data.map(
      async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId);
        const {
          data: {
            image,
            name,
            description,
            collections,
            category,
            date,
            walletId,
          },
        } = await axios.get(tokenURI);
        const price = ethers.utils.formatUnits(
          unformattedPrice.toString(),
          "ether"
        );
        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          image,
          name,
          description,
          tokenURI,
          category,
          collections,
          date,
          walletId,
        };
      }
    );
    const items = await Promise.allSettled(dataPromiseArr);
    const results = items
      .filter((item) => item.status === "fulfilled")
      .map((item) => item.value);
    return results;
  } catch (error) {
    console.log("Error while fetching nft's", error);
  }
};
 
const getAllNftsInfura = async (req, res, next) => {
  try {
    cron.schedule("*/10 * * * * *", async () => {
      var dbData = await fetchNft();
      console.log("infura Data", dbData);
      var data = await nftModel.find();

      dbData = dbData.filter(function (cv) {
        return !data.find(function (e) {
          return e.tokenId == cv.tokenId;
        });
      })
      console.log("INFURA -> ", dbData);
      console.log("Mongo DB-> ", data);
      var saveData = await nftModel.create(dbData);
      return res.status(statusCodes[200].value).send(saveData);
    });
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
};
 
const getNft = async (req, res) => {
  try {
    const data = await nftModel.findOne({ tokenId: req.params.id });
    if (data === null) return res.status(statusCodes[404].value).send({ message: `No NFT Found` });
    return res.send({ message: `success`, data: data });
  } catch (error) {
    return res.status(statusCodes[500].value).send({ message: `Internal Server Error` });
  }
}
 
const getAllNfts = async (req, res) => {
  try {
    const data = await nftModel.find();
    if (!data) return res.status(statusCodes[404].value).send({ message: `Data not found` });
    return res.send({ message: `success`, data: data });
  } catch (error) {
    return res.status(statusCodes[500].value).send({ message: `Internal Server Error` });
  }
}
module.exports = {
  getAllNftsInfura,
  getNft,
  getAllNfts,
  fetchContract,
  fetchNft,
};