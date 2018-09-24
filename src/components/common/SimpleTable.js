import React from "react";
import { Table, Spin, Pagination } from "antd";

const SimpleTable = ({ spinning, ...props }) => (
  <Spin spinning={spinning} tip="Carregando..." size="large">
    <Table {...props} />
  </Spin>
);

export default SimpleTable;
