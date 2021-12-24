class DeleteEvent {
  constructor(
    private readonly loadGroupRepository: LoadGroupRepository
  ) { }

  async perform({ id, userId }: { id: string, userId: string }): Promise<void> {
    const group = await this.loadGroupRepository.load({ eventId: id })
    if (group === undefined)
      throw new Error()
    if (group.users.find(user => user.id === userId) === undefined)
      throw new Error()
  }
}

type GroupUser = {
  id: string
  permission: string
}

type Group = {
  users: GroupUser[]
}

interface LoadGroupRepository {
  eventId?: string
  load(input: { eventId: string }): Promise<Group | undefined>
}

class LoadGroupRepositoryMock implements LoadGroupRepository {
  eventId?: string
  output?: Group = {
    users: [{ id: 'any_user_id', permission: 'any' }]
  }

  async load({ eventId }: { eventId: string }): Promise<Group | undefined> {
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

    await expect(promise).rejects.toThrowError()
  })

  it('should throw exception if eventId is invalid', async () => {
    const { sut, loadGroupRepository } = makeSut()
    loadGroupRepository.output = {
      users: [{ id: 'any_user_id', permission: 'any' }]
    }

    const promise = sut.perform({ id, userId: 'invalid-id' })

    await expect(promise).rejects.toThrowError()
  })
})
