import React from "react";
import { Table, Spin } from "antd";

const SimpleTable = ({ spinning, ...props }) => {
  return (
    <Spin spinning={spinning} tip="Carregando..." size="large">
      <Table {...{ scroll: { x: true }, ...props }} />
    </Spin>
  );
};

export default SimpleTable;
