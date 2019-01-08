import React from "react";

import { Icon, Spin } from "antd";

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

export const SimpleLazyLoader = props => {
  return props.loadingForm ? (
    <Spin tip="Carregando..." size="large" indicator={antIcon} />
  ) : (
    props.children
  );
};
