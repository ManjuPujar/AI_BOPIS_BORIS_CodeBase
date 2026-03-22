const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = require('./src/app');
const logger = require('./src/utils/logger');

const Customer = require('./src/models/Customer');
const Product = require('./src/models/Product');
const Store = require('./src/models/Store');
const StoreInventory = require('./src/models/StoreInventory');
const DigitalInventory = require('./src/models/DigitalInventory');
const StoreUser = require('./src/models/StoreUser');

const products = [
  {
    name: 'Chuck Taylor All Star Classic',
    slug: 'chuck-taylor-all-star-classic',
    description: 'The iconic Chuck Taylor All Star sneaker. A timeless classic since 1917, featuring the signature rubber toe cap, canvas upper, and All Star ankle patch.',
    brand: 'Converse',
    category: 'Shoes',
    sku: 'CONV-CT-CLASSIC-001',
    basePrice: 65.00,
    images: [
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600',
      'https://images.unsplash.com/photo-1494496195158-c3becb4f2475?w=600',
    ],
    sizes: [
      { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' },
      { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Red', hex: '#C8102E' }],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star High Top',
    slug: 'chuck-taylor-all-star-high-top',
    description: 'The original high-top basketball shoe. Canvas upper with rubber sole, metal eyelets, and the iconic All Star patch on the ankle.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-CT-HIGH-002',
    basePrice: 70.00, salePrice: 59.99,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600'],
    sizes: [
      { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' },
      { size: '12', sizeLabel: 'US 12' }, { size: '13', sizeLabel: 'US 13' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Navy', hex: '#1B2A4A' }, { name: 'Optical White', hex: '#F5F5F5' }],
    isActive: true,
  },
  {
    name: 'Chuck 70 High Top',
    slug: 'chuck-70-high-top',
    description: 'A premium rebuild of the original Chuck Taylor with heavier canvas, vintage details, and OrthoLite cushioned insole.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-C70-HIGH-003',
    basePrice: 90.00,
    images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600'],
    sizes: [
      { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' }, { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Parchment', hex: '#D4C9B0' }],
    isActive: true,
  },
  {
    name: 'One Star Pro Suede',
    slug: 'one-star-pro-suede',
    description: 'Built for skating, loved by all. Premium suede upper with CX foam sockliner for superior cushioning.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-OS-PRO-004',
    basePrice: 85.00, salePrice: 72.99,
    images: ['https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600', 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600'],
    sizes: [
      { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Green', hex: '#2D5A27' }],
    isActive: true,
  },
  {
    name: 'Run Star Hike Platform',
    slug: 'run-star-hike-platform',
    description: 'A bold reimagining with an exaggerated jagged sole, canvas upper, and elevated platform for a statement look.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-RSH-PLAT-005',
    basePrice: 110.00,
    images: ['https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600'],
    sizes: [
      { size: '5', sizeLabel: 'US 5' }, { size: '6', sizeLabel: 'US 6' },
      { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star Leather',
    slug: 'chuck-taylor-all-star-leather',
    description: 'The classic Chuck Taylor upgraded with full-grain leather upper for a premium look. Perfect for all seasons.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-CT-LTHR-006',
    basePrice: 75.00,
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600', 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=600'],
    sizes: [
      { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' },
      { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }],
    isActive: true,
  },
  {
    name: 'Star Player 76',
    slug: 'star-player-76',
    description: 'A court-ready classic with heritage basketball style. Leather and suede upper with OrthoLite insole.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-SP76-007',
    basePrice: 80.00, salePrice: 64.99,
    images: ['https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600', 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=600'],
    sizes: [
      { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' }, { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Vintage Burgundy', hex: '#722F37' }],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star Lugged',
    slug: 'chuck-taylor-all-star-lugged',
    description: 'The Chuck Taylor with an aggressive lugged sole for extra traction and a rugged look.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-CT-LUG-008',
    basePrice: 95.00, salePrice: 79.99,
    images: ['https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=600', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600'],
    sizes: [
      { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Dark Brown', hex: '#3E2723' }],
    isActive: true,
  },
  {
    name: 'One Star Ox Low Top',
    slug: 'one-star-ox-low-top',
    description: 'The classic One Star silhouette in a clean low-top. Premium suede upper with signature star logo and durable rubber outsole.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-OS-OX-009',
    basePrice: 80.00,
    images: ['https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600', 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600'],
    sizes: [
      { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Navy', hex: '#1B2A4A' }],
    isActive: true,
  },
  {
    name: 'One Star Academy Pro',
    slug: 'one-star-academy-pro',
    description: 'Elevated One Star with premium tumbled leather upper, CONS CX cushioning, and enhanced durability.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-OS-ACAD-010',
    basePrice: 95.00, salePrice: 79.99,
    images: ['https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600', 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=600'],
    sizes: [
      { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' }, { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Egret', hex: '#F0EAD6' }],
    isActive: true,
  },
  {
    name: 'Run Star Motion Canvas',
    slug: 'run-star-motion-canvas',
    description: 'Modern Run Star with CX foam midsole, motion-inspired traction pattern, and bold silhouette.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-RSM-CVS-011',
    basePrice: 120.00,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600'],
    sizes: [
      { size: '5', sizeLabel: 'US 5' }, { size: '6', sizeLabel: 'US 6' },
      { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }],
    isActive: true,
  },
  {
    name: 'Run Star Legacy CX',
    slug: 'run-star-legacy-cx',
    description: 'Heritage-meets-innovation with CONS CX foam technology, a bold stacked sole, and heritage design cues.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-RSLCX-012',
    basePrice: 130.00, salePrice: 99.99,
    images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600', 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600'],
    sizes: [
      { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Desert Sand', hex: '#C2B280' }],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star Move',
    slug: 'chuck-taylor-all-star-move',
    description: 'The Chuck Taylor reinvented with a chunky platform sole, canvas upper, and OrthoLite insole.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-CT-MOVE-013',
    basePrice: 85.00, salePrice: 69.99,
    images: ['https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=600', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600'],
    sizes: [
      { size: '5', sizeLabel: 'US 5' }, { size: '6', sizeLabel: 'US 6' },
      { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Pink', hex: '#FFB6C1' }],
    isActive: true,
  },
];

const stores = [
  {
    name: 'Converse Flagship NYC', storeCode: 'CONV-NYC-001',
    address: { street: '91 5th Avenue', city: 'New York', state: 'NY', zipcode: '10003', country: 'US' },
    location: { type: 'Point', coordinates: [-73.9934, 40.7371] },
    phone: '(212) 555-0101', email: 'nyc.flagship@converse.com',
    operatingHours: { monday: { open: '10:00', close: '21:00' }, tuesday: { open: '10:00', close: '21:00' }, wednesday: { open: '10:00', close: '21:00' }, thursday: { open: '10:00', close: '21:00' }, friday: { open: '10:00', close: '22:00' }, saturday: { open: '09:00', close: '22:00' }, sunday: { open: '11:00', close: '19:00' } },
    isActive: true,
  },
  {
    name: 'Converse Store SoHo', storeCode: 'CONV-NYC-002',
    address: { street: '560 Broadway', city: 'New York', state: 'NY', zipcode: '10012', country: 'US' },
    location: { type: 'Point', coordinates: [-73.9968, 40.7234] },
    phone: '(212) 555-0102', email: 'soho@converse.com',
    operatingHours: { monday: { open: '10:00', close: '20:00' }, tuesday: { open: '10:00', close: '20:00' }, wednesday: { open: '10:00', close: '20:00' }, thursday: { open: '10:00', close: '20:00' }, friday: { open: '10:00', close: '21:00' }, saturday: { open: '10:00', close: '21:00' }, sunday: { open: '11:00', close: '19:00' } },
    isActive: true,
  },
  {
    name: 'Converse Beverly Hills', storeCode: 'CONV-LA-001',
    address: { street: '310 N Beverly Dr', city: 'Beverly Hills', state: 'CA', zipcode: '90210', country: 'US' },
    location: { type: 'Point', coordinates: [-118.4003, 34.0696] },
    phone: '(310) 555-0201', email: 'beverlyhills@converse.com',
    operatingHours: { monday: { open: '10:00', close: '20:00' }, tuesday: { open: '10:00', close: '20:00' }, wednesday: { open: '10:00', close: '20:00' }, thursday: { open: '10:00', close: '20:00' }, friday: { open: '10:00', close: '21:00' }, saturday: { open: '10:00', close: '21:00' }, sunday: { open: '11:00', close: '18:00' } },
    isActive: true,
  },
  {
    name: 'Converse Chicago Flagship', storeCode: 'CONV-CHI-001',
    address: { street: '875 N Michigan Ave', city: 'Chicago', state: 'IL', zipcode: '60611', country: 'US' },
    location: { type: 'Point', coordinates: [-87.6244, 41.8975] },
    phone: '(312) 555-0301', email: 'chicago@converse.com',
    operatingHours: { monday: { open: '10:00', close: '20:00' }, tuesday: { open: '10:00', close: '20:00' }, wednesday: { open: '10:00', close: '20:00' }, thursday: { open: '10:00', close: '20:00' }, friday: { open: '10:00', close: '21:00' }, saturday: { open: '09:00', close: '21:00' }, sunday: { open: '11:00', close: '18:00' } },
    isActive: true,
  },
  {
    name: 'Converse Boston', storeCode: 'CONV-BOS-001',
    address: { street: '348 Newbury St', city: 'Boston', state: 'MA', zipcode: '02115', country: 'US' },
    location: { type: 'Point', coordinates: [-71.0872, 42.3489] },
    phone: '(617) 555-0401', email: 'boston@converse.com',
    operatingHours: { monday: { open: '10:00', close: '20:00' }, tuesday: { open: '10:00', close: '20:00' }, wednesday: { open: '10:00', close: '20:00' }, thursday: { open: '10:00', close: '20:00' }, friday: { open: '10:00', close: '21:00' }, saturday: { open: '09:00', close: '21:00' }, sunday: { open: '11:00', close: '19:00' } },
    isActive: true,
  },
  {
    name: 'Converse Austin', storeCode: 'CONV-AUS-001',
    address: { street: '200 Congress Ave', city: 'Austin', state: 'TX', zipcode: '78701', country: 'US' },
    location: { type: 'Point', coordinates: [-97.7431, 30.2672] },
    phone: '(512) 555-0501', email: 'austin@converse.com',
    operatingHours: { monday: { open: '10:00', close: '20:00' }, tuesday: { open: '10:00', close: '20:00' }, wednesday: { open: '10:00', close: '20:00' }, thursday: { open: '10:00', close: '20:00' }, friday: { open: '10:00', close: '21:00' }, saturday: { open: '10:00', close: '21:00' }, sunday: { open: '12:00', close: '18:00' } },
    isActive: true,
  },
];

async function seedAndStart() {
  try {
    // Start in-memory MongoDB
    const { MongoMemoryReplSet } = require('mongodb-memory-server');
    console.log('Starting in-memory MongoDB replica set (this may take 15-30s)...');
    const mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = mongoServer.getUri();
    console.log(`In-memory MongoDB replica set started at: ${uri}`);

    await mongoose.connect(uri);
    console.log('Connected to MongoDB\n');

    // Seed Products
    console.log('Seeding products...');
    const createdProducts = await Product.insertMany(products);
    console.log(`  Created ${createdProducts.length} products`);

    // Seed Stores
    console.log('Seeding stores...');
    const createdStores = await Store.insertMany(stores);
    await Store.ensureIndexes();
    console.log(`  Created ${createdStores.length} stores`);

    // Seed Store Inventory
    console.log('Seeding store inventory...');
    const storeInventoryDocs = [];
    for (const store of createdStores) {
      for (const product of createdProducts) {
        for (const sizeObj of product.sizes) {
          storeInventoryDocs.push({
            storeId: store._id,
            productId: product._id,
            sku: product.sku,
            size: sizeObj.size,
            color: product.colors[0]?.name || 'Black',
            quantityOnHand: Math.floor(Math.random() * 15) + 3,
            quantityReserved: 0,
          });
        }
      }
    }
    await StoreInventory.insertMany(storeInventoryDocs);
    console.log(`  Created ${storeInventoryDocs.length} store inventory records`);

    // Seed Digital Inventory
    console.log('Seeding digital inventory...');
    const digitalInventoryDocs = [];
    for (const product of createdProducts) {
      for (const sizeObj of product.sizes) {
        digitalInventoryDocs.push({
          productId: product._id,
          sku: product.sku,
          size: sizeObj.size,
          color: product.colors[0]?.name || 'Black',
          quantityOnHand: Math.floor(Math.random() * 50) + 20,
          quantityReserved: 0,
        });
      }
    }
    await DigitalInventory.insertMany(digitalInventoryDocs);
    console.log(`  Created ${digitalInventoryDocs.length} digital inventory records`);

    // Seed Test Customer
    console.log('Seeding test customer...');
    await Customer.create({
      firstName: 'John', lastName: 'Doe',
      email: 'john@example.com', passwordHash: 'Test1234', phone: '555-123-4567',
      addresses: [{ label: 'Home', street: '123 Main St', city: 'New York', state: 'NY', zipcode: '10001', isDefault: true }],
      isActive: true,
    });
    console.log('  Created test customer: john@example.com / Test1234');

    // Seed Store Users
    console.log('Seeding store employees...');
    for (const store of createdStores) {
      const code = store.storeCode.toLowerCase().replace(/-/g, '');
      await StoreUser.create({
        firstName: 'Manager', lastName: store.name.split(' ').pop(),
        email: `manager@${code}.com`, passwordHash: 'Store1234',
        storeId: store._id, role: 'store_manager', isActive: true,
      });
    }
    console.log(`  Created ${createdStores.length} store managers`);

    console.log('\n========================================');
    console.log('  SEED COMPLETE - STARTING SERVER');
    console.log('========================================\n');
    console.log('Test Accounts:');
    console.log('  CUSTOMER: john@example.com / Test1234');
    console.log('  STORE:    manager@convnyc001.com / Store1234');
    console.log('\nZipcodes: 10001 (NYC), 90210 (LA), 60601 (CHI), 02101 (BOS), 78701 (AUS)');
    console.log('========================================\n');

    // Start Express server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('Customer site: http://localhost:3000');
      console.log('Store portal:  http://localhost:3001');
      console.log('\nPress Ctrl+C to stop.\n');
    });

  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

seedAndStart();
