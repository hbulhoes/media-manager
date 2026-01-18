"use strict";
/**
 * AWS CDK Stack - Media Manager Infrastructure
 *
 * Define toda a infraestrutura serverless na AWS
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaManagerStack = void 0;
var cdk = __importStar(require("aws-cdk-lib"));
var dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
var s3 = __importStar(require("aws-cdk-lib/aws-s3"));
var lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
var lambdaNodejs = __importStar(require("aws-cdk-lib/aws-lambda-nodejs"));
var apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
var cognito = __importStar(require("aws-cdk-lib/aws-cognito"));
var events = __importStar(require("aws-cdk-lib/aws-events"));
var targets = __importStar(require("aws-cdk-lib/aws-events-targets"));
var s3n = __importStar(require("aws-cdk-lib/aws-s3-notifications"));
var MediaManagerStack = /** @class */ (function (_super) {
    __extends(MediaManagerStack, _super);
    function MediaManagerStack(scope, id, props) {
        var _this = _super.call(this, scope, id, props) || this;
        // ============================================
        // DynamoDB Tables
        // ============================================
        // Tabela principal de mídias
        var mediaTable = new dynamodb.Table(_this, 'MediaTable', {
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
        var pluginConfigTable = new dynamodb.Table(_this, 'PluginConfigTable', {
            tableName: 'plugin-configs',
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.RETAIN
        });
        // Tabela de jobs de importação
        var importJobsTable = new dynamodb.Table(_this, 'ImportJobsTable', {
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
        var uploadsBucket = new s3.Bucket(_this, 'UploadsBucket', {
            bucketName: "media-manager-uploads-".concat(_this.account),
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
        var thumbnailsBucket = new s3.Bucket(_this, 'ThumbnailsBucket', {
            bucketName: "media-manager-thumbnails-".concat(_this.account),
            encryption: s3.BucketEncryption.S3_MANAGED,
            publicReadAccess: false,
            removalPolicy: cdk.RemovalPolicy.RETAIN
        });
        // ============================================
        // Cognito
        // ============================================
        var userPool = new cognito.UserPool(_this, 'UserPool', {
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
        var userPoolClient = new cognito.UserPoolClient(_this, 'UserPoolClient', {
            userPool: userPool,
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
        var eventBus = new events.EventBus(_this, 'MediaEventBus', {
            eventBusName: 'media-manager-events'
        });
        // ============================================
        // Lambda Functions
        // ============================================
        // Layer compartilhado com dependências
        var sharedLayer = new lambda.LayerVersion(_this, 'SharedLayer', {
            code: lambda.Code.fromAsset('lambdas/layers/shared'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
            description: 'Shared dependencies for Lambda functions'
        });
        // Lambda: List Media
        var listMediaFn = new lambdaNodejs.NodejsFunction(_this, 'ListMediaFn', {
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
        var processUploadFn = new lambdaNodejs.NodejsFunction(_this, 'ProcessUploadFn', {
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
        uploadsBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(processUploadFn), { prefix: 'uploads/' });
        // Lambda: Get Upload URL
        var getUploadUrlFn = new lambdaNodejs.NodejsFunction(_this, 'GetUploadUrlFn', {
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
        var syncDestinationFn = new lambdaNodejs.NodejsFunction(_this, 'SyncDestinationFn', {
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
        new events.Rule(_this, 'MediaUploadedRule', {
            eventBus: eventBus,
            eventPattern: {
                source: ['media-manager.upload'],
                detailType: ['MediaUploaded']
            },
            targets: [new targets.LambdaFunction(syncDestinationFn)]
        });
        // ============================================
        // API Gateway
        // ============================================
        var api = new apigateway.RestApi(_this, 'MediaApi', {
            restApiName: 'Media Manager API',
            description: 'API for Media Manager',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS
            }
        });
        // Authorizer
        var authorizer = new apigateway.CognitoUserPoolsAuthorizer(_this, 'ApiAuthorizer', {
            cognitoUserPools: [userPool]
        });
        // Endpoints
        var users = api.root.addResource('users');
        var user = users.addResource('{userId}');
        // GET /users/{userId}/media
        var media = user.addResource('media');
        media.addMethod('GET', new apigateway.LambdaIntegration(listMediaFn), {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO
        });
        // POST /users/{userId}/media/upload-url
        var uploadUrl = media.addResource('upload-url');
        uploadUrl.addMethod('POST', new apigateway.LambdaIntegration(getUploadUrlFn), {
            authorizer: authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO
        });
        // ============================================
        // Outputs
        // ============================================
        new cdk.CfnOutput(_this, 'UserPoolId', {
            value: userPool.userPoolId,
            description: 'Cognito User Pool ID'
        });
        new cdk.CfnOutput(_this, 'UserPoolClientId', {
            value: userPoolClient.userPoolClientId,
            description: 'Cognito User Pool Client ID'
        });
        new cdk.CfnOutput(_this, 'ApiEndpoint', {
            value: api.url,
            description: 'API Gateway endpoint URL'
        });
        new cdk.CfnOutput(_this, 'UploadsBucketName', {
            value: uploadsBucket.bucketName,
            description: 'S3 Bucket for uploads'
        });
        new cdk.CfnOutput(_this, 'ThumbnailsBucketName', {
            value: thumbnailsBucket.bucketName,
            description: 'S3 Bucket for thumbnails'
        });
        new cdk.CfnOutput(_this, 'MediaTableName', {
            value: mediaTable.tableName,
            description: 'DynamoDB table for media items'
        });
        return _this;
    }
    return MediaManagerStack;
}(cdk.Stack));
exports.MediaManagerStack = MediaManagerStack;
