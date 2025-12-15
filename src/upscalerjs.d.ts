declare module 'upscalerjs' {
    export default class Upscaler {
        constructor(config?: any);
        execute(image: string | HTMLImageElement, options?: any): Promise<string>;
    }
}
