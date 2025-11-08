# DynamoDB Schema - Media Manager

## Tabela Principal: MediaItems

### Estrutura Base
```
TableName: media-items
BillingMode: PAY_PER_REQUEST
PointInTimeRecovery: Enabled
```

### Chaves Primárias
- **PK**: `USER#{userId}` - Partition Key
- **SK**: `MEDIA#{captureTimestamp}#{mediaId}` - Sort Key

### Atributos
```json
{
  "PK": "USER#123",
  "SK": "MEDIA#2024-01-15T10:30:00Z#abc123",
  "mediaId": "abc123",
  "userId": "123",
  "fileName": "IMG_1234.jpg",
  "fileType": "image/jpeg",
  "fileSize": 2456789,
  "originalPath": "s3://bucket/originals/123/abc123.jpg",
  "thumbnailPath": "s3://bucket/thumbnails/123/abc123_thumb.jpg",
  
  "captureDate": "2024-01-15T10:30:00Z",
  "uploadDate": "2024-01-15T12:00:00Z",
  "lastModified": "2024-01-15T12:00:00Z",
  
  "metadata": {
    "width": 4032,
    "height": 3024,
    "format": "JPEG",
    "colorSpace": "sRGB",
    "orientation": 1,
    "cameraMake": "Apple",
    "cameraModel": "iPhone 14 Pro",
    "iso": 64,
    "aperture": 1.78,
    "shutterSpeed": "1/120",
    "focalLength": 6.86,
    "flash": false,
    "gps": {
      "latitude": -23.5505,
      "longitude": -46.6333,
      "altitude": 760,
      "location": "São Paulo, SP, Brazil"
    }
  },
  
  "tags": ["férias", "praia", "família"],
  "keywords": ["sunset", "beach", "people"],
  "description": "Pôr do sol na praia",
  
  "aiFeatures": {
    "objects": ["person", "beach", "sunset", "water"],
    "faces": [
      {"faceId": "face123", "boundingBox": {...}}
    ],
    "scenes": ["outdoor", "nature", "beach"],
    "colors": ["blue", "orange", "yellow"],
    "text": [],
    "analyzed": true,
    "analyzedAt": "2024-01-15T12:05:00Z"
  },
  
  "destinations": [
    {
      "pluginId": "s3-standard",
      "status": "synced",
      "path": "s3://bucket/originals/123/abc123.jpg",
      "syncedAt": "2024-01-15T12:00:00Z"
    },
    {
      "pluginId": "google-drive",
      "status": "pending",
      "path": null,
      "error": null
    }
  ],
  
  "status": "active",
  "deleted": false,
  "deletedAt": null
}
```

## GSI 1: SearchByDate
- **GSI1PK**: `USER#{userId}`
- **GSI1SK**: `DATE#{captureDate}`
- Permite buscar mídias por data de captura

## GSI 2: SearchByLocation
- **GSI2PK**: `USER#{userId}#LOCATION#{geohash}`
- **GSI2SK**: `MEDIA#{captureTimestamp}#{mediaId}`
- Permite buscar mídias por proximidade geográfica

## GSI 3: SearchByTag
- **GSI3PK**: `USER#{userId}#TAG#{tag}`
- **GSI3SK**: `MEDIA#{captureTimestamp}#{mediaId}`
- Permite buscar mídias por tag específica

## GSI 4: SearchByStatus
- **GSI4PK**: `USER#{userId}#STATUS#{status}`
- **GSI4SK**: `DATE#{captureDate}`
- Permite buscar mídias pendentes de sincronização

## Tabela: ImportJobs

Registra jobs de importação de dispositivos

```json
{
  "PK": "USER#{userId}",
  "SK": "IMPORT#{timestamp}#{jobId}",
  "jobId": "job123",
  "userId": "123",
  "status": "processing",
  "deviceName": "SD Card 64GB",
  "devicePath": "/mnt/sdcard",
  "totalFiles": 150,
  "processedFiles": 45,
  "successfulImports": 40,
  "failedImports": 5,
  "duplicates": 3,
  "startedAt": "2024-01-15T12:00:00Z",
  "completedAt": null,
  "errors": []
}
```

## Tabela: PluginConfigs

Armazena configurações de plugins por usuário

```json
{
  "PK": "USER#{userId}",
  "SK": "PLUGIN#{pluginId}",
  "pluginId": "google-drive",
  "enabled": true,
  "config": {
    "folderId": "abc123xyz",
    "refreshToken": "encrypted_token",
    "autoSync": true,
    "compression": false
  },
  "createdAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

## Padrões de Acesso

1. **Listar mídias de um usuário (paginado)**
   - Query: PK = USER#{userId}, SK begins_with MEDIA#

2. **Buscar mídia específica**
   - GetItem: PK = USER#{userId}, SK = MEDIA#{timestamp}#{mediaId}

3. **Buscar por período**
   - Query GSI1: GSI1PK = USER#{userId}, GSI1SK between DATE#{start} and DATE#{end}

4. **Buscar por localização**
   - Query GSI2: GSI2PK = USER#{userId}#LOCATION#{geohash}

5. **Buscar por tag**
   - Query GSI3: GSI3PK = USER#{userId}#TAG#{tag}

6. **Buscar mídias pendentes de sincronização**
   - Query GSI4: GSI4PK = USER#{userId}#STATUS#{pending}

## Estimativa de Custos

Com 10.000 mídias e 1M de consultas/mês:
- Armazenamento: ~$2.50/mês
- Leituras: ~$0.25/mês
- Escritas: ~$1.25/mês
- **Total estimado: ~$4/mês**
