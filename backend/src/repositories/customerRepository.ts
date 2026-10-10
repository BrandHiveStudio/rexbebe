export interface MockCustomer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
}

const MOCK_CUSTOMERS: MockCustomer[] = [
  {
    id: 'cust-1',
    userId: 'user-1',
    name: 'Elena Rostova',
    email: 'elena@example.com',
    phone: '+94 77 123 4567',
    role: 'CUSTOMER',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'cust-admin',
    userId: 'user-admin',
    name: 'REXBEBE Administrator',
    email: 'admin@rexbebe.com',
    phone: '+94 11 234 5678',
    role: 'ADMIN',
    createdAt: '2026-01-01T08:00:00.000Z',
  }
];

export class CustomerRepository {
  private customers: MockCustomer[] = [...MOCK_CUSTOMERS];

  async findAll(): Promise<MockCustomer[]> {
    return this.customers;
  }

  async findById(id: string): Promise<MockCustomer | null> {
    return this.customers.find(c => c.id === id || c.userId === id) || null;
  }

  async findByEmail(email: string): Promise<MockCustomer | null> {
    return this.customers.find(c => c.email.toLowerCase() === email.toLowerCase()) || null;
  }
}
