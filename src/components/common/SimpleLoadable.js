import Loadable from "react-loadable";
import React from "react";
import { Spin, Icon, Button } from "antd";

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

function Loading(props) {
  if (props.error) {
    return (
      <div>
        Oopsss, não era para acontecer isso!{" "}
        <Button
          type="default"
          onClick={() => this.props.history.push(`${window.location.href}`)}
        >
          Vamos carregar novamente...
        </Button>
      </div>
    );
  } else if (props.timedOut) {
    return (
      <div>
        Está meio lento né?{" "}
        <Button
          type="default"
          onClick={() => this.props.history.push(`${window.location.href}`)}
        >
          Quer tentar novamente?
        </Button>
      </div>
    );
  } else if (props.pastDelay) {
    return <Spin tip="Carregando..." size="large" indicator={antIcon} />;
  } else {
    return null;
  }
}

const loadable = loader =>
  Loadable({
    loader,
    loading: Loading,
    timeout: 10000 // 10 seconds
  });

export default loadable;
