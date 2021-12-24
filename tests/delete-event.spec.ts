class DeleteEvent {
  constructor(
    private readonly loadGroupRepository: LoadGroupRepository
  ) { }

  async perform({ id }: { id: string, userId: string }): Promise<void> {
    const group = await this.loadGroupRepository.load({ eventId: id })
    if (group === undefined) throw new Error()
  }
}

interface LoadGroupRepository {
  eventId?: string
  load(input: { eventId: string }): Promise<any>
}

class LoadGroupRepositoryMock implements LoadGroupRepository {
  eventId?: string
  output: any = 'any_value'

  async load({ eventId }: { eventId: string }): Promise<any> {
    this.eventId = eventId
    return this.output
  }
}

type SutTypes = {
  sut: DeleteEvent,
  loadGroupRepository: LoadGroupRepositoryMock
}

const makeSut = (): SutTypes => {
  const loadGroupRepository = new LoadGroupRepositoryMock()
  const sut = new DeleteEvent(loadGroupRepository)
  return { sut, loadGroupRepository }
}

describe('DeleteEvent', () => {
  const id = 'any_event_id'
  const userId = 'any_user_id'

  it('should get last event data', async () => {
    const { sut, loadGroupRepository } = makeSut()

    await sut.perform({ id, userId })

    expect(loadGroupRepository.eventId).toBe(id)
  })

  it('should throw exception if eventId is invalid', async () => {
    const { sut, loadGroupRepository } = makeSut()
    loadGroupRepository.output = undefined

    const promise = sut.perform({ id, userId })

    expect(promise).rejects.toThrowError()
  })
})
