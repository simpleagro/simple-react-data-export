import React from "react";
import _ from "lodash";
import { Polygon } from "react-google-maps";
import { compose, withProps, lifecycle, defaultProps } from "recompose";
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
      ref={props.onMapMounted}
      defaultZoom={props.defaultZoom || 18}
      center={
        props.latitude && props.longitude
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
              clickable: false,
              editable: true,
              zIndex: 1
            }
          }}
          onPolygonComplete={poly => {
            props.salvarMapa(getBoundsFromPolygon(poly));
            this.refDrawingMgr = poly;
          }}
        />
      )}

      {props.editingMap === true && (
        <Polygon
          ref={poly => {
            this.polygonRef = poly;
          }}
          options={{
            fillColor: `#ffff00`,
            fillOpacity: 0.5,
            strokeWeight: 5,
            clickable: false,
            editable: true,
            zIndex: 1
          }}
          onMouseUp={bounds => {
            props.salvarMapa(getBoundsFromPolygon(this.polygonRef));
          }}
          path={props.polygonData}
        />
      )}

      {props.showControl && (
        <SearchBox
          ref={props.onSearchBoxMounted}
          bounds={props.bounds}
          controlPosition={google.maps.ControlPosition.TOP_LEFT}
          onPlacesChanged={props.onPlacesChanged}>
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
      )}
      {console.log(props.markers)}
      {props.markers &&
        props.markers.length &&
        props.markers.map((marker, index) => (
          <Marker
            draggable
            key={index}
            position={marker.position}
            onDragEnd={e => props.setGPS(e.latLng.lat(), e.latLng.lng())}
          />
        ))}
      {props.showControl && (
        <div>
          <BtnEditar
            hasBounds={props.polygonData.length > 0}
            active={props.drawingMap}
            adicionarPontosAoMapa={props.adicionarPontosAoMapa}
          />
          <BtnLimparMapa limparMapa={props.limparMapa} />
        </div>
      )}
    </GoogleMap>
  );
});

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
          right: "56px",
          textAlign: "center",
          position: "absolute",
          top: "10px",
          width: "40px",
          height: "40px"
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
          right: "102px",
          textAlign: "center",
          position: "absolute",
          top: "10px",
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
