"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export function FavouriteCheckbox({
  recipeId,
  isChecked,
}: {
  recipeId: string;
  isChecked: boolean;
}) {
  const router = useRouter();
  const toggleCheckMutation = api.recipes.toggleFavourite.useMutation({
    onSuccess() {
      router.refresh();
    },
  });
  function onFavouriteChange(e: React.ChangeEvent<HTMLInputElement>) {
    toggleCheckMutation.mutate({ recipeId, favourite: e.target.checked });
  }
  return (
    <label className="flex items-center gap-2">
      Favorite
      <input
        type="checkbox"
        disabled={toggleCheckMutation.isLoading}
        checked={isChecked}
        onChange={onFavouriteChange}
      />
    </label>
  );
}
