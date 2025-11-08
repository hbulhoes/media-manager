/**
 * AWS CDK Stack - Media Manager Infrastructure
 * 
 * Define toda a infraestrutura serverless na AWS
 */

import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';

export class MediaManagerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ============================================
    // DynamoDB Tables
    // ============================================

    // Tabela principal de mídias
    const mediaTable = new dynamodb.Table(this, 'MediaTable', {
      tableName: 'media-items',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES
    });

    // GSI1: SearchByDate
    mediaTable.addGlobalSecondaryIndex({
      indexName: 'GSI1-SearchByDate',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // GSI2: SearchByLocation
    mediaTable.addGlobalSecondaryIndex({
      indexName: 'GSI2-SearchByLocation',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // GSI3: SearchByTag
    mediaTable.addGlobalSecondaryIndex({
      indexName: 'GSI3-SearchByTag',
      partitionKey: { name: 'GSI3PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI3SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // Tabela de configurações de plugins
    const pluginConfigTable = new dynamodb.Table(this, 'PluginConfigTable', {
      tableName: 'plugin-configs',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // Tabela de jobs de importação
    const importJobsTable = new dynamodb.Table(this, 'ImportJobsTable', {
      tableName: 'import-jobs',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // ============================================
    // S3 Buckets
    // ============================================

    // Bucket para uploads originais
    const uploadsBucket = new s3.Bucket(this, 'UploadsBucket', {
      bucketName: `media-manager-uploads-${this.account}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins: ['*'],
          allowedHeaders: ['*']
        }
      ],
      lifecycleRules: [
        {
          id: 'DeleteIncompleteUploads',
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7)
        }
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // Bucket para thumbnails
    const thumbnailsBucket = new s3.Bucket(this, 'ThumbnailsBucket', {
      bucketName: `media-manager-thumbnails-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // ============================================
    // Cognito
    // ============================================

    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'media-manager-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true
      },
      autoVerify: {
        email: true
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      authFlows: {
        userPassword: true,
        userSrp: true
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE]
      }
    });

    // ============================================
    // EventBridge
    // ============================================

    const eventBus = new events.EventBus(this, 'MediaEventBus', {
      eventBusName: 'media-manager-events'
    });

    // ============================================
    // Lambda Functions
    // ============================================

    // Layer compartilhado com dependências
    const sharedLayer = new lambda.LayerVersion(this, 'SharedLayer', {
      code: lambda.Code.fromAsset('lambdas/layers/shared'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Shared dependencies for Lambda functions'
    });

    // Lambda: List Media
    const listMediaFn = new lambdaNodejs.NodejsFunction(this, 'ListMediaFn', {
      entry: 'lambdas/api/list-media.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        MEDIA_TABLE_NAME: mediaTable.tableName
      },
      layers: [sharedLayer]
    });

    mediaTable.grantReadData(listMediaFn);

    // Lambda: Process Upload
    const processUploadFn = new lambdaNodejs.NodejsFunction(this, 'ProcessUploadFn', {
      entry: 'lambdas/processors/process-upload.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.minutes(5),
      memorySize: 2048,
      environment: {
        MEDIA_TABLE_NAME: mediaTable.tableName,
        THUMBNAIL_BUCKET_NAME: thumbnailsBucket.bucketName,
        EVENT_BUS_NAME: eventBus.eventBusName
      },
      layers: [sharedLayer],
      bundling: {
        nodeModules: ['sharp', 'exif-parser'],
        forceDockerBundling: true
      }
    });

    uploadsBucket.grantRead(processUploadFn);
    thumbnailsBucket.grantPut(processUploadFn);
    mediaTable.grantWriteData(processUploadFn);
    eventBus.grantPutEventsTo(processUploadFn);

    // Trigger no S3 para processar uploads
    uploadsBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(processUploadFn),
      { prefix: 'uploads/' }
    );

    // Lambda: Get Upload URL
    const getUploadUrlFn = new lambdaNodejs.NodejsFunction(this, 'GetUploadUrlFn', {
      entry: 'lambdas/api/get-upload-url.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(10),
      environment: {
        UPLOADS_BUCKET_NAME: uploadsBucket.bucketName
      }
    });

    uploadsBucket.grantPut(getUploadUrlFn);

    // Lambda: Sync to Destination (Plugin Processor)
    const syncDestinationFn = new lambdaNodejs.NodejsFunction(this, 'SyncDestinationFn', {
      entry: 'lambdas/plugins/sync-processor.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.minutes(15),
      memorySize: 1024,
      environment: {
        MEDIA_TABLE_NAME: mediaTable.tableName,
        PLUGIN_CONFIG_TABLE_NAME: pluginConfigTable.tableName
      }
    });

    mediaTable.grantReadWriteData(syncDestinationFn);
    pluginConfigTable.grantReadData(syncDestinationFn);
    uploadsBucket.grantRead(syncDestinationFn);

    // EventBridge rule para processar uploads com plugins
    new events.Rule(this, 'MediaUploadedRule', {
      eventBus,
      eventPattern: {
        source: ['media-manager.upload'],
        detailType: ['MediaUploaded']
      },
      targets: [new targets.LambdaFunction(syncDestinationFn)]
    });

    // ============================================
    // API Gateway
    // ============================================

    const api = new apigateway.RestApi(this, 'MediaApi', {
      restApiName: 'Media Manager API',
      description: 'API for Media Manager',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    // Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'ApiAuthorizer', {
      cognitoUserPools: [userPool]
    });

    // Endpoints
    const users = api.root.addResource('users');
    const user = users.addResource('{userId}');
    
    // GET /users/{userId}/media
    const media = user.addResource('media');
    media.addMethod('GET', new apigateway.LambdaIntegration(listMediaFn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    // POST /users/{userId}/media/upload-url
    const uploadUrl = media.addResource('upload-url');
    uploadUrl.addMethod('POST', new apigateway.LambdaIntegration(getUploadUrlFn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    // ============================================
    // Outputs
    // ============================================

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID'
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID'
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL'
    });

    new cdk.CfnOutput(this, 'UploadsBucketName', {
      value: uploadsBucket.bucketName,
      description: 'S3 Bucket for uploads'
    });

    new cdk.CfnOutput(this, 'ThumbnailsBucketName', {
      value: thumbnailsBucket.bucketName,
      description: 'S3 Bucket for thumbnails'
    });

    new cdk.CfnOutput(this, 'MediaTableName', {
      value: mediaTable.tableName,
      description: 'DynamoDB table for media items'
    });
  }
}
