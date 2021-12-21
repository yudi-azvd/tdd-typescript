import { set, reset } from 'mockdate'

class EventStatus {
  status: 'active' | 'inReview' | 'done'

  constructor(event?: { endDate: Date, reviewDurationInHours: number }) {
    if (event === undefined) {
      this.status = 'done'
      return
    }

    const now = new Date()
    if (event.endDate >= now) {
      this.status = 'active'
      return
    }

    const reviewDurationInMilliseconds = event.reviewDurationInHours * 60 * 60 * 1000
    const reviewDate = new Date(event.endDate.getTime() + reviewDurationInMilliseconds)
    this.status = reviewDate >= now ? 'inReview'  :  'done'
  }
}

class CheckLastEventStatus {
  constructor(
    private readonly loadLastRepository: LoadLastEventRepository
  ) { }

  async perform({groupId}:{ groupId: string}): Promise<EventStatus> {
    const event = await this.loadLastRepository.loadLastEvent({groupId})
    return new EventStatus(event)
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
  loadLastEvent(input: { groupId: string }): Promise<{ endDate: Date, reviewDurationInHours: number } | undefined>
}

class LoadLastEventRepositorySpy implements LoadLastEventRepository {
  groupId?: string
  callsCount = 0
  output?: { endDate: Date, reviewDurationInHours: number }

  setEndDdateAfterNow(): void {
    this.output = {
      endDate: new Date(new Date().getTime() + 1),
      reviewDurationInHours: 1
    }
  }

  setEndDdateBeforeNow(): void {
    this.output = {
      endDate: new Date(new Date().getTime() - 1),
      reviewDurationInHours: 1
    }
  }

  setEndDdateEqualToNow(): void {
    this.output = {
      endDate: new Date(),
      reviewDurationInHours: 1
    }
  }

  setReviewDate(): void {
    this.output = {
      endDate: new Date(),
      reviewDurationInHours: 1
    }
  }

  async loadLastEvent({ groupId }:{ groupId: string }): Promise<{ endDate: Date, reviewDurationInHours: number } | undefined> {
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

  it('should get last event data', async () => {
    const { sut, loadLastEventRepository } = makeSut()

    await sut.perform({ groupId })
    expect(loadLastEventRepository.groupId).toEqual(groupId)
    expect(loadLastEventRepository.callsCount).toEqual(1)
  })

  it('should return status done when group has no events', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = undefined

    const eventStatus = await sut.perform({ groupId })

    expect(eventStatus.status).toBe('done')
  })

  it('should return status active when now is before event end time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.setEndDdateAfterNow()

    const eventStatus = await sut.perform({ groupId })

    expect(eventStatus.status).toBe('active')
  })

  it('should return status active when now is equal to event end time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.setEndDdateEqualToNow()

    const eventStatus = await sut.perform({ groupId })

    expect(eventStatus.status).toBe('active')
  })

  it('should return status inReview when now is after event end time', async () => {
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.setEndDdateBeforeNow()

    const eventStatus = await sut.perform({ groupId })

    expect(eventStatus.status).toBe('inReview')
  })

  it('should return status inReview when now is before review time', async () => {
    const reviewDurationInHours = 1
    const reviewDurationInMilliseconds = reviewDurationInHours * 60 * 60 * 1000
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() - reviewDurationInMilliseconds + 1),
      reviewDurationInHours
    }

    const eventStatus = await sut.perform({ groupId })

    expect(eventStatus.status).toBe('inReview')
  })

  it('should return status inReview when now is equal to review time', async () => {
    const reviewDurationInHours = 1
    const reviewDurationInMilliseconds = reviewDurationInHours * 60 * 60 * 1000
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() - reviewDurationInMilliseconds),
      reviewDurationInHours
    }

    const eventStatus = await sut.perform({ groupId })

    expect(eventStatus.status).toBe('inReview')
  })

  it('should return status done when now is after review time', async () => {
    const reviewDurationInHours = 1
    const reviewDurationInMilliseconds = reviewDurationInHours * 60 * 60 * 1000
    const { sut, loadLastEventRepository } = makeSut()
    loadLastEventRepository.output = {
      endDate: new Date(new Date().getTime() - reviewDurationInMilliseconds - 1),
      reviewDurationInHours
    }

    const eventStatus = await sut.perform({ groupId })

    expect(eventStatus.status).toBe('done')
  })
})
