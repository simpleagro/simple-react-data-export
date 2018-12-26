import Loadable from "react-loadable";
import dashboard from "./Menus/dashboard";
import empresas from "./Menus/empresas";
import modulos from "./Menus/modulos";
import entidades from "./Menus/entidades";
import usuarios from "./Menus/usuarios";
import consultores from "./Menus/consultores";
import clientes from "./Menus/clientes";
import carteiraDeClientes from "./Menus/carteira-de-clientes";
//import caracteristicasProdutos from "./Menus/caracteristicas-produtos";
import gruposDeProdutos from "./Menus/grupos-produtos";
import produtos from "./Menus/produtos";
import safras from "./Menus/safras";
import etapasCultura from "./Menus/etapas-cultura";
import unidadesMedida from "./Menus/unidades-medidas";
import plantio from "./Menus/plantio";
import gestaoDeProjetosAgricolas from "./Menus/gestao-projetos-agricolas";
import filiais from "./Menus/filiais"
import tabelaFrete from './Menus/tabela-frete'
import tabelaPreco from './Menus/tabela-preco'
import metas from './Menus/metas'
import cotas from './Menus/cotas'
import tabelaComissao from './Menus/tabela-comissao'

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  ...dashboard,
  ...empresas,
  ...filiais,
  ...modulos,
  ...entidades,
  ...usuarios,
  ...consultores,
  ...clientes,
  ...plantio,
  ...carteiraDeClientes,
  ...gestaoDeProjetosAgricolas,
  //...caracteristicasProdutos,
  ...gruposDeProdutos,
  ...produtos,
  ...safras,
  ...etapasCultura,
  ...unidadesMedida,
  ...tabelaFrete,
  ...tabelaPreco,
  ...tabelaComissao,
  ...metas,
  ...cotas
};

export { menus };
