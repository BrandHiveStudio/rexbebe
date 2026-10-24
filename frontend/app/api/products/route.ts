import { NextResponse } from 'next/server';
import { serverStore } from '../../../lib/serverApi';

export async function GET() {
  const products = serverStore.getProducts();
  return NextResponse.json({
    success: true,
    message: 'Products retrieved',
    data: products,
  });
}
