const Store = require('../models/Store');
const StoreInventory = require('../models/StoreInventory');
const { geocodeZipcode, calculateDistance } = require('../utils/geocode');
const logger = require('../utils/logger');

const METERS_PER_MILE = 1609.34;

const findNearbyStores = async (zipcode, productId, maxDistance = 50) => {
  const coords = geocodeZipcode(zipcode);
  if (!coords) {
    throw new Error('Unable to geocode the provided zipcode');
  }

  const stores = await Store.find({
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat],
        },
        $maxDistance: maxDistance * METERS_PER_MILE,
      },
    },
  }).lean();

  const storesWithAvailability = await Promise.all(
    stores.map(async (store) => {
      let inventory = [];
      let hasProduct = false;

      if (productId) {
        inventory = await StoreInventory.find({
          storeId: store._id,
          productId,
        }).lean();

        hasProduct = inventory.some(
          (item) => item.quantityOnHand - item.quantityReserved > 0
        );
      }

      const distance = calculateDistance(
        coords.lat,
        coords.lng,
        store.location.coordinates[1],
        store.location.coordinates[0]
      );

      return {
        ...store,
        distance: parseFloat(distance.toFixed(1)),
        hasProduct,
        inventory: productId
          ? inventory.map((item) => ({
              size: item.size,
              color: item.color,
              quantityAvailable: item.quantityOnHand - item.quantityReserved,
            }))
          : undefined,
      };
    })
  );

  return storesWithAvailability.sort((a, b) => a.distance - b.distance);
};

const getStoresByDistance = async (lat, lng, maxDistanceMiles = 50) => {
  const stores = await Store.find({
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: maxDistanceMiles * METERS_PER_MILE,
      },
    },
  }).lean();

  return stores.map((store) => {
    const distance = calculateDistance(
      lat,
      lng,
      store.location.coordinates[1],
      store.location.coordinates[0]
    );

    return {
      ...store,
      distance: parseFloat(distance.toFixed(1)),
    };
  });
};

module.exports = {
  findNearbyStores,
  getStoresByDistance,
};
