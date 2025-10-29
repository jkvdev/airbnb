import prisma from "@/app/libs/prismadb";
import { mockListings, mockReservations } from '@/constants';

export interface IListingsParams {
  userId?: string;
  guestCount?: number;
  roomCount?: number;
  bathroomCount?: number;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
}

export default async function getListings(
  params: IListingsParams
) {
  try {
    const {
      userId,
      roomCount, 
      guestCount, 
      bathroomCount, 
      locationValue,
      startDate,
      endDate,
      category,
    } = params;

    let query: any = {};

    if (userId) {
      query.userId = userId;
    }

    if (category) {
      query.category = category;
    }

    if (roomCount) {
      query.roomCount = {
        gte: +roomCount
      }
    }

    if (guestCount) {
      query.guestCount = {
        gte: +guestCount
      }
    }

    if (bathroomCount) {
      query.bathroomCount = {
        gte: +bathroomCount
      }
    }

    if (locationValue) {
      query.locationValue = locationValue;
    }

    if (startDate && endDate) {
      query.NOT = {
        reservations: {
          some: {
            OR: [
              {
                endDate: { gte: startDate },
                startDate: { lte: startDate }
              },
              {
                startDate: { lte: endDate },
                endDate: { gte: endDate }
              }
            ]
          }
        }
      }
    }

    const listings = await prisma.listing.findMany({
      where: query,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const safeListings = listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
    }));

    return safeListings;
  } catch (error: any) {
    console.error("Database error fetching listings, falling back to mock data:", error);

    let filteredMockListings = mockListings;

    if (params.userId) {
      filteredMockListings = filteredMockListings.filter(listing => listing.userId === params.userId);
    }
    if (params.category) {
      filteredMockListings = filteredMockListings.filter(listing => listing.category === params.category);
    }
    if (params.roomCount !== undefined) {
      const roomCount = +params.roomCount;
      filteredMockListings = filteredMockListings.filter(listing => listing.roomCount >= roomCount);
    }
    if (params.guestCount !== undefined) {
      const guestCount = +params.guestCount;
      filteredMockListings = filteredMockListings.filter(listing => listing.guestCount >= guestCount);
    }
    if (params.locationValue) {
      filteredMockListings = filteredMockListings.filter(listing => listing.locationValue === params.locationValue);
    }
    if (params.bathroomCount !== undefined) {
      const bathroomCount = +params.bathroomCount;
      filteredMockListings = filteredMockListings.filter(listing => listing.bathroomCount >= bathroomCount);
    }

    if (params.startDate && params.endDate) {
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);

      filteredMockListings = filteredMockListings.filter(listing => {
        const listingReservations = mockReservations.filter(
          reservation => reservation.listingId === listing.id
        );

        const hasOverlap = listingReservations.some(reservation => {
          const resStartDate = new Date(reservation.startDate);
          const resEndDate = new Date(reservation.endDate);

          return (
            (resEndDate >= startDate && resStartDate <= startDate) ||
            (resStartDate <= endDate && resEndDate >= endDate) ||
            (startDate >= resStartDate && endDate <= resEndDate) ||
            (resStartDate >= startDate && resEndDate <= endDate)
          );
        });

        return !hasOverlap;
      });
    }

    return filteredMockListings;
  }
}
