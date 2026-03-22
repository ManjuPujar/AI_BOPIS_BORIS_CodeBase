const express = require('express');
const router = express.Router();
const {
  getReturnById,
  getStoreReturns,
  acceptReturn,
  completeReturn,
  rejectReturn,
  verifyReturnProduct,
  cancelReturn,
} = require('../../controllers/store/returnController');
const storeAuth = require('../../middleware/storeAuth');

router.use(storeAuth);

router.get('/', getStoreReturns);
router.get('/:returnId', getReturnById);
router.post('/:returnId/accept', acceptReturn);
router.post('/:returnId/complete', completeReturn);
router.post('/:returnId/reject', rejectReturn);
router.post('/:returnId/verify', verifyReturnProduct);
router.post('/:returnId/cancel', cancelReturn);

module.exports = router;
