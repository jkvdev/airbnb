import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { mockUsers, mockListings, mockReservations } from '../constants';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const args = process.argv.slice(2); // Get command line arguments
  const appendMode = args.includes('--append');

  if (!appendMode) {
    // Clear existing data (optional, but good for fresh seeds)
    await prisma.reservation.deleteMany({});
    await prisma.listing.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.account.deleteMany({});
    console.log('Cleared existing data.');
  } else {
    console.log('Appending data without clearing existing data.');
  }

  // Seed Users
  for (const mockUser of mockUsers) {
    // Check if user already exists to avoid unique constraint errors in append mode
    if (appendMode) {
      const existingUser = await prisma.user.findUnique({ where: { id: mockUser.id } });
      if (existingUser) {
        console.log(`User with id ${mockUser.id} already exists, skipping.`);
        continue;
      }
    }
    const hashedPassword = await bcrypt.hash(mockUser.hashedPassword || 'password123', 12);
    const user = await prisma.user.create({
      data: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        image: mockUser.image,
        hashedPassword: hashedPassword,
        createdAt: new Date(mockUser.createdAt),
        updatedAt: new Date(mockUser.updatedAt),
        emailVerified: mockUser.emailVerified ? new Date(mockUser.emailVerified) : null,
        favoriteIds: mockUser.favoriteIds,
      },
    });
    console.log(`Created user with id: ${user.id}`);
  }

  // Seed Listings
  for (const mockListing of mockListings) {
    // Check if listing already exists
    if (appendMode) {
      const existingListing = await prisma.listing.findUnique({ where: { id: mockListing.id } });
      if (existingListing) {
        console.log(`Listing with id ${mockListing.id} already exists, skipping.`);
        continue;
      }
    }
    const listing = await prisma.listing.create({
      data: {
        id: mockListing.id,
        title: mockListing.title,
        description: mockListing.description,
        imageSrc: mockListing.imageSrc,
        createdAt: new Date(mockListing.createdAt),
        category: mockListing.category,
        roomCount: mockListing.roomCount,
        bathroomCount: mockListing.bathroomCount,
        guestCount: mockListing.guestCount,
        locationValue: mockListing.locationValue,
        userId: mockListing.userId,
        price: mockListing.price,
      },
    });
    console.log(`Created listing with id: ${listing.id}`);
  }

  // Seed Reservations
  for (const mockReservation of mockReservations) {
    // Check if reservation already exists
    if (appendMode) {
      const existingReservation = await prisma.reservation.findUnique({ where: { id: mockReservation.id } });
      if (existingReservation) {
        console.log(`Reservation with id ${mockReservation.id} already exists, skipping.`);
        continue;
      }
    }
    const reservation = await prisma.reservation.create({
      data: {
        id: mockReservation.id,
        listingId: mockReservation.listingId,
        userId: mockReservation.userId,
        startDate: new Date(mockReservation.startDate),
        endDate: new Date(mockReservation.endDate),
        totalPrice: mockReservation.totalPrice,
        createdAt: new Date(mockReservation.createdAt),
      },
    });
    console.log(`Created reservation with id: ${reservation.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
