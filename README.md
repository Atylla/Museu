# VOZES QUE NÃO SE CALAM — museu virtual para GitHub Pages

**Versão 100% estática.** A interface e os conteúdos do site usam somente HTML, CSS e JavaScript puros. Não há Node.js, banco de dados, servidor de aplicação, instalação de pacotes, ferramentas de build, frameworks nem APIs de terceiros. A pasta também contém apenas este guia em Markdown e o arquivo vazio `.nojekyll` (configuração do GitHub Pages).

## 1. Abrir o museu no seu computador

1. Extraia todos os arquivos do ZIP, preservando as pastas.
2. Dê dois cliques no **`index.html`**. O museu pode ser aberto sem instalar o Node.js nem iniciar servidor.
3. Para editar, abra **`editor.html`** no navegador, preferencialmente no mesmo computador e navegador em que você conferirá a prévia.

A primeira versão já inclui **8 galerias**, **48 quadros educativos**, uma planta baixa SVG clicável, busca no acervo, cronologia, cartões de reflexão, quiz, páginas de projetos, versão para celular e painel de edição local.

## 2. Publicar no GitHub Pages

1. Crie um repositório no GitHub, como `museu-antirracista`.
2. Na raiz do repositório, envie `index.html`, `editor.html`, as pastas `css/` e `js/`, o arquivo `.nojekyll` e (opcionalmente) este `README.md`.
3. Abra **Settings → Pages** no repositório.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Selecione a branch `main` e a pasta **`/(root)`**, e clique em **Save**.
6. O endereço ficará parecido com `https://SEU-USUARIO.github.io/museu-antirracista/`.

**Não é necessário GitHub Actions, npm ou geração de arquivos.** Todos os caminhos são relativos (`./css/...`, `./js/...`, `./editor.html`, `assets/...`), portanto o site funciona tanto num endereço principal quanto dentro de um subdiretório de repositório.

**Atenção:** envie os arquivos *dentro* da pasta extraída diretamente à raiz do repositório, sem deixar uma pasta `museu-vozes-github-pages` acima do `index.html`, a menos que você configure a publicação de outra forma.

## 3. Atualizar conteúdos sem escrever código

O arquivo `js/dados.js` é o **acervo completo**. As oito galerias e seus quadros são mantidos em objetos JavaScript nesse arquivo, separados da apresentação visual.

1. Entre em `editor.html`.
2. Escolha **Galerias e quadros** para alterar títulos, textos, imagens, fontes ou criar uma nova sala. É possível adicionar quantos quadros forem necessários.
3. Escolha **Planta do museu** para arrastar as salas, definir coordenadas e modificar o tamanho das novas alas.
4. Escolha **Projetos escolares** para cadastrar autorias, disciplinas, turmas, objetivos, resultados e links de imagens.
5. Use **Prévia do rascunho** para conferir as mudanças. A prévia adiciona `?rascunho=1` ao endereço; visitantes normais NÃO verão essas mudanças.
6. Use **Baixar dados.js para publicar**. O navegador baixará um arquivo com as informações atualizadas.
7. No GitHub, navegue até `js/dados.js`, clique em editar/substituir ou faça upload da nova versão e confirme o **commit**. Só então a versão pública exibirá as novidades.

O editor guarda um *rascunho local* no `localStorage` do navegador para evitar perda de trabalho durante a sessão. Ele pode importar um `dados.js` previamente exportado ou arquivo JSON de estrutura equivalente. **Esse armazenamento não faz backup remoto.** Exporte o `dados.js` regularmente e guarde uma cópia.

### Importante sobre a falta de login

A página `editor.html` fica publicamente acessível, tal como qualquer outra página estática. **Não há login nem autenticação** porque uma senha feita só em JavaScript não protegeria nada. Qualquer visitante pode experimentar o editor, mas essas alterações afetarão **somente o navegador dele**. Apenas quem tem acesso de escrita ao repositório GitHub consegue publicar alterações oficiais.

Para impedir visitantes de ver um link para o editor, remova o link `Editor de conteúdo` do rodapé de `index.html`. A URL ainda será pública para quem a conhecer; ela nunca deve conter segredos.

## 4. Fotografias, documentos e novos recursos

É possível usar fotos externas em endereços `https://...` ou arquivos hospedados na própria pasta `assets/` do repositório.

Por exemplo, envie `foto-da-maquete.jpg` para `assets/foto-da-maquete.jpg` e, no editor, indique:

```
assets/foto-da-maquete.jpg
```

Para colocar várias imagens de um projeto, informe um caminho ou URL por linha. Faça upload das imagens para o GitHub separadamente: **um navegador estático não pode enviar arquivos ao repositório sem um serviço autorizado**.

Não publique fotos de estudantes sem autorização adequada. Use apenas imagens históricas licenciadas/autorizadas, ou ilustrações identificadas como interpretações. Verifique créditos e fontes antes de divulgar os conteúdos.

## 5. O que muda em relação à versão anterior?

| Recurso | Nesta versão estática |
| --- | --- |
| Início / planta interativa | Funciona integralmente |
| Oito galerias e 48 quadros | Incluídos no arquivo `js/dados.js` |
| Pesquisa, quiz e linha do tempo | Funcionam no navegador |
| Editor de galerias e projetos | Funciona localmente + exportação de `dados.js` |
| Planta com novas salas | Editável no editor, depois exportável |
| Login de administrador | Removido: não seria seguro no GitHub Pages |
| Banco de dados / Node / API | Removidos |
| Upload de imagens | Upload manual no repositório GitHub |
| Mensagens de visitantes | Reflexão pessoal salva apenas no próprio navegador |
| Mural público | Somente mensagens inseridas manualmente pelo curador no editor |
| Publicação das mudanças | Substituir `js/dados.js` e fazer commit no GitHub |

## 6. Organização do projeto

```
index.html            Página inicial e navegação do museu
editor.html           Editor local de galerias, quadros, mapa e projetos
css/style.css         Identidade visual do museu
css/responsive.css    Adaptação para telas menores
css/admin.css         Base visual do editor
css/editor.css        Ajustes do editor estático
js/dados.js           Acervo e dados de todas as exposições
js/main.js            Navegação, pesquisa e conteúdo institucional
js/mapa.js            Planta interativa SVG
js/galerias.js        Quadros, exposições e atividades
js/acervo.js          Listagens e referências
js/utils.js           Funções comuns
js/editor.js          Editor local, rascunho e exportação
.nojekyll             Desativa processamento Jekyll do GitHub Pages
README.md             Este guia
```

As fontes citadas nos textos incluem o Instituto Moreira Salles, as leis nº 10.639/2003 e nº 11.645/2008 e a obra de Carolina Maria de Jesus. O museu preserva a distinção entre ilustrações interpretativas e documentos históricos.

---

**Dica:** para testar mudanças sem publicá-las, use a prévia do editor. Não confunda o rascunho individual do navegador com a versão publicada no GitHub Pages.
