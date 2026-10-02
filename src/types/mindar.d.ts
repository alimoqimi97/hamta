declare global {
    interface Window {
        MINDAR: {
            IMAGE: {
                Compiler: new () => {
                    compileImageTargets(
                        images: HTMLImageElement[],
                        progressCallback?: (progress: number) => void
                    ): Promise<unknown>;

                    exportData(): Promise<ArrayBuffer>;
                };
            }
        };
    }
}

export { };