import { Component, Input, OnInit } from '@angular/core';
import { mapHelper } from '@helpers';
import { MapConfigInterface } from '@models';
import { SessionService } from '@services';
import {
  control,
  FitBoundsOptions,
  LatLngBounds,
  Map,
  MapOptions,
  tileLayer,
  marker,
} from 'leaflet';
import { pointIcon } from 'src/app/core/helpers/map';

@Component({
  selector: 'app-map-with-marker',
  templateUrl: './map-with-marker.component.html',
  styleUrls: ['./map-with-marker.component.scss'],
})
export class MapWithMarkerComponent implements OnInit {
  @Input() public marker: { lat: number; lon: number };
  @Input() public color: string = 'var(--color-neutral-100)';
  @Input() public type: string = 'default';

  public mapReady = false;
  public mapConfig: MapConfigInterface;
  public leafletOptions: MapOptions;
  public mapFitToBounds: LatLngBounds;
  public fitBoundsOptions: FitBoundsOptions = {
    animate: true,
  };
  public mapLayers: any[] = [];

  constructor(private sessionService: SessionService) {}

  ngOnInit(): void {
    this.mapConfig = this.sessionService.getMapConfigurations();

    const currentLayer =
      mapHelper.getMapLayers().baselayers[this.mapConfig.default_view!.baselayer];

    this.leafletOptions = {
      scrollWheelZoom: true,
      zoomControl: false,
      layers: [tileLayer(currentLayer.url, currentLayer.layerOptions)],
      center: [this.marker.lat, this.marker.lon],
      zoom: 15,
    };

    const mapMarker = marker(
      {
        lat: this.marker.lat,
        lng: this.marker.lon,
      },
      {
        icon: pointIcon(this.color, this.type),
      },
    );
    this.mapLayers.push(mapMarker);

    this.mapReady = true;
  }

  public onMapReady(map: Map) {
    control.zoom({ position: 'bottomleft' }).addTo(map);
  }
}
