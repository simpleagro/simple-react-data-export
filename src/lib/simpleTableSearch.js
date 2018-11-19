import React from "react";
import { Popover, Input, Button, Icon } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const simpleTableSearch = self => field => {
  const helpContent = (
    <div>
      <p>
        Por padrão as buscas são exatas, ou seja, vai buscar pelo valor
        informado de forma integral
      </p>
      <p>
        Se quiser, buscar por uma palavra em qualquer posição use a opção / + o
        valor de interesse + /, ficando assim (/nome_do_cliente/)
      </p>
      <p>
        # Flags <br />
        Colocando flags no final da expressão, muda o comportamento da busca.
      </p>
      <ul>
        <li>
          <strong>(i)</strong>
          nsensivo ao caso
          <div>Tanto faz palavras MAIÚSCULAS e/ou minúsculas, ex: /NOME/i</div>
        </li>
        <li>
          <strong>(^)</strong>
          Início da frase
          <div>ex: /^Jéssika/</div>
        </li>
        <li>
          <strong>($)</strong>
          Final da frase
          <div>ex: /Pereira$/</div>
        </li>
      </ul>
      <p>
        Aqui você pode utilizar expressões regulares, basta colocar o valor
        procurado ou expressão dentro das barras, por ex: (/valor ou
        expressao/).
      </p>
      <a
        style={{ fontWeight: "bold" }}
        target="_blank"
        href="https://tableless.com.br/o-basico-sobre-expressoes-regulares/">
        Veja mais...
      </a>
    </div>
  );
  return {
    filterIcon: filtered => (
      <FontAwesomeIcon
        icon="search"
        style={{ color: filtered ? "#108ee9" : "#aaa" }}
        size="lg"
      />
    ),
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => {
      return (
        <div className="custom-filter-dropdown">
          <Input
            ref={ele => (this["searchInput" + field] = ele)}
            name={field}
            style={{ width: 200 }}
            value={selectedKeys}
            onChange={e => {
              const val = e.target.value;
              setSelectedKeys(val ? val : "");
              self.setState(prev => ({
                ...prev,
                tableSearch: {
                  ...prev.tableSearch,
                  [field]: `/${val}/`
                }
              }));
            }}
            onPressEnter={() => {

              confirm();
              // self.setState(prev => ({
              //   ...prev,
              //   tableSearch: {
              //     ...prev.tableSearch,
              //     [field]: `${val}`
              //   }
              // }));
            }}
          />
          <Button
            type="primary"
            onClick={() => {
              confirm();
              // self.setState(prev => ({
              //   ...prev,
              //   tableSearch: {
              //     ...prev.tableSearch,
              //     [field]: new RegExp(selectedKeys, "gi")
              //   }
              // }));
            }}>
            Ok
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              self.setState(prev => ({
                ...prev,
                tableSearch: { ...prev.tableSearch, [field]: "" }
              }));
            }}>
            Limpar
          </Button>
          <Popover title="Ajuda" content={helpContent}>
            <Icon type="question-circle" />
          </Popover>
        </div>
      );
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => {
          this["searchInput" + field].focus();
        });
      }
    }
  };
};
