##
## Dockerfile do Painel Administrativo
## Simple Agro 
##

# Definindo a imagem base
FROM node:10.11

# Criando a pasta onde estará os arquivos
RUN mkdir /usr/src/app

# Definindo a pasta de trabalho
WORKDIR /usr/src/app

# Definindo o path atraves da variavel de ambiente PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Incluindo o arquivo de dependencias
ADD package.json /usr/src/app/package.json

# Incluindo o restante dos arquivos
ADD . /usr/src/app

# Instalando as dependencias
RUN npm install

#ADD . /usr/src/app

# Iniciando o serviço
CMD ["npm", "start"]