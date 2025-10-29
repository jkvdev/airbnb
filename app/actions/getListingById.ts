import prisma from "@/app/libs/prismadb";
import { mockListings, mockUsers } from '@/constants';

interface IParams {
  listingId?: string;
}

export default async function getListingById(
  params: IParams
) {
  try {
    const { listingId } = params;

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      include: {
        user: true
      }
    });

    if (!listing) {
      return null;
    }

    return {
      ...listing,
      createdAt: listing.createdAt.toString(),
      user: {
        ...listing.user,
        createdAt: listing.user.createdAt.toString(),
        updatedAt: listing.user.updatedAt.toString(),
        emailVerified: 
          listing.user.emailVerified?.toString() || null,
      }
    };
  } catch (error: any) {
    console.error("Database error fetching listing by ID, falling back to mock data:", error);

    const { listingId } = params; 

    const mockListing = mockListings.find(listing => listing.id === listingId);

    if (!mockListing) {
      return null; 
    }

    const mockUser = mockUsers.find(user => user.id === mockListing.userId);

    if (!mockUser) {
      console.warn(`Mock listing ${mockListing.id} references non-existent mock user ${mockListing.userId}`);
      return null; 
    }

    return {
      ...mockListing,
      createdAt: mockListing.createdAt, 
      user: {
        ...mockUser,
        createdAt: mockUser.createdAt, 
        updatedAt: mockUser.updatedAt, 
        emailVerified: mockUser.emailVerified, 
      }
    };
  }
}
