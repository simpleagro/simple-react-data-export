import Loadable from "react-loadable";
import dashboard from "./Menus/dashboard";
import empresas from "./Menus/empresas";
import modulos from "./Menus/modulos";
import entidades from "./Menus/entidades";
import usuarios from "./Menus/usuarios";
import consultores from "./Menus/consultores";
import clientes from "./Menus/clientes";
import carteiraDeClientes from "./Menus/carteira-de-clientes";
import caracteristicasProdutos from "./Menus/caracteristicas-produtos";
import gruposDeProdutos from "./Menus/grupos-produtos";
import produtos from "./Menus/produtos";
import safras from "./Menus/safras";
import etapasCultura from "./Menus/etapas-cultura";
import unidadesMedida from "./Menus/unidades-medidas";
import plantio from "./Menus/plantio";
import gestaoDeProjetosAgricolas from "./Menus/gestao-projetos-agricolas";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  ...dashboard,
  ...empresas,
  ...modulos,
  ...entidades,
  ...usuarios,
  ...consultores,
  ...clientes,
  ...plantio,
  ...carteiraDeClientes,
  ...gestaoDeProjetosAgricolas,
  ...caracteristicasProdutos,
  ...gruposDeProdutos,
  ...produtos,
  ...safras,
  ...etapasCultura,
  ...unidadesMedida,
};

export { menus };
