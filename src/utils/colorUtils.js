export const colorDistance = (c1, c2) => {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return dr * dr + dg * dg + db * db;
};

export const findClosestTile = ({
  targetColor,
  tiles,
  allowRepeat,
  usageMap,
  penaltyWeight = 100,
}) => {
  if (!tiles.length) {
    return null;
  }

  let bestTile = tiles[0];
  let minScore = Number.POSITIVE_INFINITY;

  for (const tile of tiles) {
    const distance = colorDistance(targetColor, tile.averageColor);
    const usagePenalty = allowRepeat ? 0 : (usageMap.get(tile.id) ?? 0) * penaltyWeight;
    const score = distance + usagePenalty;

    if (score < minScore) {
      minScore = score;
      bestTile = tile;
    }
  }

  usageMap.set(bestTile.id, (usageMap.get(bestTile.id) ?? 0) + 1);
  return bestTile;
};
