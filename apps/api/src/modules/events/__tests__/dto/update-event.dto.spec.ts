import { validate } from 'class-validator';
import { UpdateEventDto } from '../../dto/update-event.dto';
import { EventStatus } from '../../schemas/event.schema';

describe('UpdateEventDto', () => {
  it('should validate a valid DTO with all fields', async () => {
    const dto = new UpdateEventDto();
    dto.title = 'Test Event';
    dto.description = 'Test Description';
    dto.startDateTime = '2025-01-02T13:00:00Z';
    dto.endDateTime = '2025-01-02T15:00:00Z';
    dto.status = EventStatus.SCHEDULED;
    dto.featured = false;
    dto.imageUrl = 'https://example.com/image.jpg';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a valid DTO with partial fields', async () => {
    const dto = new UpdateEventDto();
    dto.title = 'Test Event';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate title length when provided', async () => {
    const dto = new UpdateEventDto();
    dto.title = 'a'; // Too short

    const errors = await validate(dto);
    expect(errors.some(err => err.property === 'title')).toBe(true);
  });

  it('should validate date format when provided', async () => {
    const dto = new UpdateEventDto();
    dto.startDateTime = 'invalid-date';
    dto.endDateTime = 'invalid-date';

    const errors = await validate(dto);
    expect(errors.some(err => err.property === 'startDateTime')).toBe(true);
    expect(errors.some(err => err.property === 'endDateTime')).toBe(true);
  });

  it('should validate status enum when provided', async () => {
    const dto = new UpdateEventDto();
    dto.status = 'INVALID_STATUS' as EventStatus;

    const errors = await validate(dto);
    expect(errors.some(err => err.property === 'status')).toBe(true);
  });

  it('should validate imageUrl format when provided', async () => {
    const dto = new UpdateEventDto();
    dto.imageUrl = 'invalid-url';

    const errors = await validate(dto);
    expect(errors.some(err => err.property === 'imageUrl')).toBe(true);
  });

  it('should validate featured as boolean when provided', async () => {
    const dto = new UpdateEventDto();
    dto.featured = 'not-a-boolean' as any;

    const errors = await validate(dto);
    expect(errors.some(err => err.property === 'featured')).toBe(true);
  });
});
