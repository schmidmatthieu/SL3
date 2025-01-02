import { validate } from 'class-validator';
import { CreateEventDto } from '../../dto/create-event.dto';
import { EventStatus } from '../../schemas/event.schema';

describe('CreateEventDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new CreateEventDto();
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

  it('should validate required fields', async () => {
    const dto = new CreateEventDto();
    // Ne pas définir les champs requis

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(err => err.property === 'title')).toBe(true);
    expect(errors.some(err => err.property === 'description')).toBe(true);
    expect(errors.some(err => err.property === 'startDateTime')).toBe(true);
    expect(errors.some(err => err.property === 'endDateTime')).toBe(true);
    // Ne pas vérifier status car il a une valeur par défaut
  });

  it('should validate title length', async () => {
    const dto = new CreateEventDto();
    dto.title = 'a'; // Too short
    dto.description = 'Test Description';
    dto.startDateTime = '2025-01-02T13:00:00Z';
    dto.endDateTime = '2025-01-02T15:00:00Z';

    const errors = await validate(dto);
    expect(errors.some(err => err.property === 'title')).toBe(true);
  });

  it('should validate date format', async () => {
    const dto = new CreateEventDto();
    dto.title = 'Test Event';
    dto.description = 'Test Description';
    dto.startDateTime = 'invalid-date';
    dto.endDateTime = 'invalid-date';

    const errors = await validate(dto);
    expect(errors.some(err => err.property === 'startDateTime')).toBe(true);
    expect(errors.some(err => err.property === 'endDateTime')).toBe(true);
  });

  it('should validate status enum', async () => {
    const dto = new CreateEventDto();
    dto.title = 'Test Event';
    dto.description = 'Test Description';
    dto.startDateTime = '2025-01-02T13:00:00Z';
    dto.endDateTime = '2025-01-02T15:00:00Z';
    dto.status = 'INVALID_STATUS' as EventStatus;

    const errors = await validate(dto);
    expect(errors.some(err => err.property === 'status')).toBe(true);
  });

  it('should validate optional imageUrl format', async () => {
    const dto = new CreateEventDto();
    dto.title = 'Test Event';
    dto.description = 'Test Description';
    dto.startDateTime = '2025-01-02T13:00:00Z';
    dto.endDateTime = '2025-01-02T15:00:00Z';
    dto.imageUrl = 'invalid-url';

    const errors = await validate(dto);
    expect(errors.some(err => err.property === 'imageUrl')).toBe(true);
  });
});
