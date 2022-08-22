import { CONST } from '@constants';
import { divIcon, marker } from 'leaflet';

export const pointIcon = (color: string, size?: any, className?: string) => {
  // Test string to make sure that it does not contain injection
  color = color && /^[a-zA-Z0-9#]+$/.test(color) ? color : '#959595';
  size = size || [32, 32];
  // var iconicSprite = require('ushahidi-platform-pattern-library/assets/img/iconic-sprite.svg');

  return divIcon({
    className: 'custom-map-marker ' + className,
    // html: '<svg class="iconic" style="fill:' + color + ';"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="' + iconicSprite + '#map-marker"></use></svg><span class="iconic-bg" style="background-color:' + color + ';""></span>',
    html:
      '<svg class="iconic" style="height: 100%; width: 100%; fill:' +
      color +
      ';"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#map-marker"></use></svg><span class="iconic-bg" style="background-color:' +
      color +
      ';""></span>',
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, 0 - size[1]],
  });
};

export const pointToLayer = (feature: any, latlng: any) => {
  return marker(latlng, {
    icon: pointIcon(feature.properties['marker-color']),
  });
};

export const mapboxStaticTiles = (name: string, mapid: string) => {
  return {
    name,
    url: 'https://api.mapbox.com/styles/v1/{mapid}/tiles/{z}/{x}/{y}?access_token={apikey}',
    layerOptions: {
      apikey: CONST.MAPBOX_API_KEY,
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      mapid: mapid,
      attribution:
        '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    },
  };
};

export const getMapLayers = () => {
  return {
    baselayers: {
      satellite: mapboxStaticTiles('Satellite', 'mapbox/satellite-v9'),
      streets: mapboxStaticTiles('Streets', 'mapbox/streets-v11'),
      hOSM: {
        name: 'Humanitarian',
        url: '//{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        layerOptions: {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>, &copy; <a href="http://hot.openstreetmap.org/">Humanitarian OpenStreetMap</a> | <a href="https://www.mapbox.com/feedback/" target="_blank">Improve the underlying map</a>',
        },
      },
    },
  };
};
