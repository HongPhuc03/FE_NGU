declare module 'cloudinary-react' {
    import { Component } from 'react';
    
    export class CloudinaryContext extends Component<React.PropsWithChildren<Record<string, unknown>>> {}
    export interface ImageProps {
        publicId: string;
        [key: string]: unknown;
    }
    export class Image extends Component<ImageProps> {}
} 