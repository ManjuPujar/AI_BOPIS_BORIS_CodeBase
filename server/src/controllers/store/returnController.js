const returnService = require('../../services/returnService');
const notificationService = require('../../services/notificationService');

const getReturnById = async (req, res, next) => {
  try {
    const storeId = req.query.allStores === 'true' ? null : req.storeUser.storeId;
    const returnDoc = await returnService.getReturnById(req.params.returnId, storeId);
    res.status(200).json({ return: returnDoc });
  } catch (error) {
    next(error);
  }
};

const getStoreReturns = async (req, res, next) => {
  try {
    const status = req.query.status || null;
    const storeId = req.query.allStores === 'true' ? null : req.storeUser.storeId;
    const returns = await returnService.getStoreReturns(storeId, status);
    res.status(200).json({ returns });
  } catch (error) {
    next(error);
  }
};

const acceptReturn = async (req, res, next) => {
  try {
    const returnRecord = await returnService.acceptReturn(
      req.params.returnId,
      null,
      req.storeUser._id
    );
    res.status(200).json(returnRecord);
    notificationService.notifyCustomerReturnUpdate(returnRecord.customerId, returnRecord).catch(() => {});
  } catch (error) {
    next(error);
  }
};

const completeReturn = async (req, res, next) => {
  try {
    const returnRecord = await returnService.completeReturn(
      req.params.returnId,
      null,
      req.storeUser._id
    );
    res.status(200).json(returnRecord);
    notificationService.notifyCustomerReturnUpdate(returnRecord.customerId, returnRecord).catch(() => {});
  } catch (error) {
    next(error);
  }
};

const rejectReturn = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const result = await returnService.rejectReturn(
      req.params.returnId, null, req.storeUser._id, reason
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
      req.params.returnId, null, req.storeUser._id, !!passed
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
      req.params.returnId, null, req.storeUser._id, reason
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReturnById,
  getStoreReturns,
  acceptReturn,
  completeReturn,
  rejectReturn,
  verifyReturnProduct,
  cancelReturn,
};
