# TDD com TypeScript

[Vídeo aula](https://www.youtube.com/watch?v=sg1zFpNM5Jw) da
Rocketseat + Rodrigo Manguinho

## Como rodar

Instale as dependências:

    npm i

Rode os testes

    npm run test:watch

Se você quiser programar enquanto assiste a aula, baixe esse
[template inicial](https://github.com/yudi-azvd/tdd-typescript/tree/initial-template):

    git clone -b initial-template https://github.com/yudi-azvd/tdd-typescript.git

E comece a programar.

## Casos de uso

Dados: id do Grupo

### Fluxo primário
1. Obter os dados da último evento do grupo (data de término e duração do mercado de notas)
1. Retornar status "ativo" se o evento ainda não foi encerrado

### Fluxo alternativo: Evento está no limite do encerramento
1. Retornar status "ativo"

### Fluxo alternativo: Evento encerrado, mas está dentro do período do mercado das notas
1. Retornar status "em revisão"

### Fluxo alternativo: Evento e mercado das notas encerrados
1. Retornar status "encerrado"

### Fluxo alternativo: Grupo não tem nenhum evento marcada
1. Retornar status "encerrado"
