import { Router } from 'express';
import {
  getDeliverySettings,
  updateDeliverySettings,
  calculateDelivery,
  getDeliveryZones,
  getDeliveryZoneById,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
  addTownToZone,
  removeTownFromZone,
  reassignTown,
  updatePolicy,
  lookupZone,
} from '../controllers/deliveryController';

const router = Router();

// General Delivery Settings & Pricing
router.get('/', getDeliverySettings);
router.put('/', updateDeliverySettings);
router.post('/calculate', calculateDelivery);

// Delivery Policy
router.put('/policy', updatePolicy);

// Zone Lookups
router.post('/lookup-zone', lookupZone);

// Delivery Zones Management
router.get('/zones', getDeliveryZones);
router.post('/zones', createDeliveryZone);
router.post('/zones/reassign-town', reassignTown);
router.get('/zones/:id', getDeliveryZoneById);
router.put('/zones/:id', updateDeliveryZone);
router.delete('/zones/:id', deleteDeliveryZone);
router.post('/zones/:id/towns', addTownToZone);
router.delete('/zones/:id/towns/:town', removeTownFromZone);

export default router;
