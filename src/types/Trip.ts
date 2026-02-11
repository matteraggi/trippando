import { Timestamp } from 'firebase/firestore';

export interface Trip {
    id: string;
    name: string;
    coverImage?: string;
    icon?: string;
    color?: string;
    startDate: Timestamp;
    endDate: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    members: string[]; // Array of user UIDs
}
