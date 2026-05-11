const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAll, updateStock } = require('../controllers/inventoryController');

router.use(auth);
router.get('/', getAll);
router.patch('/:id', updateStock);

module.exports = router;
