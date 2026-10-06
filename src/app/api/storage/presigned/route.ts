import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";

export async function POST(req: Request) {
const { key } = await req.json();

const command = new GetObjectCommand({
  Bucket: process.env.LIARA_BUCKET_NAME,
  Key: key,
});

const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

return Response.json({ url });
}
