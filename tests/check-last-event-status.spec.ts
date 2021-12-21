class CheckLastEventStatus {
  constructor(
    private readonly loadLastRepository: LoadLastEventRepository
  ) { }

  async perform(groupId: string): Promise<string> {
    await this.loadLastRepository.loadLastEvent(groupId)
    return 'done'
  }
}

interface LoadLastEventRepository  {
  loadLastEvent(groupId: string): Promise<void>
}

class LoadLastEventRepositorySpy implements LoadLastEventRepository {
  groupId?: string
  callsCount = 0
  output: undefined

  async loadLastEvent(groupId: string): Promise<void> {
    this.groupId = groupId
    this.callsCount++
    return this.output
  }
}

describe('CheckLastEventStatus', () => {
  test('should get last event data', async () => {
    const loadLastEventRepository = new LoadLastEventRepositorySpy()
    const sut = new CheckLastEventStatus(loadLastEventRepository)

    await sut.perform('any_group_id')
    expect(loadLastEventRepository.groupId).toEqual('any_group_id')
    expect(loadLastEventRepository.callsCount).toEqual(1)
  })

  test('should return status done when group has no events', async () => {
    const loadLastEventRepository = new LoadLastEventRepositorySpy()
    loadLastEventRepository.output = undefined
    const sut = new CheckLastEventStatus(loadLastEventRepository)

    const status = await sut.perform('any_group_id')

    expect(status).toBe('done')
  })
})
