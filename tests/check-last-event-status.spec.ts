class CheckLastEventStatus {
  constructor(
    private readonly loadLastRepository: LoadLastEventRepository
  ) { }

  async perform(groupId: string): Promise<void> {
    await this.loadLastRepository.loadLastEvent(groupId)
  }
}

interface LoadLastEventRepository  {
  loadLastEvent(groupId: string): Promise<void>
}

class LoadLastEventRepositoryMock implements LoadLastEventRepository {
  groupId?: string;

  async loadLastEvent(groupId: string): Promise<void> {
    this.groupId = groupId
  }
}

describe('CheckLastEventStatus', () => {
  test('should get last event data', async () => {
    const loadLastEventRepository = new LoadLastEventRepositoryMock();
    const checkLastEventStatus = new CheckLastEventStatus(loadLastEventRepository);

    await checkLastEventStatus.perform('any_group_id');
    expect(loadLastEventRepository.groupId).toEqual('any_group_id');
  });
});
