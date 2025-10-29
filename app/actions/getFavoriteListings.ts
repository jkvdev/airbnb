import prisma from "@/app/libs/prismadb";
import { mockListings } from '@/constants';

import getCurrentUser from "./getCurrentUser";

export default async function getFavoriteListings() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const favorites = await prisma.listing.findMany({
      where: {
        id: {
          in: [...(currentUser.favoriteIds || [])]
        }
      }
    });

    const safeFavorites = favorites.map((favorite) => ({
      ...favorite,
      createdAt: favorite.createdAt.toString(),
    }));

    return safeFavorites;
  } catch (error: any) {
    console.error("Database error fetching favorite listings, falling back to mock data:", error);

    const currentUser = await getCurrentUser(); 
    if (!currentUser) {
      return []; 
    }

    const favoriteIds = currentUser.favoriteIds || [];
    const filteredMockFavorites = mockListings.filter(listing =>
      favoriteIds.includes(listing.id)
    );

    return filteredMockFavorites;
  }
}
