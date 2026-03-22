const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const Customer = require('./src/models/Customer');
const Product = require('./src/models/Product');
const Store = require('./src/models/Store');
const StoreInventory = require('./src/models/StoreInventory');
const DigitalInventory = require('./src/models/DigitalInventory');
const StoreUser = require('./src/models/StoreUser');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/converse_bopis';

const products = [
  {
    name: 'Chuck Taylor All Star Classic',
    slug: 'chuck-taylor-all-star-classic',
    description: 'The iconic Chuck Taylor All Star sneaker. A timeless classic since 1917, featuring the signature rubber toe cap, canvas upper, and All Star ankle patch.',
    brand: 'Converse',
    category: 'Shoes',
    sku: 'CONV-CT-CLASSIC-001',
    basePrice: 65.00,
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600',
      'https://images.unsplash.com/photo-1494496195158-c3becb4f2475?w=600',
    ],
    sizes: [
      { size: '6', sizeLabel: 'US 6' },
      { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' },
      { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Red', hex: '#C8102E' },
    ],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star High Top',
    slug: 'chuck-taylor-all-star-high-top',
    description: 'The original high-top basketball shoe. Canvas upper with rubber sole, metal eyelets, and the iconic All Star patch on the ankle.',
    brand: 'Converse',
    category: 'Shoes',
    sku: 'CONV-CT-HIGH-002',
    basePrice: 70.00,
    salePrice: 59.99,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600',
    ],
    sizes: [
      { size: '6', sizeLabel: 'US 6' },
      { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' },
      { size: '12', sizeLabel: 'US 12' },
      { size: '13', sizeLabel: 'US 13' },
    ],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Navy', hex: '#1B2A4A' },
      { name: 'Optical White', hex: '#F5F5F5' },
    ],
    isActive: true,
  },
  {
    name: 'Chuck 70 High Top',
    slug: 'chuck-70-high-top',
    description: 'A premium rebuild of the original Chuck Taylor. Features heavier canvas, vintage details, higher rubber foxing, and an OrthoLite cushioned insole.',
    brand: 'Converse',
    category: 'Shoes',
    sku: 'CONV-C70-HIGH-003',
    basePrice: 90.00,
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600',
    ],
    sizes: [
      { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' },
      { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Parchment', hex: '#D4C9B0' },
    ],
    isActive: true,
  },
  {
    name: 'One Star Pro Suede',
    slug: 'one-star-pro-suede',
    description: 'Built for skating, loved by all. Premium suede upper with a CX foam sockliner for superior cushioning and a grippy rubber outsole.',
    brand: 'Converse',
    category: 'Shoes',
    sku: 'CONV-OS-PRO-004',
    basePrice: 85.00,
    salePrice: 72.99,
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600',
    ],
    sizes: [
      { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' },
    ],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Green', hex: '#2D5A27' },
    ],
    isActive: true,
  },
  {
    name: 'Run Star Hike Platform',
    slug: 'run-star-hike-platform',
    description: 'A bold reimagining of the classic Chuck Taylor with an exaggerated jagged sole, canvas upper, and elevated platform for a statement look.',
    brand: 'Converse',
    category: 'Shoes',
    sku: 'CONV-RSH-PLAT-005',
    basePrice: 110.00,
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600',
    ],
    sizes: [
      { size: '5', sizeLabel: 'US 5' },
      { size: '6', sizeLabel: 'US 6' },
      { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' },
    ],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star Leather',
    slug: 'chuck-taylor-all-star-leather',
    description: 'The classic Chuck Taylor upgraded with a full-grain leather upper for a premium look. Perfect for all seasons.',
    brand: 'Converse',
    category: 'Shoes',
    sku: 'CONV-CT-LTHR-006',
    basePrice: 75.00,
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
      'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=600',
    ],
    sizes: [
      { size: '6', sizeLabel: 'US 6' },
      { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' },
      { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    isActive: true,
  },
  {
    name: 'Star Player 76',
    slug: 'star-player-76',
    description: 'A court-ready classic with heritage Converse basketball style. Leather and suede upper with a comfortable OrthoLite insole.',
    brand: 'Converse',
    category: 'Shoes',
    sku: 'CONV-SP76-007',
    basePrice: 80.00,
    salePrice: 64.99,
    images: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600',
      'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=600',
    ],
    sizes: [
      { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' },
      { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Vintage Burgundy', hex: '#722F37' },
    ],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star Lugged',
    slug: 'chuck-taylor-all-star-lugged',
    description: 'The Chuck Taylor with an aggressive lugged sole for extra traction and a rugged look. Ready for any terrain.',
    brand: 'Converse',
    category: 'Shoes',
    sku: 'CONV-CT-LUG-008',
    basePrice: 95.00,
    salePrice: 79.99,
    images: [
      'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=600',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600',
    ],
    sizes: [
      { size: '6', sizeLabel: 'US 6' },
      { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' },
    ],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Dark Brown', hex: '#3E2723' },
    ],
    isActive: true,
  },
];

const stores = [
  {
    name: 'Converse Flagship NYC',
    storeCode: 'CONV-NYC-001',
    address: { street: '91 5th Avenue', city: 'New York', state: 'NY', zipcode: '10003', country: 'US' },
    location: { type: 'Point', coordinates: [-73.9934, 40.7371] },
    phone: '(212) 555-0101',
    email: 'nyc.flagship@converse.com',
    operatingHours: {
      monday: { open: '10:00', close: '21:00' },
      tuesday: { open: '10:00', close: '21:00' },
      wednesday: { open: '10:00', close: '21:00' },
      thursday: { open: '10:00', close: '21:00' },
      friday: { open: '10:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '11:00', close: '19:00' },
    },
    isActive: true,
  },
  {
    name: 'Converse Store SoHo',
    storeCode: 'CONV-NYC-002',
    address: { street: '560 Broadway', city: 'New York', state: 'NY', zipcode: '10012', country: 'US' },
    location: { type: 'Point', coordinates: [-73.9968, 40.7234] },
    phone: '(212) 555-0102',
    email: 'soho@converse.com',
    operatingHours: {
      monday: { open: '10:00', close: '20:00' },
      tuesday: { open: '10:00', close: '20:00' },
      wednesday: { open: '10:00', close: '20:00' },
      thursday: { open: '10:00', close: '20:00' },
      friday: { open: '10:00', close: '21:00' },
      saturday: { open: '10:00', close: '21:00' },
      sunday: { open: '11:00', close: '19:00' },
    },
    isActive: true,
  },
  {
    name: 'Converse Beverly Hills',
    storeCode: 'CONV-LA-001',
    address: { street: '310 N Beverly Dr', city: 'Beverly Hills', state: 'CA', zipcode: '90210', country: 'US' },
    location: { type: 'Point', coordinates: [-118.4003, 34.0696] },
    phone: '(310) 555-0201',
    email: 'beverlyhills@converse.com',
    operatingHours: {
      monday: { open: '10:00', close: '20:00' },
      tuesday: { open: '10:00', close: '20:00' },
      wednesday: { open: '10:00', close: '20:00' },
      thursday: { open: '10:00', close: '20:00' },
      friday: { open: '10:00', close: '21:00' },
      saturday: { open: '10:00', close: '21:00' },
      sunday: { open: '11:00', close: '18:00' },
    },
    isActive: true,
  },
  {
    name: 'Converse Chicago Flagship',
    storeCode: 'CONV-CHI-001',
    address: { street: '875 N Michigan Ave', city: 'Chicago', state: 'IL', zipcode: '60611', country: 'US' },
    location: { type: 'Point', coordinates: [-87.6244, 41.8975] },
    phone: '(312) 555-0301',
    email: 'chicago@converse.com',
    operatingHours: {
      monday: { open: '10:00', close: '20:00' },
      tuesday: { open: '10:00', close: '20:00' },
      wednesday: { open: '10:00', close: '20:00' },
      thursday: { open: '10:00', close: '20:00' },
      friday: { open: '10:00', close: '21:00' },
      saturday: { open: '09:00', close: '21:00' },
      sunday: { open: '11:00', close: '18:00' },
    },
    isActive: true,
  },
  {
    name: 'Converse Boston',
    storeCode: 'CONV-BOS-001',
    address: { street: '348 Newbury St', city: 'Boston', state: 'MA', zipcode: '02115', country: 'US' },
    location: { type: 'Point', coordinates: [-71.0872, 42.3489] },
    phone: '(617) 555-0401',
    email: 'boston@converse.com',
    operatingHours: {
      monday: { open: '10:00', close: '20:00' },
      tuesday: { open: '10:00', close: '20:00' },
      wednesday: { open: '10:00', close: '20:00' },
      thursday: { open: '10:00', close: '20:00' },
      friday: { open: '10:00', close: '21:00' },
      saturday: { open: '09:00', close: '21:00' },
      sunday: { open: '11:00', close: '19:00' },
    },
    isActive: true,
  },
  {
    name: 'Converse Austin',
    storeCode: 'CONV-AUS-001',
    address: { street: '200 Congress Ave', city: 'Austin', state: 'TX', zipcode: '78701', country: 'US' },
    location: { type: 'Point', coordinates: [-97.7431, 30.2672] },
    phone: '(512) 555-0501',
    email: 'austin@converse.com',
    operatingHours: {
      monday: { open: '10:00', close: '20:00' },
      tuesday: { open: '10:00', close: '20:00' },
      wednesday: { open: '10:00', close: '20:00' },
      thursday: { open: '10:00', close: '20:00' },
      friday: { open: '10:00', close: '21:00' },
      saturday: { open: '10:00', close: '21:00' },
      sunday: { open: '12:00', close: '18:00' },
    },
    isActive: true,
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('\nClearing existing data...');
    await Promise.all([
      Customer.deleteMany({}),
      Product.deleteMany({}),
      Store.deleteMany({}),
      StoreInventory.deleteMany({}),
      DigitalInventory.deleteMany({}),
      StoreUser.deleteMany({}),
    ]);
    console.log('Existing data cleared');

    // Seed Products
    console.log('\nSeeding products...');
    const createdProducts = await Product.insertMany(products);
    console.log(`  Created ${createdProducts.length} products`);

    // Seed Stores
    console.log('\nSeeding stores...');
    const createdStores = await Store.insertMany(stores);
    console.log(`  Created ${createdStores.length} stores`);

    // Seed Store Inventory (each store gets inventory for each product)
    console.log('\nSeeding store inventory...');
    const storeInventoryDocs = [];
    for (const store of createdStores) {
      for (const product of createdProducts) {
        for (const sizeObj of product.sizes) {
          const qtyOnHand = Math.floor(Math.random() * 15) + 3; // 3-17 units
          storeInventoryDocs.push({
            storeId: store._id,
            productId: product._id,
            sku: product.sku,
            size: sizeObj.size,
            color: product.colors[0]?.name || 'Black',
            quantityOnHand: qtyOnHand,
            quantityReserved: 0,
          });
        }
      }
    }
    await StoreInventory.insertMany(storeInventoryDocs);
    console.log(`  Created ${storeInventoryDocs.length} store inventory records`);

    // Seed Digital Inventory
    console.log('\nSeeding digital inventory...');
    const digitalInventoryDocs = [];
    for (const product of createdProducts) {
      for (const sizeObj of product.sizes) {
        digitalInventoryDocs.push({
          productId: product._id,
          sku: product.sku,
          size: sizeObj.size,
          color: product.colors[0]?.name || 'Black',
          quantityOnHand: Math.floor(Math.random() * 50) + 20, // 20-69 units
          quantityReserved: 0,
        });
      }
    }
    await DigitalInventory.insertMany(digitalInventoryDocs);
    console.log(`  Created ${digitalInventoryDocs.length} digital inventory records`);

    // Seed Test Customer
    console.log('\nSeeding test customer...');
    const passwordHash = await bcrypt.hash('Test1234', 12);
    await Customer.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      passwordHash,
      phone: '555-123-4567',
      addresses: [
        {
          label: 'Home',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipcode: '10001',
          isDefault: true,
        },
      ],
      isActive: true,
    });
    console.log('  Created test customer: john@example.com / Test1234');

    // Seed Store Users (one manager per store)
    console.log('\nSeeding store employees...');
    const storeUserPassword = await bcrypt.hash('Store1234', 12);
    for (const store of createdStores) {
      const storeCode = store.storeCode.toLowerCase().replace(/-/g, '');
      await StoreUser.create({
        firstName: `Manager`,
        lastName: store.name.split(' ').pop(),
        email: `manager@${storeCode}.com`,
        passwordHash: storeUserPassword,
        storeId: store._id,
        role: 'store_manager',
        isActive: true,
      });
    }
    console.log(`  Created ${createdStores.length} store managers`);

    // Print summary
    console.log('\n========================================');
    console.log('  SEED COMPLETE');
    console.log('========================================\n');
    console.log('Test Accounts:');
    console.log('----------------------------------------');
    console.log('CUSTOMER SITE (http://localhost:3000):');
    console.log('  Email:    john@example.com');
    console.log('  Password: Test1234');
    console.log('');
    console.log('STORE PORTAL (http://localhost:3001):');
    for (const store of createdStores) {
      const storeCode = store.storeCode.toLowerCase().replace(/-/g, '');
      console.log(`  ${store.name}`);
      console.log(`    Email:    manager@${storeCode}.com`);
      console.log(`    Password: Store1234`);
    }
    console.log('\nProducts: ' + createdProducts.length);
    console.log('Stores: ' + createdStores.length);
    console.log('Store Inventory Records: ' + storeInventoryDocs.length);
    console.log('Digital Inventory Records: ' + digitalInventoryDocs.length);
    console.log('\nZipcodes for store search:');
    console.log('  10001, 10003, 10012 → NYC stores');
    console.log('  90210 → Beverly Hills store');
    console.log('  60601, 60611 → Chicago store');
    console.log('  02101, 02115 → Boston store');
    console.log('  78701 → Austin store');
    console.log('========================================\n');

  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

seed();
