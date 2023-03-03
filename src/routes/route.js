const express = require('express');
const router = express.Router();
const nftController = require('../controller/nftController');
const userController = require('../controller/userController');
const collectionController = require('../controller/collectionController');
const { getUserList, getUserById, updateUser, blockUser, getUserNfts, getAllNft, getCategory, createTransaction, getTransaction, createCategory, registerAndLoginAdmin, login, getCategoryById, updateCategory, deleteCategory, searchUser, dashboard } = require('../controller/admin');

router.get("/nfts/infura", nftController.getAllNftsInfura);

router.get("/nfts", nftController.getAllNfts);

router.get("/nfts/:id", nftController.getNft);

router.post('/users', userController.createUser);

router.get('/users/:address', userController.getUser);

router.put('/collection/:id', collectionController.createCollection);

router.get('/admin/collection/:id', collectionController.getCollection);

router.get('/admin/collection', collectionController.getAllCollections);


/**
 * ADMIN API's
 */

router.post("/admin/register", registerAndLoginAdmin);

router.post("/admin/login", login);

router.get("/admin/user", getUserList);

router.get("/admin/user/:id", getUserById);

router.put("/admin/user/:address", updateUser);

router.delete("/admin/user/:id", blockUser);

router.get("/admin/nft/:address", getUserNfts);

router.get("/admin/nft", getAllNft);

router.post("/admin/transaction", createTransaction);

router.get("/admin/transaction", getTransaction);

router.post("/admin/category", createCategory);

router.get("/admin/category", getCategory);

router.get("/admin/category/:id", getCategoryById);

router.put("/admin/category/:id", updateCategory);

router.delete("/admin/category/:id", deleteCategory);

router.get("/admin/dashboard", dashboard);

router.get("/admin/searchUser", searchUser);



module.exports = router;