import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

export async function DELETE(req: Request) {
const { key } = await req.json();

const command = new DeleteObjectCommand({
  Bucket: process.env.LIARA_BUCKET_NAME,
  Key: key,
});

await s3.send(command);

return Response.json({ message: "File deleted" });
}
