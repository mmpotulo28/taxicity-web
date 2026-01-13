import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateTripSchema = z.object({
  routeId: z.string(),
  taxiId: z.string().optional(),
  rankId: z.string(),
  pickupAddress: z.string(),
  pickupLat: z.number(),
  pickupLng: z.number(),
  dropoffAddress: z.string(),
  dropoffLat: z.number(),
  dropoffLng: z.number(),
  fare: z.number().positive(),
  paymentMethod: z.enum(['CASH', 'QR_CODE', 'MOBILE_MONEY']).default('CASH'),
});

export class CreateTripDto extends createZodDto(CreateTripSchema) {}
