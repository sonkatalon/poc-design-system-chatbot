import { bedrock } from "@cdklabs/generative-ai-cdk-constructs";
import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const knowledgeBase = new bedrock.KnowledgeBase(this, "knowledgeBase", {
      embeddingsModel: bedrock.BedrockFoundationModel.TITAN_EMBED_TEXT_V1,
    });

    const docsBucket = new s3.Bucket(this, "docsBucket", {
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const s3DataSource = new bedrock.S3DataSource(this, "s3DataSource", {
      bucket: docsBucket,
      knowledgeBase: knowledgeBase,
    });

    const user = new iam.User(this, "user");
    const accessKey = new iam.AccessKey(this, "accessKey", { user });
    const policy = new iam.Policy(this, "policy", {
      statements: [
        new iam.PolicyStatement({
          actions: ["bedrock:Retrieve"],
          resources: [knowledgeBase.knowledgeBaseArn],
        }),
        new iam.PolicyStatement({
          actions: ["bedrock:InvokeModelWithResponseStream"],
          resources: ["*"],
        }),
      ],
    });
    policy.attachToUser(user);

    new CfnOutput(this, "AwsAccessKeyId", { value: accessKey.accessKeyId });
    new CfnOutput(this, "AwsRegion", { value: this.region });
    new CfnOutput(this, "AwsSecretAccessKey", {
      value: accessKey.secretAccessKey.unsafeUnwrap(),
    });
    new CfnOutput(this, "DocsBucketName", { value: docsBucket.bucketName });
    new CfnOutput(this, "KnowledgeBaseId", {
      value: knowledgeBase.knowledgeBaseId,
    });
  }
}
