import UUID from '../../src/pg-uuid';

describe('UUID', () => {
  let staticMethods = ['fromString', 'fromBytes', 'randomUUID'];

  staticMethods.forEach((exp) => {
    it('should expose static method ' + exp, () => {
      expect(UUID[exp]).toBeDefined();
    });
  });

  it('should return UUID from string', () => {
    let expected = '4368f6c3-d19c-40ed-8fe4-ad4a4a7d6a25',
        uuid = UUID.fromString('4368f6c3-d19c-40ed-8fe4-ad4a4a7d6a25');
    expect(uuid).toBeDefined();
    expect(uuid.toString()).toEqual(expected);
  });

  it('should to/from bytes', () => {
    let expected = UUID.fromString('4368f6c3-d19c-40ed-8fe4-ad4a4a7d6a25'),
        actual = UUID.fromBytes(expected.toBytes());
    expect(actual.equals(expected)).toBeTruthy();
  });

  it('should generate a random UUID', () => {
    let uuid = UUID.randomUUID();
    expect(uuid).toBeDefined();
  });
});
