import React, { Component } from "react";
import _ from "lodash";
import { compose, withProps, lifecycle } from "recompose";
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps";
import { SearchBox } from "react-google-maps/lib/components/places/SearchBox";

const google = window.google;

export const SimpleMap = withGoogleMap(props => (
  <GoogleMap
    defaultZoom={8}
    center={new google.maps.LatLng(props.toCenter.lat, props.toCenter.lng)}
  >
    <SearchBox
      ref={props.onSearchBoxMounted}
      bounds={props.bounds}
      controlPosition={google.maps.ControlPosition.TOP_LEFT}
      onPlacesChanged={props.onPlacesChanged}
    >
      <input
        type="text"
        placeholder="Pesquisar..."
        style={{
          boxSizing: `border-box`,
          border: `1px solid transparent`,
          width: `240px`,
          height: `32px`,
          marginTop: `27px`,
          padding: `0 12px`,
          borderRadius: `3px`,
          boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
          fontSize: `14px`,
          outline: `none`,
          textOverflow: `ellipses`
        }}
      />
    </SearchBox>

    <Marker
      draggable
      onDragEnd={e => props.setGPS(e.latLng.lat(), e.latLng.lng())}
      position={{
        lat: parseFloat(props.toCenter.lat),
        lng: parseFloat(props.toCenter.lng)
      }}
    />
  </GoogleMap>
));

export const MapWithASearchBox = props => null;
