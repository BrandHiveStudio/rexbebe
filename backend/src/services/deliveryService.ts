export class DeliveryService {
  async trackDelivery(trackingNumber: string) {
    return {
      trackingNumber,
      carrier: 'REXBEBE Express Express / Pronto',
      status: 'IN_TRANSIT',
      estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(),
      timeline: [
        { time: new Date(Date.now() - 86400000).toISOString(), status: 'Order Dispatched from Colombo Fulfillment Hub' },
        { time: new Date().toISOString(), status: 'In Transit to Regional Sorting Facility' }
      ]
    };
  }
}
