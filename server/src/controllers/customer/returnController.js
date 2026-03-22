const returnService = require('../../services/returnService');

const createReturn = async (req, res, next) => {
  try {
    const returnData = { ...req.body, customerId: req.customer._id };
    const returnRecord = await returnService.createReturn(returnData);
    res.status(201).json(returnRecord);
  } catch (error) {
    next(error);
  }
};

const getMyReturns = async (req, res, next) => {
  try {
    const returns = await returnService.getCustomerReturns(req.customer._id);
    res.status(200).json(returns);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReturn,
  getMyReturns,
};
