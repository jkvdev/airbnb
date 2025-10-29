import prisma from "@/app/libs/prismadb";
import { mockReservations, mockListings } from '@/constants';

interface IParams {
  listingId?: string;
  userId?: string;
  authorId?: string;
}

export default async function getReservations(
  params: IParams
) {
  try {
    const { listingId, userId, authorId } = params;

    const query: any = {};
        
    if (listingId) {
      query.listingId = listingId;
    };

    if (userId) {
      query.userId = userId;
    }

    if (authorId) {
      query.listing = { userId: authorId };
    }

    const reservations = await prisma.reservation.findMany({
      where: query,
      include: {
        listing: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const safeReservations = reservations.map(
      (reservation) => ({
      ...reservation,
      createdAt: reservation.createdAt.toISOString(),
      startDate: reservation.startDate.toISOString(),
      endDate: reservation.endDate.toISOString(),
      listing: {
        ...reservation.listing,
        createdAt: reservation.listing.createdAt.toISOString(),
      },
    }));

    return safeReservations;
  } catch (error: any) {
    console.error("Database error fetching reservations, falling back to mock data:", error);

    let filteredMockReservations = mockReservations;

    const { listingId, userId, authorId } = params; 

    if (listingId) {
      filteredMockReservations = filteredMockReservations.filter(res => res.listingId === listingId);
    }

    if (userId) {
      filteredMockReservations = filteredMockReservations.filter(res => res.userId === userId);
    }

    if (authorId) {
      filteredMockReservations = filteredMockReservations.filter(res => {
        const listing = mockListings.find(l => l.id === res.listingId);
        return listing && listing.userId === authorId;
      });
    }

    const safeMockReservations = filteredMockReservations.map(reservation => {
      const listing = mockListings.find(l => l.id === reservation.listingId);
      if (!listing) {
        console.warn(`Mock reservation ${reservation.id} references non-existent mock listing ${reservation.listingId}`);
        return null; 
      }
      return {
        ...reservation,
        listing: {
          ...listing,
          createdAt: listing.createdAt,
        },
      };
    }).filter(Boolean);

    return safeMockReservations as any; 
  }
}