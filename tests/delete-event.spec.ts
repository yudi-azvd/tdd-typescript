class DeleteEvent {
  constructor(
    private readonly loadGroupRepository: LoadGroupRepository,
    private readonly deleteEventRepository: DeleteEventRepository,
    private readonly deleteMatchRepository: DeleteMatchRepository,
  ) { }

  async perform({ id, userId }: { id: string, userId: string }): Promise<void> {
    const group = await this.loadGroupRepository.load({ eventId: id })
    if (group === undefined)
      throw new Error()
    if (group.users.find(user => user.id === userId) === undefined)
      throw new Error()
    if (group.users.find(user => user.id === userId)?.permission === 'user')
      throw new Error()

    await this.deleteEventRepository.delete({ id })
    await this.deleteMatchRepository.delete({ eventId: id })
  }
}

type GroupUser = {
  id: string
  permission: 'owner' | 'admin' | 'user'
}

type Group = {
  users: GroupUser[]
}

interface LoadGroupRepository {
  eventId?: string
  load(input: { eventId: string }): Promise<Group | undefined>
}

interface DeleteEventRepository {
  delete(input: { id: string }): Promise<void>
}

interface DeleteMatchRepository {
  delete(input: { eventId: string }): Promise<void>
}

class DeleteEventRepositorySpy implements DeleteEventRepository {
  id?: string

  async delete({ id }: { id: string }): Promise<void> {
    this.id = id
  }
}

class DeleteMatchRepositorySpy implements DeleteMatchRepository {
  eventId?: string

  async delete({ eventId }: { eventId: string }): Promise<void> {
    this.eventId = eventId
  }
}

class LoadGroupRepositorySpy implements LoadGroupRepository {
  eventId?: string
  output?: Group = {
    users: [{ id: 'any_user_id', permission: 'admin' }]
  }

  async load({ eventId }: { eventId: string }): Promise<Group | undefined> {
    this.eventId = eventId
    return this.output
  }
}

type SutTypes = {
  sut: DeleteEvent,
  loadGroupRepository: LoadGroupRepositorySpy,
  deleteEventRepository: DeleteEventRepositorySpy,
  deleteMatchRepository: DeleteMatchRepositorySpy,
}

const makeSut = (): SutTypes => {
  const loadGroupRepository = new LoadGroupRepositorySpy()
  const deleteEventRepository = new DeleteEventRepositorySpy()
  const deleteMatchRepository = new DeleteMatchRepositorySpy()
  const sut = new DeleteEvent(loadGroupRepository, deleteEventRepository, deleteMatchRepository)
  return {
    sut,
    loadGroupRepository,
    deleteEventRepository,
    deleteMatchRepository
  }
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
      users: [{ id: 'any_user_id', permission: 'admin' }]
    }

    const promise = sut.perform({ id, userId: 'invalid-id' })

    await expect(promise).rejects.toThrowError()
  })

  it('should throw exception if permission is user', async () => {
    const { sut, loadGroupRepository } = makeSut()
    loadGroupRepository.output = {
      users: [{ id: 'any_user_id', permission: 'user' }]
    }

    const promise = sut.perform({ id, userId })

    await expect(promise).rejects.toThrowError()
  })

  it('should not throw if permission is admin', async () => {
    const { sut, loadGroupRepository } = makeSut()
    loadGroupRepository.output = {
      users: [{ id: 'any_user_id', permission: 'admin' }]
    }

    const promise = sut.perform({ id, userId })

    await expect(promise).resolves.not.toThrowError()
  })

  it('should not throw if permission is owner', async () => {
    const { sut, loadGroupRepository } = makeSut()
    loadGroupRepository.output = {
      users: [{ id: 'any_user_id', permission: 'owner' }]
    }

    const promise = sut.perform({ id, userId })

    await expect(promise).resolves.not.toThrowError()
  })

  it('should delete event', async () => {
    const { sut, deleteEventRepository } = makeSut()

    await sut.perform({ id, userId })

    expect(deleteEventRepository.id).toBe(id)
  })

  it('should delete matches', async () => {
    const { sut, deleteMatchRepository } = makeSut()

    await sut.perform({ id, userId })

    expect(deleteMatchRepository.eventId).toBe(id)
  })

})
