/**
 * Lambda: List Media
 * 
 * Lista mídias de um usuário com paginação e filtros
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const MEDIA_TABLE = process.env.MEDIA_TABLE_NAME || 'media-items';

interface QueryParams {
  limit?: string;
  lastKey?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string;
  searchText?: string;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Extrai userId do path
    const userId = event.pathParameters?.userId;
    if (!userId) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'userId é obrigatório' })
      };
    }

    // Valida autorização
    const authorizedUserId = event.requestContext.authorizer?.claims?.sub;
    if (authorizedUserId !== userId) {
      return {
        statusCode: 403,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Não autorizado' })
      };
    }

    // Parse query parameters
    const params = event.queryStringParameters as QueryParams || {};
    const limit = parseInt(params.limit || '50');
    const lastKey = params.lastKey ? JSON.parse(params.lastKey) : undefined;

    // Se houver filtro de data, usa GSI1
    if (params.dateFrom || params.dateTo) {
      return await queryByDateRange(userId, params, limit, lastKey);
    }

    // Se houver filtro de tags, usa GSI3
    if (params.tags) {
      return await queryByTags(userId, params.tags, limit, lastKey);
    }

    // Query padrão na tabela principal
    const command = new QueryCommand({
      TableName: MEDIA_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'MEDIA#'
      },
      ScanIndexForward: false, // Ordena por data decrescente
      Limit: limit,
      ExclusiveStartKey: lastKey
    });

    const result = await docClient.send(command);

    // Filtra items deletados
    const items = (result.Items || [])
      .filter(item => !item.deleted)
      .map(item => formatMediaItem(item));

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        items,
        lastKey: result.LastEvaluatedKey,
        count: items.length
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({
        error: 'Erro interno ao buscar mídias',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

/**
 * Query por range de datas usando GSI1
 */
async function queryByDateRange(
  userId: string,
  params: QueryParams,
  limit: number,
  lastKey?: any
): Promise<APIGatewayProxyResult> {
  const dateFrom = params.dateFrom || '1900-01-01';
  const dateTo = params.dateTo || '2100-12-31';

  const command = new QueryCommand({
    TableName: MEDIA_TABLE,
    IndexName: 'GSI1-SearchByDate',
    KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK BETWEEN :dateFrom AND :dateTo',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':dateFrom': `DATE#${dateFrom}`,
      ':dateTo': `DATE#${dateTo}`
    },
    ScanIndexForward: false,
    Limit: limit,
    ExclusiveStartKey: lastKey
  });

  const result = await docClient.send(command);

  const items = (result.Items || [])
    .filter(item => !item.deleted)
    .map(item => formatMediaItem(item));

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      items,
      lastKey: result.LastEvaluatedKey,
      count: items.length
    })
  };
}

/**
 * Query por tags usando GSI3
 */
async function queryByTags(
  userId: string,
  tags: string,
  limit: number,
  lastKey?: any
): Promise<APIGatewayProxyResult> {
  // Para múltiplas tags, fazer query para cada uma e fazer união
  const tagList = tags.split(',');
  const allItems = new Set<any>();

  for (const tag of tagList) {
    const command = new QueryCommand({
      TableName: MEDIA_TABLE,
      IndexName: 'GSI3-SearchByTag',
      KeyConditionExpression: 'GSI3PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}#TAG#${tag.trim()}`
      },
      ScanIndexForward: false,
      Limit: limit
    });

    const result = await docClient.send(command);
    (result.Items || []).forEach(item => allItems.add(item));
  }

  const items = Array.from(allItems)
    .filter((item: any) => !item.deleted)
    .map(item => formatMediaItem(item))
    .slice(0, limit);

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      items,
      count: items.length
    })
  };
}

/**
 * Formata item do DynamoDB para resposta
 */
function formatMediaItem(item: any) {
  return {
    mediaId: item.mediaId,
    userId: item.userId,
    fileName: item.fileName,
    fileType: item.fileType,
    fileSize: item.fileSize,
    originalPath: item.originalPath,
    thumbnailPath: item.thumbnailPath,
    captureDate: item.captureDate,
    uploadDate: item.uploadDate,
    lastModified: item.lastModified,
    metadata: item.metadata,
    tags: item.tags,
    keywords: item.keywords,
    description: item.description,
    aiFeatures: item.aiFeatures,
    destinations: item.destinations,
    status: item.status
  };
}

/**
 * CORS headers
 */
function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}
