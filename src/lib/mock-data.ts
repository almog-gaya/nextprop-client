import { ZillowListing } from './zillow-api'

export const mockListings: ZillowListing[] = [
  {
    zpid: '12345678',
    address: {
      streetAddress: '123 Main St',
      city: 'Miami',
      state: 'FL',
      zipcode: '33101'
    },
    price: 750000,
    bedrooms: 3,
    bathrooms: 2,
    livingArea: 1800,
    daysOnZillow: 7,
    homeType: 'House',
    homeStatus: 'FOR_SALE'
  },
  {
    zpid: '23456789',
    address: {
      streetAddress: '456 Ocean Dr',
      city: 'Miami Beach',
      state: 'FL',
      zipcode: '33139'
    },
    price: 1250000,
    bedrooms: 2,
    bathrooms: 2.5,
    livingArea: 1500,
    daysOnZillow: 3,
    homeType: 'Condo',
    homeStatus: 'FOR_SALE'
  },
  {
    zpid: '34567890',
    address: {
      streetAddress: '789 Brickell Ave',
      city: 'Miami',
      state: 'FL',
      zipcode: '33131'
    },
    price: 2100000,
    bedrooms: 4,
    bathrooms: 3.5,
    livingArea: 2800,
    daysOnZillow: 14,
    homeType: 'House',
    homeStatus: 'FOR_SALE'
  },
  {
    zpid: '45678901',
    address: {
      streetAddress: '101 Coral Way',
      city: 'Coral Gables',
      state: 'FL',
      zipcode: '33134'
    },
    price: 895000,
    bedrooms: 3,
    bathrooms: 2,
    livingArea: 2000,
    daysOnZillow: 5,
    homeType: 'House',
    homeStatus: 'FOR_SALE'
  },
  {
    zpid: '56789012',
    address: {
      streetAddress: '202 Collins Ave',
      city: 'Miami Beach',
      state: 'FL',
      zipcode: '33139'
    },
    price: 3500000,
    bedrooms: 5,
    bathrooms: 4.5,
    livingArea: 3500,
    daysOnZillow: 21,
    homeType: 'House',
    homeStatus: 'FOR_SALE'
  },
  {
    zpid: '67890123',
    address: {
      streetAddress: '303 Sunset Dr',
      city: 'South Miami',
      state: 'FL',
      zipcode: '33143'
    },
    price: 1100000,
    bedrooms: 4,
    bathrooms: 3,
    livingArea: 2400,
    daysOnZillow: 10,
    homeType: 'House',
    homeStatus: 'FOR_SALE'
  },
  {
    zpid: '78901234',
    address: {
      streetAddress: '404 Pine Tree Dr',
      city: 'Miami Beach',
      state: 'FL',
      zipcode: '33140'
    },
    price: 4200000,
    bedrooms: 6,
    bathrooms: 5.5,
    livingArea: 4200,
    daysOnZillow: 30,
    homeType: 'House',
    homeStatus: 'FOR_SALE'
  },
  {
    zpid: '89012345',
    address: {
      streetAddress: '505 Alton Rd',
      city: 'Miami Beach',
      state: 'FL',
      zipcode: '33139'
    },
    price: 950000,
    bedrooms: 2,
    bathrooms: 2,
    livingArea: 1200,
    daysOnZillow: 2,
    homeType: 'Condo',
    homeStatus: 'FOR_SALE'
  }
] 