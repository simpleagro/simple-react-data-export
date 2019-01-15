import React from "react";
import { Table, Spin, Pagination, Button } from "antd";

const SimpleTable = ({ spinning, ...props }) => (
  <Spin spinning={spinning} tip="Carregando..." size="large">
    {/* <Button
      ghost
      type="primary"
      icon="reload"
      onClick={() => window.location.reload()}>
      Atualizar
    </Button> */}
    <Table {...{ scroll: { x: true }, ...props }} />
    {/* scroll={{ y: 240 }} */}
  </Spin>
);

export default SimpleTable;
