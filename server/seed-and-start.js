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
  // ──── CHUCK TAYLOR LINE ────
  {
    name: 'Chuck Taylor All Star Low Top',
    slug: 'chuck-taylor-all-star-low-top',
    description: 'The iconic Chuck Taylor All Star in the classic low-top silhouette. Featuring the signature canvas upper, rubber toe cap, and vulcanized rubber sole that started it all in 1917.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-CT-LOW-001',
    basePrice: 60.00,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw592a665e/images/a_107/M9166_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw01a3e262/images/e_08/M9166_E_08X1.jpg',
    ],
    sizes: [
      { size: '5', sizeLabel: 'US 5' }, { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' }, { size: '12', sizeLabel: 'US 12' }, { size: '13', sizeLabel: 'US 13' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Optical White', hex: '#F5F5F5' }, { name: 'Red', hex: '#C8102E' }],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star High Top',
    slug: 'chuck-taylor-all-star-high-top',
    description: 'The original high-top basketball shoe that became a cultural icon. Canvas upper with the signature rubber toe cap, metal eyelets, and the unmistakable All Star ankle patch.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-CT-HIGH-002',
    basePrice: 65.00,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw1bc80e65/images/a_107/M9160_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dwdf7a816e/images/e_08/M9160_E_08X1.jpg',
    ],
    sizes: [
      { size: '5', sizeLabel: 'US 5' }, { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' }, { size: '12', sizeLabel: 'US 12' }, { size: '13', sizeLabel: 'US 13' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Optical White', hex: '#F5F5F5' }, { name: 'Navy', hex: '#1B2A4A' }, { name: 'Red', hex: '#C8102E' }],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star Leather',
    slug: 'chuck-taylor-all-star-leather',
    description: 'The classic Chuck Taylor elevated with a premium full-grain leather upper. Same iconic silhouette, upgraded materials for a refined all-season look.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-CT-LTHR-003',
    basePrice: 75.00,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw6c3f32a3/images/a_107/132169C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw5847c7d0/images/e_08/132169C_E_08X1.jpg',
    ],
    sizes: [
      { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' },
      { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star Lift Platform',
    slug: 'chuck-taylor-all-star-lift-platform',
    description: 'The classic Chuck Taylor gets a bold lift with an elevated platform sole. Canvas upper, OrthoLite insole, and an eye-catching 1.5-inch platform for a statement silhouette.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-CT-LIFT-004',
    basePrice: 80.00,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw42ef996a/images/a_107/560251C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw2e5a0614/images/e_08/560251C_E_08X1.jpg',
    ],
    sizes: [
      { size: '5', sizeLabel: 'US 5' }, { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Pink', hex: '#FFB6C1' }],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star \'70 High Top',
    slug: 'chuck-taylor-70-high-top',
    description: 'A premium rebuild of the original Chuck Taylor. Features heavier canvas, vintage details, higher rubber foxing, and an OrthoLite cushioned insole for superior comfort.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-CT70-HIGH-005',
    basePrice: 90.00,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dwcdf12f89/images/a_107/162050C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw7b4f7bea/images/e_08/162050C_E_08X1.jpg',
    ],
    sizes: [
      { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' },
      { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Parchment', hex: '#D4C9B0' }],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star \'70 Low Top',
    slug: 'chuck-taylor-70-low-top',
    description: 'The premium Chuck 70 in a low-top cut. Heavier-weight canvas, vintage details, and OrthoLite insole deliver heritage style with modern comfort.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-CT70-LOW-006',
    basePrice: 85.00, salePrice: 69.99,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw85ebb222/images/a_107/162058C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dwd04f7e0a/images/e_08/162058C_E_08X1.jpg',
    ],
    sizes: [
      { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' },
      { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Parchment', hex: '#D4C9B0' }, { name: 'Egret', hex: '#F0EAD6' }],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star Lugged 2.0',
    slug: 'chuck-taylor-all-star-lugged-2',
    description: 'The Chuck Taylor with a heavy-duty lugged sole for extra traction and rugged style. Canvas upper meets an aggressive outsole built for all conditions.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-CT-LUG-007',
    basePrice: 95.00, salePrice: 79.99,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dweb85c3be/images/a_107/A00719C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw29ac2c51/images/e_08/A00719C_E_08X1.jpg',
    ],
    sizes: [
      { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Dark Brown', hex: '#3E2723' }],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star Move High Top',
    slug: 'chuck-taylor-all-star-move-high',
    description: 'The Chuck Taylor reimagined with a chunky platform sole for elevated street style. Canvas upper, OrthoLite insole, and a padded collar for all-day comfort.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-CT-MOVE-008',
    basePrice: 85.00, salePrice: 69.99,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dwa76bf6b2/images/a_107/568497C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw45f17671/images/e_08/568497C_E_08X1.jpg',
    ],
    sizes: [
      { size: '5', sizeLabel: 'US 5' }, { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }],
    isActive: true,
  },
  // ──── ONE STAR LINE ────
  {
    name: 'One Star Premium Suede',
    slug: 'one-star-premium-suede',
    description: 'The classic One Star in premium suede with signature star logo side detail. Clean low-top design with durable rubber outsole and padded collar.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-OS-PREM-010',
    basePrice: 80.00,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw44879c31/images/a_107/171587C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dwe27b4c59/images/e_08/171587C_E_08X1.jpg',
    ],
    sizes: [
      { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Navy', hex: '#1B2A4A' }],
    isActive: true,
  },
  {
    name: 'One Star Academy Pro',
    slug: 'one-star-academy-pro',
    description: 'Elevated One Star with premium tumbled leather upper, CONS CX cushioning, and enhanced durability for skateboarding and everyday wear.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-OS-ACAD-011',
    basePrice: 95.00, salePrice: 79.99,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw93e0b2a0/images/a_107/A07620C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw1bda32e3/images/e_08/A07620C_E_08X1.jpg',
    ],
    sizes: [
      { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' }, { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Egret', hex: '#F0EAD6' }],
    isActive: true,
  },
  {
    name: 'One Star Vintage Suede',
    slug: 'one-star-vintage-suede',
    description: 'Vintage-inspired One Star with aged suede upper and retro details. Heritage Converse style meets modern comfort with cushioned insole.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-OS-VNTG-012',
    basePrice: 75.00,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw43bbca7e/images/a_107/A04156C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw48ecb4e5/images/e_08/A04156C_E_08X1.jpg',
    ],
    sizes: [
      { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Light Gray', hex: '#C0C0C0' }, { name: 'Burgundy', hex: '#722F37' }],
    isActive: true,
  },
  // ──── RUN STAR LINE ────
  {
    name: 'Run Star Hike High Top',
    slug: 'run-star-hike-high-top',
    description: 'A bold reimagining of the classic Chuck Taylor with an exaggerated jagged sole, canvas upper, and elevated platform for a statement look that turns heads.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-RSH-HIGH-013',
    basePrice: 110.00,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw9a2b2a67/images/a_107/166800C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw26bc8a98/images/e_08/166800C_E_08X1.jpg',
    ],
    sizes: [
      { size: '5', sizeLabel: 'US 5' }, { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
      { size: '11', sizeLabel: 'US 11' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }],
    isActive: true,
  },
  {
    name: 'Run Star Hike Low Top',
    slug: 'run-star-hike-low-top',
    description: 'The Run Star Hike in a low-top cut. Same bold jagged sole and platform height with a more relaxed, easy-to-wear silhouette.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-RSH-LOW-014',
    basePrice: 100.00, salePrice: 84.99,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw5f2e8ccc/images/a_107/168817C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw1fb0f4ec/images/e_08/168817C_E_08X1.jpg',
    ],
    sizes: [
      { size: '5', sizeLabel: 'US 5' }, { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Parchment', hex: '#D4C9B0' }],
    isActive: true,
  },
  {
    name: 'Run Star Legacy CX',
    slug: 'run-star-legacy-cx',
    description: 'Heritage meets innovation with CX foam technology, a bold stacked sole, and classic Converse design cues. Maximum cushioning in a statement silhouette.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-RSLCX-015',
    basePrice: 130.00, salePrice: 99.99,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dwa62f7dfd/images/a_107/A00868C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw88b3a63c/images/e_08/A00868C_E_08X1.jpg',
    ],
    sizes: [
      { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Desert Sand', hex: '#C2B280' }],
    isActive: true,
  },
  {
    name: 'Run Star Motion Canvas',
    slug: 'run-star-motion-canvas',
    description: 'Modern Run Star with CX foam midsole, motion-inspired traction pattern, and a bold silhouette that blends athletic performance with street style.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-RSM-CVS-016',
    basePrice: 120.00,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw57a91236/images/a_107/A03541C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw2e1b4b94/images/e_08/A03541C_E_08X1.jpg',
    ],
    sizes: [
      { size: '5', sizeLabel: 'US 5' }, { size: '6', sizeLabel: 'US 6' }, { size: '7', sizeLabel: 'US 7' },
      { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }],
    isActive: true,
  },
  // ──── CLASSIC CONVERSE ────
  {
    name: 'Star Player 76',
    slug: 'star-player-76',
    description: 'A court-ready classic with heritage Converse basketball style. Leather and suede upper with star chevron branding and a comfortable OrthoLite insole.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-SP76-017',
    basePrice: 80.00, salePrice: 64.99,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dwa4cb7f7f/images/a_107/A01607C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw5b01ea3b/images/e_08/A01607C_E_08X1.jpg',
    ],
    sizes: [
      { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' }, { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Vintage Burgundy', hex: '#722F37' }],
    isActive: true,
  },
  {
    name: 'Chuck Taylor All Star Pro Mid',
    slug: 'chuck-taylor-all-star-pro-mid',
    description: 'The CONS skate-ready Chuck Taylor All Star Pro in a mid-top cut. Suede and canvas upper with CX foam insole, padded tongue, and enhanced grip rubber outsole built for the board.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-CT-PRO-018',
    basePrice: 75.00,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw3c1c5dde/images/a_107/A05321C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw7e3a2c3e/images/e_08/A05321C_E_08X1.jpg',
    ],
    sizes: [
      { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' },
      { size: '9', sizeLabel: 'US 9' }, { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' },
      { size: '12', sizeLabel: 'US 12' }, { size: '13', sizeLabel: 'US 13' },
    ],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }],
    isActive: true,
  },
  {
    name: 'Pro Leather OG High Top',
    slug: 'pro-leather-og-high-top',
    description: 'The Converse Pro Leather in its original form. Premium leather upper with the iconic chevron and star logo. A basketball heritage icon from the 1970s courts.',
    brand: 'Converse', category: 'Shoes', sku: 'CONV-PL-OG-019',
    basePrice: 90.00, salePrice: 74.99,
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw1e8b1e20/images/a_107/166810C_A_107X1.jpg',
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dwce81aaf2/images/e_08/166810C_E_08X1.jpg',
    ],
    sizes: [
      { size: '7', sizeLabel: 'US 7' }, { size: '8', sizeLabel: 'US 8' }, { size: '9', sizeLabel: 'US 9' },
      { size: '10', sizeLabel: 'US 10' }, { size: '11', sizeLabel: 'US 11' }, { size: '12', sizeLabel: 'US 12' },
    ],
    colors: [{ name: 'White/Black', hex: '#FFFFFF' }, { name: 'Black/White', hex: '#000000' }],
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
