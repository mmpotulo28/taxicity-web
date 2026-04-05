import {
  BadRequestException,
  Controller,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { put } from '@vercel/blob';
import type { Request } from 'express';
import { ApiAuthGuard } from '../driver/common/api-auth.guard';

@Controller('api/upload')
@UseGuards(ApiAuthGuard)
export class UploadController {
  private static readonly DEFAULT_MAX_FILE_BYTES = 10 * 1024 * 1024;
  private static readonly SAFE_FILENAME = /^[a-zA-Z0-9._-]+$/;
  private static readonly ALLOWED_CONTENT_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
  ]);

  private resolveMaxFileBytes(): number {
    const raw = process.env.UPLOAD_MAX_FILE_BYTES;
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
    return UploadController.DEFAULT_MAX_FILE_BYTES;
  }

  private validateFilename(filename: string) {
    if (filename.length > 120) {
      throw new BadRequestException('Filename is too long');
    }

    if (!UploadController.SAFE_FILENAME.test(filename)) {
      throw new BadRequestException('Filename contains unsupported characters');
    }
  }

  private validateContentType(req: Request) {
    const rawContentType = req.headers['content-type'];
    const contentType = Array.isArray(rawContentType)
      ? rawContentType[0]
      : rawContentType;

    const normalized = contentType?.split(';')[0]?.trim().toLowerCase();
    if (!normalized) {
      throw new BadRequestException('Content-Type is required');
    }

    if (!UploadController.ALLOWED_CONTENT_TYPES.has(normalized)) {
      throw new BadRequestException('Unsupported file type');
    }
  }

  @Post()
  async uploadFile(@Req() req: Request, @Query('filename') filename?: string) {
    if (!filename) {
      throw new BadRequestException('Filename is required');
    }

    this.validateFilename(filename);
    this.validateContentType(req);

    const maxBytes = this.resolveMaxFileBytes();

    const chunks: Buffer[] = [];
    let bytesRead = 0;
    for await (const chunk of req) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      bytesRead += buffer.byteLength;

      if (bytesRead > maxBytes) {
        throw new BadRequestException('File is too large');
      }

      chunks.push(buffer);
    }

    const body = Buffer.concat(chunks);
    if (body.length === 0) {
      throw new BadRequestException('Request body is required');
    }

    const blob = await put(filename, body, {
      access: 'public',
      addRandomSuffix: true,
    });

    return blob;
  }
}
