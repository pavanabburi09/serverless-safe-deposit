const express = require('express');
const {
    getUserByEmail,
    loginUser,
    welcomeUser,
    logoutUser,
    updateBalance,
    getUserDetails,
    getAllTransactions, getTransactionsForAUser
} = require("./controller");
const userRouter = express.Router();

userRouter.param('email', getUserByEmail)


userRouter.get('/', welcomeUser)
userRouter.get("/user/:email", getUserDetails);
userRouter.post("/user/login", loginUser);
userRouter.post("/user/logout", logoutUser);
userRouter.post("/user/updateBalance/:email", updateBalance);
userRouter.get('/admin/transactions/all', getAllTransactions)
userRouter.get('/user/transactions/:email', getTransactionsForAUser)

module.exports = userRouter;