import React from "react";
import _ from "lodash";
import { Polygon } from "react-google-maps";
import {
  compose,
  withProps,
  lifecycle,
  defaultProps,
  withState
} from "recompose";
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps";
import { SearchBox } from "react-google-maps/lib/components/places/SearchBox";
import { DrawingManager } from "react-google-maps/lib/components/drawing/DrawingManager";
import { Tooltip, Modal } from "antd";

const google = window.google;
const confirm = Modal.confirm;

export const SimpleMap = compose(
  defaultProps({
    showControl: true,
    markers: [
      {
        position: {
          lat: -17.79272, // padrão rio verde
          lng: -50.91965849999997 // padrão rio verde
        }
      }
    ]
  }),
  withState("fullscreen", "setFullScreenMode", false),
  withProps({
    containerElement: <div style={{ height: `100%` }} />,
    mapElement: <div style={{ height: `400px` }} />
  }),
  lifecycle({
    componentWillMount() {
      const refs = {};
      {
        this.props.setGPS && this.props.setGPS(-17.79272, -50.91965849999997);
      }
      this.setState({
        bounds: null,
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
        setMarkerPosition: ev => {
          const nextMarker = [
            {
              position: {
                lat: ev.latLng.lat(),
                lng: ev.latLng.lng()
              }
            }
          ];

          this.setState(prev => ({
            ...prev,
            markers: nextMarker
          }));

          this.props.setGPS(ev.latLng.lat(), ev.latLng.lng());
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
          // console.log(nextCenter, nextMarkers);
          this.props.setGPS(nextCenter.lat(), nextCenter.lng());
          // refs.map.fitBounds(bounds);
        }
      });
    }
  }),
  withGoogleMap
)(props => {
  const polygonRef = {};
  const refDrawingMgr = {};
  const mapRef = {};

  const getBoundsFromPolygon = poly => {
    const polyArray = poly.getPath().getArray();
    let paths = [];
    polyArray.forEach(function(path) {
      paths.push({ latitude: path.lat(), longitude: path.lng() });
    });
    return paths;
  };

  return (
    <GoogleMap
      defaultMapTypeId="satellite"
      ref={map => {
        this.mapRef = map;
        props.onMapMounted(map);
      }}
      options={{
        fullscreenControl: false
      }}
      onRightClick={e => {
        props.setMarkerPosition(e);
      }}
      defaultZoom={props.defaultZoom || 18}
      center={
        props.latitude &&
        props.latitude != 0 &&
        (props.longitude && props.longitude != 0)
          ? new google.maps.LatLng(props.latitude, props.longitude)
          : new google.maps.LatLng(-17.794848, -50.920438)
      }
      // defaultCenter={new google.maps.LatLng(-17.794848, -50.920438)} // padrao Rio Verde - GO
    >
      {props.drawingMap === true && (
        <DrawingManager
          drawingMode={google.maps.drawing.OverlayType.POLYGON}
          defaultOptions={{
            drawingControl: false,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER
            },
            polygonOptions: {
              fillColor: `#ffff00`,
              fillOpacity: 0.5,
              strokeWeight: 5,
              strokeColor: "#ff0000",
              clickable: false,
              editable: true,
              zIndex: 1
            }
          }}
          onPolygonComplete={poly => {
            this.refDrawingMgr = poly;
            const _poly = poly;
            // atualiza o centro do mapa quanto arrastar um ponto do poligono
            google.maps.event.addListener(poly.getPath(), "set_at", function(
              e
            ) {
              props.salvarMapa(getBoundsFromPolygon(poly));
            });
            // atualiza o centro do mapa quanto inserir um ponto do poligono
            google.maps.event.addListener(poly.getPath(), "insert_at", function(
              e
            ) {
              props.salvarMapa(getBoundsFromPolygon(poly));
            });
            // remove o ponto do poligono
            google.maps.event.addListener(poly, "rightclick", function(e) {
              document.oncontextmenu = function() {
                return false;
              };
              confirm({
                content: "Tem certeza que deseja remover este ponto do mapa?",
                onOk() {
                  if (!_poly || e.vertex == undefined) {
                    return;
                  }

                  _poly.getPath().removeAt(e.vertex);

                  const polyArray = _poly.getPath().getArray();
                  let paths = [];
                  polyArray.forEach(function(path) {
                    paths.push({ latitude: path.lat(), longitude: path.lng() });
                  });

                  props.salvarMapa(paths);
                }
              });
              setTimeout(() => {
                document.oncontextmenu = function() {
                  return true;
                };
              }, 300);
            });
            props.salvarMapa(getBoundsFromPolygon(poly));
          }}
        />
      )}

      {props.editingMap === true && (
        <Polygon
          ref={poly => {
            this.polygonRef = poly;
            if (poly) {
              google.maps.event.addListener(poly.getPath(), "set_at", function(
                e
              ) {
                setTimeout(() => {
                  props.salvarMapa(getBoundsFromPolygon(poly));
                }, 1000);
              });
              google.maps.event.addListener(
                poly.getPath(),
                "insert_at",
                function(e) {
                  setTimeout(() => {
                    props.salvarMapa(getBoundsFromPolygon(poly));
                  }, 1000);
                }
              );
            }
          }}
          options={{
            fillColor: `#ffff00`,
            fillOpacity: 0.5,
            strokeWeight: 5,
            clickable: false,
            editable: true,
            zIndex: 1
          }}
          onRightClick={bounds => {
            document.oncontextmenu = function() {
              return false;
            };
            var _selfPoly = this.polygonRef;
            confirm({
              content: "Tem certeza que deseja remover este ponto do mapa?",
              onOk() {
                if (!_selfPoly || bounds.vertex == undefined) {
                  return;
                }

                _selfPoly.getPath().removeAt(bounds.vertex);

                const polyArray = _selfPoly.getPath().getArray();
                let paths = [];
                polyArray.forEach(function(path) {
                  paths.push({ latitude: path.lat(), longitude: path.lng() });
                });

                props.salvarMapa(paths);
              }
            });
            setTimeout(() => {
              document.oncontextmenu = function() {
                return true;
              };
            }, 300);
          }}
          path={props.polygonData}
          map={this.mapRef}
        />
      )}

      {props.showControl && (
        <SearchBox
          ref={props.onSearchBoxMounted}
          bounds={props.bounds}
          controlPosition={google.maps.ControlPosition.TOP_LEFT}
          onPlacesChanged={props.onPlacesChanged}>
          <div>
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
            {props.showControl && (
              <div
                style={{
                  clear: "both",
                  position: "relative",
                  left: "311px",
                  top: "-40px"
                }}>
                <BtnZoom
                  map={this.mapRef}
                  fullscreen={props.fullscreen}
                  setFullScreenMode={props.setFullScreenMode}
                />
                <BtnEditar
                  hasBounds={props.polygonData.length > 0}
                  active={props.drawingMap}
                  adicionarPontosAoMapa={props.adicionarPontosAoMapa}
                />
                <BtnLimparMapa limparMapa={props.limparMapa} />
              </div>
            )}
          </div>
        </SearchBox>
      )}

      {props.markers &&
        props.markers.length &&
        props.markers.map((marker, index) => (
          <Marker
            ref={marker => {
              this.markerRef = marker;
            }}
            draggable
            key={index}
            position={marker.position}
            onDragEnd={e => props.setGPS(e.latLng.lat(), e.latLng.lng())}
          />
        ))}
    </GoogleMap>
  );
});

const BtnZoom = props => {
  return (
    <span>
      {props.fullscreen === false && (
        <Tooltip title="Colocar o mapa em tela cheia">
          <div
            onClick={() => {
              props.setFullScreenMode(true);
              if (props.map) {
                props.map.getDiv().style.position = "fixed";
                props.map.getDiv().style.top = 0;
                props.map.getDiv().style.left = 0;
                props.map.getDiv().style.right = 0;
                props.map.getDiv().style.bottom = 0;
                props.map.getDiv().style.zIndex = 10;
                props.map.getDiv().style.height = "100%";
              }
            }}
            style={{
              backgroundColor: "rgb(255, 255, 255)",
              border: "2px solid rgb(255, 255, 255)",
              borderRadius: "2px",
              boxShadow: "rgba(0, 0, 0, 0.3) 0px 2px 6px",
              cursor: "pointer",
              float: "left",
              textAlign: "center",
              width: "40px",
              height: "40px",
              marginRight: 10
            }}>
            <img
              src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDM4NC45NyAzODQuOTciIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM4NC45NyAzODQuOTc7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4Ij4KPGc+Cgk8ZyBpZD0iRnVsbHNjcmVlbiI+CgkJPHBhdGggZD0iTTM4NC45NywxMi4wM2MwLTYuNzEzLTUuMzE3LTEyLjAzLTEyLjAzLTEyLjAzSDI2NC44NDdjLTYuODMzLDAtMTEuOTIyLDUuMzktMTEuOTM0LDEyLjIyMyAgICBjMCw2LjgyMSw1LjEwMSwxMS44MzgsMTEuOTM0LDExLjgzOGg5Ni4wNjJsLTAuMTkzLDk2LjUxOWMwLDYuODMzLDUuMTk3LDEyLjAzLDEyLjAzLDEyLjAzYzYuODMzLTAuMDEyLDEyLjAzLTUuMTk3LDEyLjAzLTEyLjAzICAgIGwwLjE5My0xMDguMzY5YzAtMC4wMzYtMC4wMTItMC4wNi0wLjAxMi0wLjA4NEMzODQuOTU4LDEyLjA5LDM4NC45NywxMi4wNjYsMzg0Ljk3LDEyLjAzeiIgZmlsbD0iIzAwMDAwMCIvPgoJCTxwYXRoIGQ9Ik0xMjAuNDk2LDBIMTIuNDAzYy0wLjAzNiwwLTAuMDYsMC4wMTItMC4wOTYsMC4wMTJDMTIuMjgzLDAuMDEyLDEyLjI0NywwLDEyLjIyMywwQzUuNTEsMCwwLjE5Miw1LjMxNywwLjE5MiwxMi4wMyAgICBMMCwxMjAuMzk5YzAsNi44MzMsNS4zOSwxMS45MzQsMTIuMjIzLDExLjkzNGM2LjgyMSwwLDExLjgzOC01LjEwMSwxMS44MzgtMTEuOTM0bDAuMTkyLTk2LjMzOWg5Ni4yNDIgICAgYzYuODMzLDAsMTIuMDMtNS4xOTcsMTIuMDMtMTIuMDNDMTMyLjUxNCw1LjE5NywxMjcuMzE3LDAsMTIwLjQ5NiwweiIgZmlsbD0iIzAwMDAwMCIvPgoJCTxwYXRoIGQ9Ik0xMjAuMTIzLDM2MC45MDlIMjQuMDYxdi05Ni4yNDJjMC02LjgzMy01LjE5Ny0xMi4wMy0xMi4wMy0xMi4wM1MwLDI1Ny44MzMsMCwyNjQuNjY3djEwOC4wOTIgICAgYzAsMC4wMzYsMC4wMTIsMC4wNiwwLjAxMiwwLjA4NGMwLDAuMDM2LTAuMDEyLDAuMDYtMC4wMTIsMC4wOTZjMCw2LjcxMyw1LjMxNywxMi4wMywxMi4wMywxMi4wM2gxMDguMDkyICAgIGM2LjgzMywwLDExLjkyMi01LjM5LDExLjkzNC0xMi4yMjNDMTMyLjA1NywzNjUuOTI2LDEyNi45NTYsMzYwLjkwOSwxMjAuMTIzLDM2MC45MDl6IiBmaWxsPSIjMDAwMDAwIi8+CgkJPHBhdGggZD0iTTM3Mi43NDcsMjUyLjkxM2MtNi44MzMsMC0xMS44NSw1LjEwMS0xMS44MzgsMTEuOTM0djk2LjA2MmgtOTYuMjQyYy02LjgzMywwLTEyLjAzLDUuMTk3LTEyLjAzLDEyLjAzICAgIHM1LjE5NywxMi4wMywxMi4wMywxMi4wM2gxMDguMDkyYzAuMDM2LDAsMC4wNi0wLjAxMiwwLjA4NC0wLjAxMmMwLjAzNi0wLjAxMiwwLjA2LDAuMDEyLDAuMDk2LDAuMDEyICAgIGM2LjcxMywwLDEyLjAzLTUuMzE3LDEyLjAzLTEyLjAzVjI2NC44NDdDMzg0Ljk3LDI1OC4wMTQsMzc5LjU4LDI1Mi45MTMsMzcyLjc0NywyNTIuOTEzeiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgoJPGc+Cgk8L2c+Cgk8Zz4KCTwvZz4KCTxnPgoJPC9nPgoJPGc+Cgk8L2c+Cgk8Zz4KCTwvZz4KCTxnPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo="
              style={{
                width: "24px",
                height: "auto",
                marginTop: "6px"
              }}
            />
          </div>
        </Tooltip>
      )}
      {props.fullscreen === true && (
        <Tooltip title="Colocar o mapa em tela normal">
          <div
            onClick={() => {
              props.setFullScreenMode(false);
              props.map.getDiv().style.position = "relative";
              props.map.getDiv().style.top = "inherit";
              props.map.getDiv().style.left = "inherit";
              props.map.getDiv().style.right = "inherit";
              props.map.getDiv().style.bottom = "inherit";
              props.map.getDiv().style.zIndex = "inherit";
              props.map.getDiv().style.height = "400px";
            }}
            style={{
              backgroundColor: "rgb(255, 255, 255)",
              border: "2px solid rgb(255, 255, 255)",
              borderRadius: "2px",
              boxShadow: "rgba(0, 0, 0, 0.3) 0px 2px 6px",
              cursor: "pointer",
              float: "left",
              textAlign: "center",
              width: "40px",
              height: "40px",
              marginRight: 10
            }}>
            <img
              src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDM4NS4zMzEgMzg1LjMzMSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzg1LjMzMSAzODUuMzMxOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCI+CjxnPgoJPGcgaWQ9IkZ1bGxzY3JlZW5fRXhpdCI+CgkJPHBhdGggZD0iTTI2NC45NDMsMTU2LjY2NWgxMDguMjczYzYuODMzLDAsMTEuOTM0LTUuMzksMTEuOTM0LTEyLjIxMWMwLTYuODMzLTUuMTAxLTExLjg1LTExLjkzNC0xMS44MzhoLTk2LjI0MlYzNi4xODEgICAgYzAtNi44MzMtNS4xOTctMTIuMDMtMTIuMDMtMTIuMDNzLTEyLjAzLDUuMTk3LTEyLjAzLDEyLjAzdjEwOC4yNzNjMCwwLjAzNiwwLjAxMiwwLjA2LDAuMDEyLDAuMDg0ICAgIGMwLDAuMDM2LTAuMDEyLDAuMDYtMC4wMTIsMC4wOTZDMjUyLjkxMywxNTEuMzQ3LDI1OC4yMywxNTYuNjc3LDI2NC45NDMsMTU2LjY2NXoiIGZpbGw9IiMwMDAwMDAiLz4KCQk8cGF0aCBkPSJNMTIwLjI5MSwyNC4yNDdjLTYuODIxLDAtMTEuODM4LDUuMTEzLTExLjgzOCwxMS45MzR2OTYuMjQySDEyLjAzYy02LjgzMywwLTEyLjAzLDUuMTk3LTEyLjAzLDEyLjAzICAgIGMwLDYuODMzLDUuMTk3LDEyLjAzLDEyLjAzLDEyLjAzaDEwOC4yNzNjMC4wMzYsMCwwLjA2LTAuMDEyLDAuMDg0LTAuMDEyYzAuMDM2LDAsMC4wNiwwLjAxMiwwLjA5NiwwLjAxMiAgICBjNi43MTMsMCwxMi4wMy01LjMxNywxMi4wMy0xMi4wM1YzNi4xODFDMTMyLjUxNCwyOS4zNiwxMjcuMTI0LDI0LjI1OSwxMjAuMjkxLDI0LjI0N3oiIGZpbGw9IiMwMDAwMDAiLz4KCQk8cGF0aCBkPSJNMTIwLjM4NywyMjguNjY2SDEyLjExNWMtNi44MzMsMC4wMTItMTEuOTM0LDUuMzktMTEuOTM0LDEyLjIyM2MwLDYuODMzLDUuMTAxLDExLjg1LDExLjkzNCwxMS44MzhoOTYuMjQydjk2LjQyMyAgICBjMCw2LjgzMyw1LjE5NywxMi4wMywxMi4wMywxMi4wM2M2LjgzMywwLDEyLjAzLTUuMTk3LDEyLjAzLTEyLjAzVjI0MC44NzdjMC0wLjAzNi0wLjAxMi0wLjA2LTAuMDEyLTAuMDg0ICAgIGMwLTAuMDM2LDAuMDEyLTAuMDYsMC4wMTItMC4wOTZDMTMyLjQxOCwyMzMuOTgzLDEyNy4xLDIyOC42NjYsMTIwLjM4NywyMjguNjY2eiIgZmlsbD0iIzAwMDAwMCIvPgoJCTxwYXRoIGQ9Ik0zNzMuMywyMjguNjY2SDI2NS4wMjhjLTAuMDM2LDAtMC4wNiwwLjAxMi0wLjA4NCwwLjAxMmMtMC4wMzYsMC0wLjA2LTAuMDEyLTAuMDk2LTAuMDEyICAgIGMtNi43MTMsMC0xMi4wMyw1LjMxNy0xMi4wMywxMi4wM3YxMDguMjczYzAsNi44MzMsNS4zOSwxMS45MjIsMTIuMjIzLDExLjkzNGM2LjgyMSwwLjAxMiwxMS44MzgtNS4xMDEsMTEuODM4LTExLjkyMnYtOTYuMjQyICAgIEgzNzMuM2M2LjgzMywwLDEyLjAzLTUuMTk3LDEyLjAzLTEyLjAzUzM4MC4xMzQsMjI4LjY3OCwzNzMuMywyMjguNjY2eiIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgoJPGc+Cgk8L2c+Cgk8Zz4KCTwvZz4KCTxnPgoJPC9nPgoJPGc+Cgk8L2c+Cgk8Zz4KCTwvZz4KCTxnPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo="
              style={{
                width: "24px",
                height: "auto",
                marginTop: "6px"
              }}
            />
          </div>
        </Tooltip>
      )}
    </span>
  );
};

const BtnEditar = props => {
  return (
    <Tooltip title="Criar pontos de posicionamento no mapa" trigger="hover">
      <div
        onClick={() => {
          if (!props.hasBounds) props.adicionarPontosAoMapa();
        }}
        style={{
          backgroundColor:
            props.active === false ? "rgb(255, 255, 255)" : "#f2ff31",
          border: "2px solid rgb(255, 255, 255)",
          borderRadius: "2px",
          boxShadow: "rgba(0, 0, 0, 0.3) 0px 2px 6px",
          cursor: "pointer",
          float: "left",
          textAlign: "center",
          width: "40px",
          height: "40px",
          marginRight: 10
        }}>
        <img
          src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBoZWlnaHQ9IjUxMnB4IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9Ii01NSAwIDYxMCA2MTAiIHdpZHRoPSI1MTJweCI+CjxnIGlkPSJzdXJmYWNlMSI+CjxwYXRoIGQ9Ik0gMzczIDMwMiBDIDM5MC44NTkzNzUgMjU4IDQwMCAyMjMuNjI4OTA2IDQwMCAyMDAgQyA0MDAgODkuNTM5MDYyIDMxMC40NjA5MzggMCAyMDAgMCBDIDg5LjUzOTA2MiAwIDAgODkuNTM5MDYyIDAgMjAwIEMgMCAzMDYuNTE5NTMxIDE4My43Njk1MzEgNTkzLjI2MTcxOSAxOTEuNTkzNzUgNjA1LjQxMDE1NiBDIDE5My40MzM1OTQgNjA4LjI3MzQzOCAxOTYuNTk3NjU2IDYxMCAyMDAgNjEwIEMgMjAzLjQwMjM0NCA2MTAgMjA2LjU2NjQwNiA2MDguMjczNDM4IDIwOC40MDYyNSA2MDUuNDEwMTU2IEMgMjA4LjU1ODU5NCA2MDUuMTc5Njg4IDIyMS44MzIwMzEgNTg0LjUxMTcxOSAyNDEuMDcwMzEyIDU1Mi44MDg1OTQgQyAyODYgNjAwLjU0Njg3NSAzNTYuNzQyMTg4IDYxMy41MzUxNTYgNDE1LjcwMzEyNSA1ODQuODc1IEMgNDc0LjY1NjI1IDU1Ni4yMTA5MzggNTA4LjE0NDUzMSA0OTIuNTU0Njg4IDQ5OC4zNTkzNzUgNDI3LjczNDM3NSBDIDQ4OC41NzQyMTkgMzYyLjkxNDA2MiA0MzcuNzg5MDYyIDMxMS45ODQzNzUgMzczIDMwMiBaIE0gMjAwIDU4MS4yOTY4NzUgQyAxNjMuNDA2MjUgNTIyLjg3MTA5NCAyMCAyODguMjgxMjUgMjAgMjAwIEMgMjAgMTAwLjU4OTg0NCAxMDAuNTg5ODQ0IDIwIDIwMCAyMCBDIDI5OS40MTAxNTYgMjAgMzgwIDEwMC41ODk4NDQgMzgwIDIwMCBDIDM4MCAyMjIgMzcwLjU3MDMxMiAyNTUuNzg5MDYyIDM1Mi4xNzk2ODggMzAwLjExMzI4MSBDIDM1MS40NDkyMTkgMzAwLjExMzI4MSAzNTAuNzQyMTg4IDMwMCAzNTAgMzAwIEMgMjkzLjk0NTMxMiAyOTkuOTE3OTY5IDI0Mi41MzUxNTYgMzMxLjE0MDYyNSAyMTYuNzY1NjI1IDM4MC45MjE4NzUgQyAxOTAuOTk2MDk0IDQzMC43MDMxMjUgMTk1LjE3OTY4OCA0OTAuNzA3MDMxIDIyNy42MTMyODEgNTM2LjQyOTY4OCBDIDIxNi4wODk4NDQgNTU1LjUwNzgxMiAyMDYuNDEwMTU2IDU3MS4wOTc2NTYgMjAwIDU4MS4yOTY4NzUgWiBNIDM1MCA1ODAgQyAyNzguMjAzMTI1IDU4MCAyMjAgNTIxLjc5Njg3NSAyMjAgNDUwIEMgMjIwIDM3OC4yMDMxMjUgMjc4LjIwMzEyNSAzMjAgMzUwIDMyMCBDIDQyMS43OTY4NzUgMzIwIDQ4MCAzNzguMjAzMTI1IDQ4MCA0NTAgQyA0NzkuOTE3OTY5IDUyMS43NjE3MTkgNDIxLjc2MTcxOSA1NzkuOTE3OTY5IDM1MCA1ODAgWiBNIDM1MCA1ODAgIiBzdHlsZT0iIGZpbGwtcnVsZTpub256ZXJvO2ZpbGwtb3BhY2l0eToxOyIgc3Ryb2tlPSIjMDAwMDAwIiBmaWxsPSIjMDAwMDAwIi8+CjxwYXRoIGQ9Ik0gMzYwIDQ0MCBMIDM2MCAzNTAgTCAzNDAgMzUwIEwgMzQwIDQ0MCBMIDI1MCA0NDAgTCAyNTAgNDYwIEwgMzQwIDQ2MCBMIDM0MCA1NDAgTCAzNjAgNTQwIEwgMzYwIDQ2MCBMIDQ1MCA0NjAgTCA0NTAgNDQwIFogTSAzNjAgNDQwICIgc3R5bGU9IiBmaWxsLXJ1bGU6bm9uemVybztmaWxsLW9wYWNpdHk6MTsiIHN0cm9rZT0iIzAwMDAwMCIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNIDMxMCAyMDAgQyAzMTAgMTM5LjI1IDI2MC43NSA5MCAyMDAgOTAgQyAxMzkuMjUgOTAgOTAgMTM5LjI1IDkwIDIwMCBDIDkwIDI2MC43NSAxMzkuMjUgMzEwIDIwMCAzMTAgQyAyNjAuNzIyNjU2IDMwOS45MjU3ODEgMzA5LjkyNTc4MSAyNjAuNzIyNjU2IDMxMCAyMDAgWiBNIDExMCAyMDAgQyAxMTAgMTUwLjI5Mjk2OSAxNTAuMjkyOTY5IDExMCAyMDAgMTEwIEMgMjQ5LjcwNzAzMSAxMTAgMjkwIDE1MC4yOTI5NjkgMjkwIDIwMCBDIDI5MCAyNDkuNzA3MDMxIDI0OS43MDcwMzEgMjkwIDIwMCAyOTAgQyAxNTAuMzE2NDA2IDI4OS45NDUzMTIgMTEwLjA1NDY4OCAyNDkuNjgzNTk0IDExMCAyMDAgWiBNIDExMCAyMDAgIiBzdHlsZT0iIGZpbGwtcnVsZTpub256ZXJvO2ZpbGwtb3BhY2l0eToxOyIgc3Ryb2tlPSIjMDAwMDAwIiBmaWxsPSIjMDAwMDAwIi8+CjwvZz4KPC9zdmc+Cg=="
          style={{
            width: "24px",
            height: "auto",
            marginTop: "6px"
          }}
        />
      </div>
    </Tooltip>
  );
};

const BtnLimparMapa = props => {
  const doClean = () => {
    this.refDrawingMgr && this.refDrawingMgr.setMap(null);
    props.limparMapa();
  };

  return (
    <Tooltip title="Limpar todos os pontos do mapa" trigger="hover">
      <div
        onClick={() => {
          confirm({
            content: "Tem certeza que deseja limpar todos os pontos do mapa?",
            onOk() {
              doClean();
            }
          });
        }}
        style={{
          backgroundColor: "rgb(255, 255, 255)",
          border: "2px solid rgb(255, 255, 255)",
          borderRadius: "3px",
          boxShadow: "rgba(0, 0, 0, 0.3) 0px 2px 6px",
          cursor: "pointer",
          textAlign: "center",
          float: "left",
          width: "40px",
          height: "40px"
        }}>
        <img
          src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMS4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ4Ni40IDQ4Ni40IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODYuNCA0ODYuNDsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI2NHB4IiBoZWlnaHQ9IjY0cHgiPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik00NDYsNzBIMzQ0LjhWNTMuNWMwLTI5LjUtMjQtNTMuNS01My41LTUzLjVoLTk2LjJjLTI5LjUsMC01My41LDI0LTUzLjUsNTMuNVY3MEg0MC40Yy03LjUsMC0xMy41LDYtMTMuNSwxMy41ICAgIFMzMi45LDk3LDQwLjQsOTdoMjQuNHYzMTcuMmMwLDM5LjgsMzIuNCw3Mi4yLDcyLjIsNzIuMmgyMTIuNGMzOS44LDAsNzIuMi0zMi40LDcyLjItNzIuMlY5N0g0NDZjNy41LDAsMTMuNS02LDEzLjUtMTMuNSAgICBTNDUzLjUsNzAsNDQ2LDcweiBNMTY4LjYsNTMuNWMwLTE0LjYsMTEuOS0yNi41LDI2LjUtMjYuNWg5Ni4yYzE0LjYsMCwyNi41LDExLjksMjYuNSwyNi41VjcwSDE2OC42VjUzLjV6IE0zOTQuNiw0MTQuMiAgICBjMCwyNC45LTIwLjMsNDUuMi00NS4yLDQ1LjJIMTM3Yy0yNC45LDAtNDUuMi0yMC4zLTQ1LjItNDUuMlY5N2gzMDIuOXYzMTcuMkgzOTQuNnoiIGZpbGw9IiMwMDAwMDAiLz4KCQk8cGF0aCBkPSJNMjQzLjIsNDExYzcuNSwwLDEzLjUtNiwxMy41LTEzLjVWMTU4LjljMC03LjUtNi0xMy41LTEzLjUtMTMuNXMtMTMuNSw2LTEzLjUsMTMuNXYyMzguNSAgICBDMjI5LjcsNDA0LjksMjM1LjcsNDExLDI0My4yLDQxMXoiIGZpbGw9IiMwMDAwMDAiLz4KCQk8cGF0aCBkPSJNMTU1LjEsMzk2LjFjNy41LDAsMTMuNS02LDEzLjUtMTMuNVYxNzMuN2MwLTcuNS02LTEzLjUtMTMuNS0xMy41cy0xMy41LDYtMTMuNSwxMy41djIwOC45ICAgIEMxNDEuNiwzOTAuMSwxNDcuNywzOTYuMSwxNTUuMSwzOTYuMXoiIGZpbGw9IiMwMDAwMDAiLz4KCQk8cGF0aCBkPSJNMzMxLjMsMzk2LjFjNy41LDAsMTMuNS02LDEzLjUtMTMuNVYxNzMuN2MwLTcuNS02LTEzLjUtMTMuNS0xMy41cy0xMy41LDYtMTMuNSwxMy41djIwOC45ICAgIEMzMTcuOCwzOTAuMSwzMjMuOCwzOTYuMSwzMzEuMywzOTYuMXoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K"
          style={{
            width: "22px",
            height: "auto",
            marginTop: "7px"
          }}
        />
      </div>
    </Tooltip>
  );
};
