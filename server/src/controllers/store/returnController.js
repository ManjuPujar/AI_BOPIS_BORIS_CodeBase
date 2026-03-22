const returnService = require('../../services/returnService');
const notificationService = require('../../services/notificationService');

const getStoreReturns = async (req, res, next) => {
  try {
    const status = req.query.status || null;
    const returns = await returnService.getStoreReturns(req.storeUser.storeId, status);
    res.status(200).json(returns);
  } catch (error) {
    next(error);
  }
};

const acceptReturn = async (req, res, next) => {
  try {
    const returnRecord = await returnService.acceptReturn(
      req.params.returnId,
      req.storeUser.storeId,
      req.storeUser._id
    );
    await notificationService.notifyCustomerReturnUpdate(returnRecord.customerId, returnRecord);
    res.status(200).json(returnRecord);
  } catch (error) {
    next(error);
  }
};

const completeReturn = async (req, res, next) => {
  try {
    const returnRecord = await returnService.completeReturn(
      req.params.returnId,
      req.storeUser.storeId,
      req.storeUser._id
    );
    await notificationService.notifyCustomerReturnUpdate(returnRecord.customerId, returnRecord);
    res.status(200).json(returnRecord);
  } catch (error) {
    next(error);
  }
};

const rejectReturn = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const result = await returnService.rejectReturn(
      req.params.returnId, req.storeUser.storeId, req.storeUser._id, reason
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const verifyReturnProduct = async (req, res, next) => {
  try {
    const { passed } = req.body;
    const result = await returnService.verifyReturnProduct(
      req.params.returnId, req.storeUser.storeId, req.storeUser._id, !!passed
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const cancelReturn = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const result = await returnService.cancelReturn(
      req.params.returnId, req.storeUser.storeId, req.storeUser._id, reason
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStoreReturns,
  acceptReturn,
  completeReturn,
  rejectReturn,
  verifyReturnProduct,
  cancelReturn,
};
