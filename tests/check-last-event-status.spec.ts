import {set, reset} from 'mockdate'

class CheckLastEventStatus {
  constructor(
    private readonly loadLastRepository: LoadLastEventRepository
  ) { }

  async perform({groupId}:{ groupId: string}): Promise<string> {
    const event = await this.loadLastRepository.loadLastEvent({groupId})
    return event === undefined ? 'done' : 'active'
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
  loadLastEvent(input: { groupId: string }): Promise<{ endDate: Date } | undefined>
}

class LoadLastEventRepositorySpy implements LoadLastEventRepository {
  groupId?: string
  callsCount = 0
  output?: { endDate: Date }

  async loadLastEvent({ groupId }:{ groupId: string }): Promise<{ endDate: Date } | undefined> {
    this.groupId = groupId
    this.callsCount++
    return this.output
  }
}

describe('CheckLastEventStatus', () => {
  const groupId = 'any_group_id'

  beforeAll(() => {
    set(new Date())
  })

  beforeAll(() => {
    reset()
  })

  test('should get last event data', async () => {
    const { sut, loadLastEventRepository } = makeSut()

    await sut.perform({ groupId })
    expect(loadLastEventRepository.groupId).toEqual(groupId)
    expect(loadLastEventRepository.callsCount).toEqual(1)
  })

  test('should return status done when group has no events', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = undefined

    const status = await sut.perform({ groupId })

    expect(status).toBe('done')
  })

  test('should return status active when now is before event end time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() + 1)
    }

    const status = await sut.perform({ groupId })

    expect(status).toBe('active')
  })

})
