## Use case: CheckLastEventStatus

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

## Use case: DeleteEvent
Dados
* Id do Usuário
* Id da Pelada

### Fluxo primário
1. Obter os dados do grupo da pelada a ser removida,
2. Verificar se o usuário que solicitou a exclusão da pelada tem permissão (admin ou dono)
3. Remover a pelada com o Id acima
4. Remover todas as partidas dessa pelada

### Fluxo alternativo: Não foi encontrado um grupo para o id da Pelada informada
1. Retornar erro

### Fluxo alternativo: o usuário não pertence ao grupo
2. Retornar erro

### Fluxo alternativo: o usuário não tem permissão
2. Retornar erro
