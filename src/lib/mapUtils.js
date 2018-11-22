import { area, point, polygon, center, featureCollection } from "turf";

export const calculateArea = (poligono = []) => {
  if (!poligono.length) return 0;
  let array_poligono = [];
  poligono.forEach(ponto =>
    array_poligono.push([ponto.longitude, ponto.latitude])
  );
  array_poligono.push([poligono[0].longitude, poligono[0].latitude]);

  let _poligono = polygon([[...array_poligono]]);
  let _area = area(_poligono);

  let _area_ha = _area / 10000;

  return _area_ha.toFixed(2);
};

export const calculateCenter = (coordinates = []) => {
  if (!coordinates.length) return undefined;
  let x = coordinates.map(c => c.latitude);
  let y = coordinates.map(c => c.longitude);

  let minX = Math.min.apply(null, x);
  let maxX = Math.max.apply(null, x);

  let minY = Math.min.apply(null, y);
  let maxY = Math.max.apply(null, y);

  return {
    latitude: (minX + maxX) / 2,
    longitude: (minY + maxY) / 2
  };
};
