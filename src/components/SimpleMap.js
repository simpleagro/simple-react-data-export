import React from "react";
const _ = require("lodash");
const { compose, withProps, lifecycle } = require("recompose");
const { withGoogleMap, GoogleMap, Marker } = require("react-google-maps");
const {
  SearchBox
} = require("react-google-maps/lib/components/places/SearchBox");

const google = window.google;

export const SimpleMap = compose(
  withProps({
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />
  }),
  lifecycle({
    componentWillMount() {
      const refs = {};

      this.setState({
        bounds: null,
        center: {
          lat: 0,
          lng: 0
        },
        markers: [],
        onMapMounted: ref => {
          refs.map = ref;
        },
        onBoundsChanged: () => {
          this.setState({
            bounds: refs.map.getBounds(),
            center: refs.map.getCenter()
          });
        },
        onSearchBoxMounted: ref => {
          refs.searchBox = ref;
        },
        onPlacesChanged: () => {
          const places = refs.searchBox.getPlaces();
          const bounds = new google.maps.LatLngBounds();

          places.forEach(place => {
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          const nextMarkers = places.map(place => ({
            position: place.geometry.location
          }));
          const nextCenter = _.get(
            nextMarkers,
            "0.position",
            this.state.center
          );

          this.setState({
            center: nextCenter,
            markers: nextMarkers
          });
          console.log(nextCenter, nextMarkers);

          this.props.setGPS(nextCenter.lat(), nextCenter.lng());
          // refs.map.fitBounds(bounds);
        }
      });
    }
  }),
  withGoogleMap
)(props => (
  <GoogleMap
    ref={props.onMapMounted}
    defaultZoom={props.defaultZoom || 8}
    center={
      props.latitude && props.longitude
        ? new google.maps.LatLng(props.latitude, props.longitude)
        : new google.maps.LatLng(-17.794848, -50.920438)
    }
    // defaultCenter={new google.maps.LatLng(-17.794848, -50.920438)} // padrao Rio Verde - GO
  >
    <SearchBox
      ref={props.onSearchBoxMounted}
      bounds={props.bounds}
      controlPosition={google.maps.ControlPosition.TOP_LEFT}
      onPlacesChanged={props.onPlacesChanged}
    >
      <input
        type="text"
        placeholder="Pesquise sua localização aqui"
        style={{
          boxSizing: `border-box`,
          border: `1px solid transparent`,
          width: `300px`,
          height: `40px`,
          marginTop: `10px`,
          padding: `0 12px`,
          borderRadius: `3px`,
          boxShadow: `0 1px 2px rgba(0, 0, 0, 0.3)`,
          fontSize: `14px`,
          outline: `none`,
          textOverflow: `ellipses`
        }}
      />
    </SearchBox>

    {props.markers &&
      props.markers.length === 0 && (
        <Marker
          draggable
          key={0}
          position={new google.maps.LatLng(props.latitude, props.longitude)}
          onDragEnd={e => props.setGPS(e.latLng.lat(), e.latLng.lng())}
        />
      )}

    {props.markers &&
      props.markers.length === 0 &&
      props.markers.map((marker, index) => (
        <Marker
          draggable
          key={index}
          position={marker.position}
          onDragEnd={e => props.setGPS(e.latLng.lat(), e.latLng.lng())}
        />
      ))}
  </GoogleMap>
));
