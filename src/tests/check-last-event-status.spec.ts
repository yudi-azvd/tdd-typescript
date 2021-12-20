class CheckLastEventStatus {
  async perform(groupId: string): Promise<void> {

  }
}

class LoadLastEventRepository {
  groupId?: string
}

describe('CheckLastEventStatus', () => {
  test('should get last event data', async () => {

    const loadLastEventRepository = new LoadLastEventRepository()
    const checkLastEventStatus = new CheckLastEventStatus()

    await checkLastEventStatus.perform('any-group-id')
    expect(loadLastEventRepository.groupId).toEqual('any-group-id')
  })
})
