import EventStatus from './EventStatus'
import LoadLastEventRepository from './LoadLastEventRepository'

export default class CheckLastEventStatus {
  constructor(
    private readonly loadLastRepository: LoadLastEventRepository
  ) { }

  async perform({groupId}:{ groupId: string}): Promise<EventStatus> {
    const event = await this.loadLastRepository.loadLastEvent({groupId})

    return new EventStatus(event)
  }
}
