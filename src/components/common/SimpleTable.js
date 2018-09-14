import React from "react";
import { Table, Spin, Pagination } from 'antd';

// const locale = {
//   filterConfirm: 'Ok',
//   filterReset: 'Cancelar',
//   emptyText: 'Sem registros'
// };

const SimpleTable = ({spinning, ...props}) => (
  <Spin spinning={spinning} tip="Carregando..." size="large">
    <Table {...props} />
  </Spin>
);

export default SimpleTable;
