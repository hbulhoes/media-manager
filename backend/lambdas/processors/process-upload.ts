/**
 * Lambda: Process Media Upload
 * 
 * Processa uploads de mídia:
 * - Extrai metadados EXIF
 * - Gera thumbnails
 * - Salva no DynamoDB
 * - Dispara eventos para plugins
 */

import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import sharp from 'sharp';
import exifParser from 'exif-parser';
import { v4 as uuidv4 } from 'uuid';
import type { S3Event } from 'aws-lambda';

const s3Client = new S3Client({});
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const eventBridgeClient = new EventBridgeClient({});

const MEDIA_TABLE = process.env.MEDIA_TABLE_NAME || 'media-items';
const THUMBNAIL_BUCKET = process.env.THUMBNAIL_BUCKET_NAME;
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME;

const THUMBNAIL_SIZES = {
  small: { width: 200, height: 200 },
  medium: { width: 400, height: 400 },
  large: { width: 800, height: 800 }
};

export const handler = async (event: S3Event) => {
  console.log('Processing S3 Event:', JSON.stringify(event, null, 2));

  try {
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
      
      console.log(`Processing: s3://${bucket}/${key}`);
      
      // Extrai informações do path
      // Formato esperado: uploads/{userId}/{mediaId}.{ext}
      const pathParts = key.split('/');
      const userId = pathParts[1];
      const fileNameWithExt = pathParts[pathParts.length - 1];
      const mediaId = fileNameWithExt.split('.')[0];

      // Download do arquivo
      const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
      const s3Object = await s3Client.send(getObjectCommand);
      
      if (!s3Object.Body) {
        throw new Error('Empty S3 object body');
      }

      const fileBuffer = await streamToBuffer(s3Object.Body);
      const fileType = s3Object.ContentType || 'application/octet-stream';
      const fileSize = s3Object.ContentLength || fileBuffer.length;

      // Processa baseado no tipo
      let metadata: any = {};
      let thumbnailPath = '';

      if (fileType.startsWith('image/')) {
        const result = await processImage(fileBuffer, userId, mediaId, fileType);
        metadata = result.metadata;
        thumbnailPath = result.thumbnailPath;
      } else if (fileType.startsWith('video/')) {
        const result = await processVideo(fileBuffer, userId, mediaId, fileType);
        metadata = result.metadata;
        thumbnailPath = result.thumbnailPath;
      }

      // Salva no DynamoDB
      const captureDate = metadata.captureDate || new Date().toISOString();
      
      const mediaItem = {
        PK: `USER#${userId}`,
        SK: `MEDIA#${captureDate}#${mediaId}`,
        GSI1PK: `USER#${userId}`,
        GSI1SK: `DATE#${captureDate}`,
        mediaId,
        userId,
        fileName: fileNameWithExt,
        fileType,
        fileSize,
        originalPath: `s3://${bucket}/${key}`,
        thumbnailPath,
        captureDate,
        uploadDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        metadata,
        tags: [],
        keywords: [],
        destinations: [],
        status: 'active',
        deleted: false
      };

      // Adiciona GSIs para localização e tags se disponíveis
      if (metadata.gps) {
        const geohash = generateGeohash(metadata.gps.latitude, metadata.gps.longitude, 6);
        mediaItem['GSI2PK'] = `USER#${userId}#LOCATION#${geohash}`;
        mediaItem['GSI2SK'] = `MEDIA#${captureDate}#${mediaId}`;
      }

      const putCommand = new PutCommand({
        TableName: MEDIA_TABLE,
        Item: mediaItem
      });

      await docClient.send(putCommand);

      console.log(`Saved to DynamoDB: ${mediaId}`);

      // Emite evento para processar plugins
      await emitMediaUploadedEvent(userId, mediaId, mediaItem);

      // Emite evento para análise de IA (opcional)
      await emitAIAnalysisEvent(userId, mediaId, mediaItem);
    }

    return { statusCode: 200, body: 'Processing completed' };

  } catch (error) {
    console.error('Error processing upload:', error);
    throw error;
  }
};

/**
 * Processa imagem: extrai EXIF e gera thumbnails
 */
async function processImage(
  buffer: Buffer,
  userId: string,
  mediaId: string,
  fileType: string
) {
  const image = sharp(buffer);
  const imageMetadata = await image.metadata();

  // Extrai EXIF
  let exifData: any = {};
  let gpsData: any = undefined;
  
  try {
    if (buffer.length > 65635) { // EXIF parser requer tamanho mínimo
      const parser = exifParser.create(buffer);
      const exifResult = parser.parse();
      exifData = exifResult.tags;
      
      if (exifResult.tags.GPSLatitude && exifResult.tags.GPSLongitude) {
        gpsData = {
          latitude: exifResult.tags.GPSLatitude,
          longitude: exifResult.tags.GPSLongitude,
          altitude: exifResult.tags.GPSAltitude
        };
      }
    }
  } catch (error) {
    console.warn('Could not extract EXIF:', error);
  }

  // Gera thumbnail
  const thumbnailBuffer = await image
    .resize(THUMBNAIL_SIZES.medium.width, THUMBNAIL_SIZES.medium.height, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Upload thumbnail para S3
  const thumbnailKey = `thumbnails/${userId}/${mediaId}_thumb.jpg`;
  await s3Client.send(new PutObjectCommand({
    Bucket: THUMBNAIL_BUCKET,
    Key: thumbnailKey,
    Body: thumbnailBuffer,
    ContentType: 'image/jpeg'
  }));

  const thumbnailPath = `s3://${THUMBNAIL_BUCKET}/${thumbnailKey}`;

  const metadata = {
    width: imageMetadata.width,
    height: imageMetadata.height,
    format: imageMetadata.format,
    colorSpace: imageMetadata.space,
    orientation: imageMetadata.orientation,
    captureDate: exifData.CreateDate 
      ? new Date(exifData.CreateDate * 1000).toISOString()
      : new Date().toISOString(),
    cameraMake: exifData.Make,
    cameraModel: exifData.Model,
    iso: exifData.ISO,
    aperture: exifData.FNumber,
    shutterSpeed: exifData.ExposureTime ? `1/${Math.round(1/exifData.ExposureTime)}` : undefined,
    focalLength: exifData.FocalLength,
    flash: exifData.Flash === 1,
    gps: gpsData
  };

  return { metadata, thumbnailPath };
}

/**
 * Processa vídeo: extrai metadados e gera thumbnail do primeiro frame
 */
async function processVideo(
  buffer: Buffer,
  userId: string,
  mediaId: string,
  fileType: string
) {
  // Para vídeos, seria necessário usar ffmpeg
  // Aqui está um placeholder simplificado
  
  // TODO: Implementar extração de metadados de vídeo com ffmpeg
  // - Duração
  // - Resolução
  // - Codec
  // - Bitrate
  // - Gerar thumbnail do primeiro frame

  const metadata = {
    width: 1920,
    height: 1080,
    format: fileType.split('/')[1],
    duration: 0, // segundos
    captureDate: new Date().toISOString()
  };

  const thumbnailPath = `s3://${THUMBNAIL_BUCKET}/thumbnails/${userId}/${mediaId}_thumb.jpg`;

  return { metadata, thumbnailPath };
}

/**
 * Emite evento de upload concluído para processamento de plugins
 */
async function emitMediaUploadedEvent(userId: string, mediaId: string, mediaItem: any) {
  if (!EVENT_BUS_NAME) return;

  await eventBridgeClient.send(new PutEventsCommand({
    Entries: [{
      Source: 'media-manager.upload',
      DetailType: 'MediaUploaded',
      Detail: JSON.stringify({
        userId,
        mediaId,
        mediaItem
      }),
      EventBusName: EVENT_BUS_NAME
    }]
  }));
}

/**
 * Emite evento para análise de IA
 */
async function emitAIAnalysisEvent(userId: string, mediaId: string, mediaItem: any) {
  if (!EVENT_BUS_NAME) return;

  await eventBridgeClient.send(new PutEventsCommand({
    Entries: [{
      Source: 'media-manager.ai',
      DetailType: 'MediaReadyForAnalysis',
      Detail: JSON.stringify({
        userId,
        mediaId,
        fileType: mediaItem.fileType,
        originalPath: mediaItem.originalPath
      }),
      EventBusName: EVENT_BUS_NAME
    }]
  }));
}

/**
 * Converte stream para buffer
 */
async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Gera geohash para localização
 * Implementação simplificada - usar biblioteca geohash completa em produção
 */
function generateGeohash(lat: number, lon: number, precision: number): string {
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let hash = '';
  let bits = 0;
  let bitsTotal = 0;
  let latRange = [-90, 90];
  let lonRange = [-180, 180];

  while (hash.length < precision) {
    if (bitsTotal % 2 === 0) {
      const mid = (lonRange[0] + lonRange[1]) / 2;
      if (lon > mid) {
        bits |= (1 << (4 - (bitsTotal % 5)));
        lonRange[0] = mid;
      } else {
        lonRange[1] = mid;
      }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (lat > mid) {
        bits |= (1 << (4 - (bitsTotal % 5)));
        latRange[0] = mid;
      } else {
        latRange[1] = mid;
      }
    }

    bitsTotal++;

    if (bitsTotal % 5 === 0) {
      hash += base32[bits];
      bits = 0;
    }
  }

  return hash;
}
