import React from "react";
import { Table, Spin } from 'antd';

const locale = {
  filterConfirm: 'Ok',
  filterReset: 'Cancelar',
  emptyText: 'Sem registros'
};

const SimpleTable = ({spinning, ...props}) => (
  <Spin spinning={spinning} tip="Carregando..." size="large">
    <Table locale={locale} {...props} />
  </Spin>
);

export default SimpleTable;
