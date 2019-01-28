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
    <Table
      {...{
        scroll: {
          x:
            window.innerWidth +
            props.columns.reduce(function(prev, elem) {
              return prev + (elem.hasOwnProperty("fixed") && elem.width || 100);
            }, 0)
        },
        ...props
      }}
    />
  </Spin>
);

export default SimpleTable;
