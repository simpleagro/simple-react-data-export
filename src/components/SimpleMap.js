import React from "react";
import _ from "lodash";
import { Polygon } from "react-google-maps";
import { compose, withProps, lifecycle } from "recompose";
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps";
import { SearchBox } from "react-google-maps/lib/components/places/SearchBox";
import { DrawingManager } from "react-google-maps/lib/components/drawing/DrawingManager";

const google = window.google;

export const SimpleMap = compose(
  withProps({
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />
  }),
  lifecycle({
    componentWillMount() {
      const refs = {};
      {
        this.props.setGPS && this.props.setGPS(-17.79272, -50.91965849999997);
      }
      this.setState({
        bounds: null,
        markers: [
          {
            position: {
              lat: -17.79272, // padrão rio verde
              lng: -50.91965849999997 // padrão rio verde
            }
          }
        ],

        onMapMounted: ref => {
          refs.map = ref;
        },
        onBoundsChanged: () => {
          this.setState(prev => ({
            ...prev,
            bounds: refs.map.getBounds(),
            center: refs.map.getCenter()
          }));
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

          this.setState(prev => ({
            ...prev,
            center: nextCenter,
            markers: nextMarkers
          }));
          console.log(nextCenter, nextMarkers);
          this.props.setGPS(nextCenter.lat(), nextCenter.lng());
          // refs.map.fitBounds(bounds);
        }
      });
    }
  }),
  withGoogleMap
)(props => {
  console.log(props);
  return (
    <GoogleMap
      defaultMapTypeId="satellite"
      ref={props.onMapMounted}
      defaultZoom={props.defaultZoom || 18}
      center={
        props.latitude && props.longitude
          ? new google.maps.LatLng(props.latitude, props.longitude)
          : new google.maps.LatLng(-17.794848, -50.920438)
      }
      // defaultCenter={new google.maps.LatLng(-17.794848, -50.920438)} // padrao Rio Verde - GO
    >
      <DrawingManager
        style={{ display: props.polygonData.length === 0 ? "block" : "none" }}
        drawingMode={props.editMapMode}
        defaultOptions={{
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER
          },
          polygonOptions: {
            fillColor: `#ffff00`,
            fillOpacity: 0.5,
            strokeWeight: 5,
            clickable: false,
            defaultEditable: true,
            editable: props.polyEdit,
            visible: props.polyEdit,
            zIndex: 1
          }
        }}
        onPolygonComplete={poly => {
          const polyArray = poly.getPath().getArray();
          let paths = [];
          polyArray.forEach(function(path) {
            paths.push({ latitude: path.lat(), longitude: path.lng() });
          });
          props.salvarMapa(paths);
        }}
      />
      <Polygon
        ref={poly => {
          this.refs = poly;
        }}
        options={{
          fillColor: `#ffff00`,
          fillOpacity: 0.5,
          strokeWeight: 5,
          clickable: false,
          editable: false,
          zIndex: 1
        }}
        defaultPaths={props.polygonData}
      />

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

      {props.markers.map((marker, index) => (
        <Marker
          draggable
          key={index}
          position={marker.position}
          onDragEnd={e => props.setGPS(e.latLng.lat(), e.latLng.lng())}
        />
      ))}

      <BtnEditar active={props.editMapMode} editarMapa={props.editarMapa} />
      <BtnSalvar salvarMapa={props.salvarMapa} />
    </GoogleMap>
  );
});

const BtnEditar = props => {
  return (
    <div
      onClick={() => props.editarMapa()}
      style={{
        backgroundColor:
          props.active == null ? "rgb(255, 255, 255)" : "#f2ff31",
        border: "2px solid rgb(255, 255, 255)",
        borderRadius: "3px",
        boxShadow: "rgba(0, 0, 0, 0.3) 0px 2px 6px",
        cursor: "pointer",
        right: "106px",
        textAlign: "center",
        position: "absolute",
        top: "45px",
        width: "40px",
        height: "40px"
      }}
    >
      <img
        src="https://image.flaticon.com/icons/png/512/903/903073.png"
        style={{
          width: "25px",
          height: "auto",
          marginTop: "7px"
        }}
      />
    </div>
  );
};

const BtnSalvar = props => (
  <div
    onClick={() => props.salvarMapa()}
    style={{
      backgroundColor: "rgb(255, 255, 255)",
      border: "2px solid rgb(255, 255, 255)",
      borderRadius: "3px",
      boxShadow: "rgba(0, 0, 0, 0.3) 0px 2px 6px",
      cursor: "pointer",
      right: "58px",
      textAlign: "center",
      position: "absolute",
      top: "45px",
      width: "40px",
      height: "40px"
    }}
  >
    <img
      src="https://image.flaticon.com/icons/png/128/503/503093.png"
      style={{
        width: "25px",
        height: "auto",
        marginTop: "7px"
      }}
    />
  </div>
);
