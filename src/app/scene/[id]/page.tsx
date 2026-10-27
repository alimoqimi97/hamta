import ArVideoViewer from "@/components/ar-video-viewer";

type ScenePageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ScenePage({
    params,
}: ScenePageProps) {
    const { id } = await params;

    console.log("id==================== ", id)

    return (
        <main>
            <ArVideoViewer />
        </main>
    );
}
