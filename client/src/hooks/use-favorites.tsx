import { createContext, ReactNode, useContext } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Listing } from "@shared/schema";

interface FavoriteWithListing {
  id: number;
  userId: number;
  listingId: number;
  savedAt: string;
  listing: Listing;
}

interface FavoritesContextType {
  favorites: FavoriteWithListing[];
  isLoading: boolean;
  isFavorite: (listingId: number) => boolean;
  addToFavorites: (listingId: number) => void;
  removeFromFavorites: (listingId: number) => void;
  toggleFavorite: (listingId: number) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  const { data, isLoading, refetch } = useQuery<{success: boolean, data: FavoriteWithListing[]}>({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });
  
  const favorites = data?.success ? data.data : [];
  
  const addMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const res = await apiRequest("POST", `/api/favorites/${listingId}`);
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: t('addedToFavorites'),
        description: t('addedToFavoritesDescription'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const removeMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const res = await apiRequest("DELETE", `/api/favorites/${listingId}`);
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: t('removedFromFavorites'),
        description: t('removedFromFavoritesDescription'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const isFavorite = (listingId: number): boolean => {
    return favorites.some(fav => fav.listingId === listingId);
  };
  
  const addToFavorites = (listingId: number) => {
    if (!user) {
      toast({
        title: t('loginRequired'),
        description: t('loginToAddFavorites'),
        variant: "destructive",
      });
      return;
    }
    
    addMutation.mutate(listingId);
  };
  
  const removeFromFavorites = (listingId: number) => {
    if (!user) return;
    removeMutation.mutate(listingId);
  };
  
  const toggleFavorite = (listingId: number) => {
    if (isFavorite(listingId)) {
      removeFromFavorites(listingId);
    } else {
      addToFavorites(listingId);
    }
  };
  
  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        isFavorite,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}