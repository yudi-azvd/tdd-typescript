class CheckLastEventStatus {
  constructor(
    private readonly loadLastRepository: LoadLastEventRepository
  ) { }

  async perform(groupId: string): Promise<string> {
    await this.loadLastRepository.loadLastEvent(groupId)
    return 'done'
  }
}

type SutOutput = {
  sut: CheckLastEventStatus
  loadLastEventRepository: LoadLastEventRepositorySpy
}

const makeSut = (): SutOutput => {
  const loadLastEventRepository = new LoadLastEventRepositorySpy()
  const sut = new CheckLastEventStatus(loadLastEventRepository)
  return {sut, loadLastEventRepository}
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
    const { sut, loadLastEventRepository } = makeSut()

    await sut.perform('any_group_id')
    expect(loadLastEventRepository.groupId).toEqual('any_group_id')
    expect(loadLastEventRepository.callsCount).toEqual(1)
  })

  test('should return status done when group has no events', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = undefined


    const status = await sut.perform('any_group_id')

    expect(status).toBe('done')
  })
})
