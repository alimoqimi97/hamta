// src/app/storage/page.tsx or /app/storage/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function FileManager() {
    const [files, setFiles] = useState<File[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchFiles = async () => {
        const res = await fetch('/api/storage/list-files');
        const data = await res.json();
        return data;
    };

    const uploadFile = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/storage/upload', {
            method: 'POST',
            body: formData,
        });
        setLoading(false);
        if (res.ok) {
            toast.success('Upload Successful');
            const data = await fetchFiles();
            setFiles(data.files || []);
        } else {
            toast.error('Error uploading file');
        }
    };

    const deleteFile = async (key: string) => {
        const res = await fetch('/api/storage/delete', {
            method: 'DELETE',
            body: JSON.stringify({ key }),
        });
        if (res.ok) {
            toast.success('File deleted successfully');
            fetchFiles();
        } else {
            toast.error('Error deleting file');
        }
    };

    const downloadFile = async (key: string) => {
        const res = await fetch('/api/storage/presigned', {
            method: 'POST',
            body: JSON.stringify({ key }),
        });
        const data = await res.json();
        window.open(data.url, '_blank');
    };

    useEffect(() => {
        const loadFiles = async () => {
            setLoading(true);

            try {
                const data = await fetchFiles();
                setFiles(data.files || []);
            } finally {
                setLoading(false);
                toast("Failed to load files")
            }
        };

        loadFiles();
    }, []);

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Managing Files</h1>

            <div className="flex gap-2 mb-4">
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <Button onClick={uploadFile} disabled={loading || !file}>
                    {loading ? 'Uploading...' : 'Uploading file'}
                </Button>
            </div>

            <div className="grid gap-2">
                {files.map((file) => (
                    <Card key={file.Key} className="flex items-center justify-between p-2">
                        <CardContent className="flex-1 truncate">{file.Key}</CardContent>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => downloadFile(file.Key)}>Download</Button>
                            <Button variant="destructive" onClick={() => deleteFile(file.Key)}>Delete</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
