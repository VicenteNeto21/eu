# Website - Encontros Universitários 2025 (UFC Crateús)

![Banner do Evento](img/logo-eu-2025.png)

Este é o repositório do site oficial dos **Encontros Universitários 2025** do Campus da UFC em Crateús. O site é uma página única (Single Page Application) desenvolvida para centralizar todas as informações do evento, como programação, cronograma, inscrições e contato.

O tema deste ano é **"Mundo em transformação"**, e o site foi projetado para ser informativo, moderno e acessível.

## ✨ Funcionalidades

- **Design Responsivo**: Totalmente adaptável para desktops, tablets e celulares.
- **Contador Regressivo**: Mostra o tempo restante para o início do evento.
- **Navegação Otimizada**: Rolagem suave entre as seções e um botão "Voltar ao Topo" para melhor usabilidade.
- **Carregamento Dinâmico de Dados**: A programação e o cronograma são carregados a partir de arquivos JSON, facilitando a atualização.
- **Navegação por Abas**: A programação é organizada por dias (10, 11 e 12 de novembro) em abas.
- **Filtro na Programação**: Permite que os usuários filtrem as apresentações por sessão, facilitando a localização de eventos específicos.
- **Status do Cronograma**: As atividades do cronograma são atualizadas dinamicamente com status ("Encerrado", "Em andamento", "Em breve") com base na data atual.
- **Menu de Edições Anteriores**: Um menu suspenso (dropdown) que oferece acesso rápido aos sites das edições passadas do evento.
- **Animações Suaves**: A interface é enriquecida com transições e animações sutis, como a abertura do menu móvel, para uma experiência de usuário mais fluida.
- **Meta Tags de SEO e Redes Sociais**: Otimizado para motores de busca e para um bom compartilhamento em redes sociais (Open Graph e Twitter Cards).

## 📂 Estrutura do Projeto

O projeto está organizado da seguinte forma:

```
├── database/
│   ├── cronograma.json   # Dados para a seção de cronograma
│   └── programacao.json  # Dados de todas as sessões e apresentações
├── img/
│   └── logo-eu-2025.png  # Imagem principal do evento
├── script/
│   └── main.js           # Todo o código JavaScript da aplicação
├── index.html            # Arquivo principal da página
└── README.md             # Este arquivo
```

## 🚀 Como Executar Localmente

Como o site utiliza a API `fetch()` para carregar os arquivos JSON, ele precisa ser servido por um servidor web local para funcionar corretamente (abrir o `index.html` diretamente no navegador resultará em erros de CORS).

A maneira mais simples de fazer isso é usando a extensão **Live Server** no Visual Studio Code.

1.  Instale a extensão Live Server no VS Code.
2.  Abra a pasta do projeto no VS Code.
3.  Clique com o botão direito no arquivo `index.html`.
4.  Selecione "Open with Live Server".

Alternativamente, você pode usar o servidor embutido do Python:

```bash
# Se você tiver Python 3.x
python -m http.server
```

Depois de iniciar o servidor, acesse `http://localhost:8000` (ou a porta indicada) no seu navegador.

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura da página.
- **Tailwind CSS**: Framework CSS para estilização rápida e responsiva.
- **JavaScript (ES6+)**: Lógica do site, incluindo manipulação do DOM e requisições assíncronas.
- **Animate.css**: Biblioteca para animações de entrada de elementos.

## 📄 Arquivos de Dados

### `database/cronograma.json`

Contém um array de objetos, onde cada objeto representa um item no cronograma de atividades do evento.

```json
{ "title": "Lançamento do edital", "date": "28/07/2025" }
```

### `database/programacao.json`

Contém um array de objetos, onde cada objeto representa uma sessão de apresentação (Oral, Pitch ou Pôster). Inclui detalhes como dia, área, tipo, título da sessão, sala, horário, banca avaliadora e uma lista de apresentações.

```json
{
  "day": 10,
  "area": "Computação e Tecnologia da Informação",
  "type": "Apresentação Oral",
  "sessionTitle": "Sessão 01",
  "room": "Sala 01",
  "dateTime": "10/11/2025 das 08:30 às 10:00",
  "banca": [
    "Nome do Avaliador 1",
    "Nome do Avaliador 2"
  ],
  "presentations": [
    { "author": "Nome do Autor", "title": "Título do Trabalho" }
  ]
}
```