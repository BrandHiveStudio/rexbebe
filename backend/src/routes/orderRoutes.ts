import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  confirmCodOrder,
  assignCourier,
  recordDeliveryAndPayment,
  recordCodRemittance,
  getCodReports,
  addOrderNote,
  refundOrder,
  getCourierConfig,
  getKoombiyoPortalPayload,
  bookCourierManual,
  updateCourierDeliveryStatus,
  addCourierNote,
  recordDeliveryAttempt,
  initiateReturnToSender,
  recordReturnInspection,
  getUnresolvedReturnCases,
  getFailedAndReturnOrders,
  getFailureReasonsCatalog,
  getCodAnalytics,
} from '../controllers/orderController';
import { recordCodCollection, recordSettlement } from '../controllers/settlementController';

const router = Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/reports/cod', getCodReports);
router.get('/reports/cod-analytics', getCodAnalytics);
router.get('/courier/config', getCourierConfig);

// Return and Failed Delivery Sub-routes (must be before /:id)
router.get('/returns/unresolved', getUnresolvedReturnCases);
router.get('/returns/failure-reasons', getFailureReasonsCatalog);
router.get('/returns/all', getFailedAndReturnOrders);

router.get('/:id/courier/portal-payload', getKoombiyoPortalPayload);
router.get('/:id', getOrderById);

router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/confirm-cod', confirmCodOrder);
router.patch('/:id/assign-courier', assignCourier);
router.patch('/:id/record-delivery', recordDeliveryAndPayment);
router.patch('/:id/record-remittance', recordCodRemittance);

// Dedicated Koombiyo & Courier Management Endpoints
router.post('/:id/courier/book', bookCourierManual);
router.patch('/:id/courier/delivery-status', updateCourierDeliveryStatus);
router.post('/:id/courier/notes', addCourierNote);

// Failed Delivery & Return-to-Sender Workflow Endpoints
router.post('/:id/delivery-attempt', recordDeliveryAttempt);
router.post('/:id/return-to-sender', initiateReturnToSender);
router.post('/:id/return-inspection', recordReturnInspection);

// COD Collection & Settlement Endpoints
router.patch('/:id/cod-collection', recordCodCollection);
router.post('/:id/settle', (req, res, next) => {
  req.body.orderId = req.params.id;
  return recordSettlement(req, res, next);
});

router.post('/:id/notes', addOrderNote);
router.post('/:id/refund', refundOrder);

export default router;

